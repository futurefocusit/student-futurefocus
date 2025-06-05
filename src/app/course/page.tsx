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
import { CloudUpload, School, Star, AttachMoney, Schedule } from "@mui/icons-material";
import { TextField, FormControl, InputLabel, Grid, Rating, Chip, OutlinedInput, Select, MenuItem } from "@mui/material";

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
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
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
    <div className="max-w-7xl mx-auto py-6 md:mx-36 sm:px-6 lg:px-8">
      <SideBar />
      <div className="flex justify-end gap-5 ld:justify-between  items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900 ">COURSES</h1>
        <button
          disabled={!canCreate}
          onClick={() => setIsAddModalOpen(true)}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${!canCreate
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          ADD NEW COURSE
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-center">
            Add New Course
          </h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <Grid container spacing={3}>
              {/* Course Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <School className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              {/* Rating */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <Rating
                    name="rating"
                    value={Number(formData.rating)}
                    onChange={(_, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        rating: newValue || 1
                      }));
                    }}
                    precision={1}
                    max={5}
                  />
                </FormControl>
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Image (WebP format only)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        <CloudUpload className="mr-2" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    {formData.image && (
                      <div className="relative w-20 h-20">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 2MB. Only WebP format is supported.
                  </p>
                </div>
              </Grid>

              {/* Scholarship and Non-Scholarship */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scholarship Available"
                  name="scholarship"
                  type="number"
                  value={formData.scholarship}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AttachMoney className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Non-Scholarship Available"
                  name="nonScholarship"
                  type="number"
                  value={formData.nonScholarship}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AttachMoney className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              {/* Shifts */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Shifts
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border rounded-md">
                    {shifts.map((shift) => (
                      <label key={shift._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.shifts.some(s => s._id === shift._id)}
                          onChange={() => handleShiftChange(shift)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {shift.start} - {shift.end}
                        </span>
                      </label>
                    ))}
                  </div>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors"
                >
                  Add Course
                </button>
              </Grid>
            </Grid>
          </form>
        </div>
      </Modal>

      {/* Update Course Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-center">
            Update Course
          </h2>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <Grid container spacing={3}>
              {/* Course Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <School className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              {/* Rating */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <Rating
                    name="rating"
                    value={Number(formData.rating)}
                    onChange={(_, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        rating: newValue || 1
                      }));
                    }}
                    precision={1}
                    max={5}
                  />
                </FormControl>
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Image (WebP format only)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-update"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload-update"
                        className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        <CloudUpload className="mr-2" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    {formData.image && (
                      <div className="relative w-20 h-20">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 2MB. Only WebP format is supported.
                  </p>
                </div>
              </Grid>

              {/* Scholarship and Non-Scholarship */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scholarship Available"
                  name="scholarship"
                  type="number"
                  value={formData.scholarship}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AttachMoney className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Non-Scholarship Available"
                  name="nonScholarship"
                  type="number"
                  value={formData.nonScholarship}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AttachMoney className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              {/* Shifts */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Shifts
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border rounded-md">
                    {shifts.map((shift) => (
                      <label key={shift._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.shifts.some(s => s._id === shift._id)}
                          onChange={() => handleShiftChange(shift)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {shift.start} - {shift.end}
                        </span>
                      </label>
                    ))}
                  </div>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors"
                >
                  Update Course
                </button>
              </Grid>
            </Grid>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default withAdminAuth(CoursesComponent);

