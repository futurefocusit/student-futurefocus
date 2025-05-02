"use client";

import React, { useState, useEffect } from "react";

import withAdminAuth from "@/components/withAdminAuth";
import { toast } from "react-toastify";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { addCourse, Course, deleteCourse, getCourses, updateCourse } from "@/context/courseContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/libs/hasPermission";
import Modal from "@/components/Modal";
import SideBar from "@/components/SideBar";

const CoursesComponent: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [shifts, setShifts] = useState<
    { _id: string; name: string, start: string; end: string }[]
  >([]);
  const [togglesActive, setTogglesActive] = useState<{
    [key: string]: boolean;
  }>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Course>({
    title: "",
    rating: 1,
    image: "",
    active: false,
    scholarship: 0,
    nonScholarship: 0,
    shifts: [],
  });
  const { loggedUser, fetchLoggedUser } = useAuth()
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          console.error("Unexpected data format:", response.data);
          setCourses([]);
        }
        await fetchLoggedUser();
      } catch (error) {
        console.error("Error fetching courses", error);
        toast.error("Failed to load courses.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    const getShifts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/others/shift`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          }
        });
        setShifts(response.data.shifts);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load shifts.");
      }
    };

    fetchCourses();
    getShifts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = async (course: Course) => {
    try {
      await updateCourse(course._id, {
        active: !course.active,
        title: course.title,
        rating: course.rating,
        image: course.image,
        scholarship: course.scholarship,
        nonScholarship: course.nonScholarship,
        shifts: course.shifts || []
      });

      setTogglesActive((prev) => ({
        ...prev,
        [course._id]: !prev[course._id],
      }));
      toast.success("switched succsfully");
    } catch (error) {
      console.log(error)
      toast.error("failed to switch");
    }
  };
  const handleShiftChange = (
    shift: { _id: string; name: string; start: string; end: string }
  ) => {
    setFormData((prevData) => {
      const newShifts = prevData.shifts.includes(shift)
        ? prevData.shifts.filter((shift) => shift !== shift)
        : [...prevData.shifts, shift];
      return { ...prevData, shifts: newShifts };
    });
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newCourse: Course = {
        title: formData.title,
        rating: Number(formData.rating),
        image: formData.image,
        scholarship: Number(formData.scholarship),
        nonScholarship: Number(formData.nonScholarship),
        shifts: formData.shifts,
        active: formData.active,
      };
      const response = await addCourse(newCourse);
      setCourses([...courses, response.data]);
      toast.success("Course added successfully!");
    } catch (error) {
      toast.error("Failed to add course.");
      console.error("Error adding course", error);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const updatedCourse: Course = {
        ...editingCourse,
        title: formData.title,
        rating: Number(formData.rating),
        image: formData.image,
        scholarship: Number(formData.scholarship),
        nonScholarship: Number(formData.nonScholarship),
        shifts: formData.shifts,
        active: formData.active,
      };

      if (editingCourse?._id) {
        await updateCourse(editingCourse._id, updatedCourse);
        setCourses(
          courses.map((c) => (c._id === editingCourse._id ? updatedCourse : c))
        );
        toast.success("Course updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update course.");
      console.error("Error updating course", error);
    } finally {
      setIsUpdateModalOpen(false);
      setEditingCourse(null);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    try {
      if (id) {
        await deleteCourse(id);
        setCourses(courses.filter((c) => c._id !== id));
        toast.success("Course deleted successfully!");
      } else {
        console.error("No id found for the course. Cannot delete.");
      }
    } catch (error) {
      toast.error("Failed to delete course.");
      console.error("Error deleting course", error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      rating: course.rating,
      active: course.active,
      image: course.image,
      scholarship: course.scholarship,
      nonScholarship: course.nonScholarship,
      shifts: course.shifts || [],
    });
    setIsUpdateModalOpen(true);
  };

  const canCreate = loggedUser
    ? hasPermission(loggedUser, "courses", "create")
    : false;
  const canUpdate = loggedUser
    ? hasPermission(loggedUser, "courses", "update")
    : false;
  const canDelete = loggedUser
    ? hasPermission(loggedUser, "courses", "delete")
    : false;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <SideBar />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
        <button
          disabled={!canCreate}
          onClick={() => setIsAddModalOpen(true)}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${!canCreate
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          Add New Course
        </button>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {course.title}
                </h3>
                <div className="flex items-center mt-2 justify-between">
                  <div className="">
                    <span className="text-yellow-400">
                      {"★".repeat(course.rating)}
                    </span>
                    <span className="ml-1 text-gray-500">
                      ({course.rating})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`course-${course._id}`}
                      className="toggle-checkbox hidden"
                      checked={course.active}
                      onChange={() => handleToggleActive(course)}
                    />
                    <div
                      onClick={() => handleToggleActive(course)}
                      className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${course.active
                        ? "bg-blue-500"
                        : "bg-gray-300"
                        }`}
                    >
                      <div
                        className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${course.active
                          ? "translate-x-6 md:translate-x-8"
                          : ""
                          }`}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    disabled={!canUpdate}
                    onClick={() => handleEdit(course)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${!canUpdate
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                  >
                    Update
                  </button>
                  <button
                    disabled={!canDelete}
                    onClick={() => handleDelete(course._id)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${!canDelete
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "text-red-700 bg-red-100 hover:bg-red-200"
                      }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No courses available.</p>
      )}

      {/* Add Course Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Add New Course</h2>
        <form onSubmit={handleAddSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Course Title"
            className="input mb-4 w-full"
            required
          />
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            placeholder="Rating"
            className="input mb-4 w-full"
            min="1"
            max="5"
            required
          />
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="input mb-4 w-full"
          />
          <input
            type="number"
            name="scholarship"
            value={formData.scholarship}
            onChange={handleChange}
            placeholder="Scholarship Available"
            className="input mb-4 w-full"
            required
          />
          <input
            type="number"
            name="nonScholarship"
            value={formData.nonScholarship}
            onChange={handleChange}
            placeholder="Non-Scholarship Available"
            className="input mb-4 w-full"
            required
          />
          <div className="mb-4">
            <p className="font-medium">Shifts:</p>
            {shifts.map((shift) => (
              <div key={shift._id}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.shifts.includes(shift)}
                    onChange={() => handleShiftChange(shift)}
                    className="mr-2"
                  />
                  {shift.start} - {shift.end}
                </label>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Course
            </button>
          </div>
        </form>
      </Modal>

      {editingCourse && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
        >
          <h2 className="text-xl font-bold mb-4">Update Course</h2>
          <form onSubmit={handleUpdateSubmit}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Course Title"
              className="input mb-4 w-full border-2 rounded-md p-2 "
              required
            />
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="Rating"
              className="input mb-4 w-full border-2 rounded-md p-2"
              min="1"
              max="5"
              required
            />
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="input mb-4 w-full border-2 rounded-md p-2"
            />
            <input
              type="number"
              name="scholarship"
              value={formData.scholarship}
              onChange={handleChange}
              placeholder="Scholarship Available"
              className="input mb-4 w-full border-2 rounded-md p-2"
              required
            />
            <input
              type="number"
              name="nonScholarship"
              value={formData.nonScholarship}
              onChange={handleChange}
              placeholder="Non-Scholarship Available"
              className="input mb-4 w-full border-2 rounded-md p-2"
              required
            />
            <div className="mb-4">
              <p className="font-medium">Shifts:</p>
              <div className="border-2 rounded-md p-2 ">
                {shifts.map((shift) => (
                  <label key={shift._id} className="flex items-center ">
                    <input
                      type="checkbox"
                      checked={formData.shifts.some(
                        (item) => item._id === shift._id
                      )}
                      onChange={() => handleShiftChange(shift)}
                      className="mr-2"
                    />
                    {shift.start} - {shift.end}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Course
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>

  );
};

export default withAdminAuth(CoursesComponent);

