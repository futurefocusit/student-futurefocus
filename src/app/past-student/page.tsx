"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { TeamMember } from "@/types/types";
import { hasPermission } from "@/libs/hasPermission";
import Loader from "@/components/loader";

import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

interface Course {
  _id: string;
  title: string;
  shifts: { _id: string; name: string }[];
}

interface registrationData {
  name: string;
  email: string;
  phone: string;
  selectedCourse: string;
  selectedShift: string;
  intake: string;
  message: string;
  payment: string;
  user: string | undefined;
  status: string | null;
}

const Past: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [formData, setFormData] = useState<registrationData>({
    name: "",
    email: "",
    phone: "",
    selectedCourse: "",
    selectedShift: "",
    intake: "",
    message: "",
    user: loggedUser?.name,
    payment: "cash",
    status: "completed",
  });
  const [intakes, setIntakes] = useState<{ _id: string; intake: string }[]>([]);
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);

  // Form validation state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    selectedCourse: "",
    selectedShift: "",
    intake: "",
    status: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/course`);
        await fetchLoggedUser();
        setCourses(response.data);

        if (response.data.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            selectedCourse: response.data[0].title,
            selectedShift: response.data[0].shifts[0]._id,
          }));
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load courses.");
        setLoading(false);
        console.log(err);
      }
    };

    const getIntakes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/others/intake`);
        setIntakes(response.data.intakes);
        if (response.data.length > 0) {
          setFormData((prevData) => ({
            ...prevData,
            intake: response.data.intakes[0].intake,
          }));
        }
      } catch (error) {
        console.log(error);
        setError("Failed to load intakes.");
      }
    };

    getIntakes();
    fetchCourses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "selectedCourse") {
      const selectedCourse = courses.find((course) => course.title === value);
      if (selectedCourse) {
        setFormData((prevData) => ({
          ...prevData,
          selectedShift: selectedCourse.shifts[0]._id,
        }));
      }
    }

    // Reset validation error for the specific field when user changes input
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
//@ts-expect-error type rro
    if (!formData.name) newErrors.name = "Full Name is required";

    // Email validation
    if (!formData.email) {
//@ts-expect-error type rro
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//@ts-expect-error type rro

      newErrors.email = "Email is invalid";
    }

    // Phone validation
//@ts-expect-error type rro

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) {
//@ts-expect-error type rro
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Course and shift validation
//@ts-expect-error type rro
    if (!formData.selectedCourse) newErrors.selectedCourse = "Course is required";
//@ts-expect-error type rro
    if (!formData.selectedShift) newErrors.selectedShift = "Shift is required";

    // Intake validation
//@ts-expect-error type rro
    if (!formData.intake) newErrors.intake = "Intake is required";

    // Status validation
//@ts-expect-error type rro
    if (!formData.status) newErrors.status = "Status is required";
//@ts-expect-error type rro
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmissionResult(null);

    // Validate form
    if (!validateForm()) return;

    try {
      formData.user = loggedUser?.name;
      const response = await axios.post(
        `${API_BASE_URL}/students/past`,
        formData,
        {
          headers: {
         
              Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
            
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data && response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success("Student added successfully");
      }

      // Reset formData including clearing radio buttons (status)
      setFormData({
        name: "",
        email: "",
        phone: "",
        selectedCourse: courses.length > 0 ? courses[0].title : "",
        selectedShift: courses.length > 0 ? courses[0].shifts[0]._id : "",
        message: "",
        intake: intakes.length > 0 ? intakes[0].intake : "",
        user: loggedUser?.name,
        payment: "",
        status: null, // Clear status field to reset radio button
      });

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "An error occurred. Please try again.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div>
        <SideBar />
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SideBar />
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 my-32 pl-32 lg:pl-6 my bg-white shadow-md rounded-lg ">
      <SideBar />
      <a
        href="/students"
        className="p-2 fixed top-3 left-52 bg-blue-600 text-white hover:bg-blue-500 rounded-md"
      >
        Back
      </a>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
        FILL OUT THE FORM
      </h2>
      {submissionResult && (
        <div
          className={`mb-4 p-4 rounded-md ${
            submissionResult.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submissionResult}
        </div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-700">
              FULL NAME
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-700">
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-extrabold text-gray-700">
            PHONE
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-extrabold text-gray-700">
            SELECT COURSE
          </label>
          <select
            name="selectedCourse"
            value={formData.selectedCourse}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {courses.map((course) => (
              <option key={course.title} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          {errors.selectedCourse && (
            <p className="text-sm text-red-600">{errors.selectedCourse}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-extrabold text-gray-700">
            SELECT SHIFT
          </label>
          <select
            name="selectedShift"
            value={formData.selectedShift}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {courses
              .find((course) => course._id === formData.selectedCourse)
              ?.shifts.map((shift) => (
                <option key={shift._id} value={shift._id}>
                  {shift.name}
                </option>
              ))}
          </select>
          {errors.selectedShift && (
            <p className="text-sm text-red-600">{errors.selectedShift}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-extrabold text-gray-700">
            SELECT INTAKE
          </label>
          <input
            type="month"
            name="intake"
            value={formData.intake}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.intake && (
            <p className="text-sm text-red-600">{errors.intake}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-extrabold text-gray-700">
            Status
          </label>
          <div className="mt-1 flex gap-10  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <p className="inline">droppout</p>
            <input
              type="radio"
              value="droppedout"
              name="status"
              required
              onChange={handleChange}
              className="mt-1   px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mt-1 flex  gap-10  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <p>completed</p>
            <input
              type="radio"
              required
              value="completed"
              name="status"
              onChange={handleChange}
              className="mt-1   px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status}</p>
          )}
        </div>
        <div className="text-center">
          {hasPermission(loggedUser as TeamMember, "students", "register") ? (
            <button
              onClick={() => handleSubmit()}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-extrabold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              SUBMIT
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Past);