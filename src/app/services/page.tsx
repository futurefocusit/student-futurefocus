"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as FaIcons from "react-icons/fa"; // Import all icons
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import SideBar from "@/components/SideBar";
import { hasPermission } from "@/libs/hasPermission";
import { IUser } from "@/types/types";
import { Layout } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";


interface Service {
  _id: string;
  icon: string; // Icon name
  title: string;
  subservices: string[];
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [iconName, setIconName] = useState<string>("FaStar"); // Default icon
  const [userData, setUserData] = useState<IUser>();
  const { loggedUser, fetchLoggedUser } =
  useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/service`,{
        headers:{
          "Authorization":`Bearer ${localStorage.getItem('ffa-admin')}`
        }
      });
      setServices(response.data);
      setError(null); // Clear error if fetch is successful
      await fetchLoggedUser();
      setUserData(loggedUser);
    } catch (error) {
      console.error("Error fetching services", error);
      setError("Failed to fetch services. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const serviceData = {
      title: formData.get("title") as string,
      subservices: (formData.get("subservices") as string)
        .split(",")
        .map((s) => s.trim()),
      icon: iconName, // Use entered icon name
    };

    try {
      if (editingService) {
        await axios.put(
          `${API_BASE_URL}/service/update/${editingService._id}`,
          serviceData,{
            headers:{
              "Authorization":`Bearer ${localStorage.getItem('ffa-admin')}`
            }
          }
        );
        setSuccessMessage("Service updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/service/new`, serviceData);
        setSuccessMessage("Service added successfully!");
      }
      fetchServices();
      setIsModalOpen(false);
      setEditingService(null);
      setIconName("FaStar"); // Reset icon selection
    } catch (error) {
      console.error("Error saving service", error);
      setError("Failed to save service. Please try again.");
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIconName(e.target.value);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIconName(service.icon); // Set the icon name when editing
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await axios.delete(`${API_BASE_URL}/service/delete/${id}`,{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem('ffa-admin')}`
          }
        });
        setSuccessMessage("Service deleted successfully!");
        fetchServices();
      } catch (error) {
        console.error("Error deleting service", error);
        setError("Failed to delete service. Please try again.");
      }
    }
  };

  // Function to render icon based on name
  const renderIcon = (iconName: string) => {
    const IconComponent = FaIcons[iconName as keyof typeof FaIcons]; // Get the icon component by name
    return IconComponent ? (
      <IconComponent className="text-7xl mx-auto" />
    ) : (
      <FaIcons.FaStar className="text-7xl mx-auto" />
    ); 
  };

  return (
    <><SideBar /><div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
        <button
          disabled={!hasPermission(userData as IUser, "services", "create")}
          onClick={() => setIsModalOpen(true)}
          className={`${!hasPermission(userData as IUser, "courses", "create")
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500"} text-white px-4 py-2 rounded`}
        >
          Add New Service
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="text-2xl">
                {renderIcon(service.icon)} {/* Display icon */}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                {service.title}
              </h3>
              <ul className="mt-2">
                {service.subservices.map((subservice, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    - {subservice}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between">
                <button
                  disabled={!hasPermission(userData as IUser, "courses", "update")}
                  onClick={() => handleEdit(service)}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${!hasPermission(userData as IUser, "courses", "update")
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"}`}
                >
                  Update
                </button>
                <button
                  disabled={!hasPermission(userData as IUser, "courses", "delete")}
                  onClick={() => handleDelete(service._id)}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${!hasPermission(userData as IUser, "courses", "delete")
                      ? "bg-gray-400 cursor-not-allowed"
                      : "text-red-700 bg-red-100 hover:bg-red-200"}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
          setIconName("FaStar"); // Reset icon name on modal close
        } }
      >
        <h2 className="text-xl font-bold mb-4">
          {editingService ? "Update" : "Add"} Service
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            defaultValue={editingService?.title || ""}
            required
            placeholder="Service Title"
            className="mb-2 w-full px-3 py-2 border rounded" />
          <textarea
            name="subservices"
            defaultValue={editingService?.subservices.join(", ") || ""}
            required
            placeholder="Subservices (comma-separated)"
            className="mb-2 w-full px-3 py-2 border rounded"
            rows={4} />
          <input
            type="text"
            name="icon"
            value={iconName}
            onChange={handleIconChange}
            required
            placeholder="Icon Name (e.g., FaStar)"
            className="mb-2 w-full px-3 py-2 border rounded" />
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded"
          >
            {editingService ? "Update" : "Add"} Service
          </button>
        </form>
      </Modal>
    </div></>
  );
};

export default withAdminAuth(ServicesPage);
