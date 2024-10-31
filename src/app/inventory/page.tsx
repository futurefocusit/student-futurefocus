"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "@/components/message";
import PopupRentForm, {
  PopupForm,
  PopupFormCategory,
} from "@/components/inventoryPopup";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import withAdminAuth from "@/components/withAdminAuth";

const MaterialManagement: React.FC = () => {
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [category, setCategory] = useState([]);
  const [rentedMaterials, setRentedMaterials] = useState([]);
  const [showPopupNM, setShowPopupNM] = useState(false);
  const [showPopupNC, setShowPopupNC] = useState(false);
  const [showPopupRent, setShowPopupRent] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "materials" | "rented" | "category"
  >("materials");

  const fetchMaterials = async () => {
    try {
      await fetchLoggedUser();
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      setMaterials(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load materials" });
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/category`);
      setCategory(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load category" });
    }
  };

  const fetchRented = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/rent`);
      setRentedMaterials(response.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load rented materials" });
    }
  };
  const handleReturn = async (id:string) => {
    try {
     await axios.put(`${API_BASE_URL}/inventory/${id}`,{
      receiver:loggedUser?._id
     });
     toast.success('item returned')
    } catch (error) {
      toast.error("failed to return item");
    }
  };

  useEffect(() => {
    fetchRented();
    fetchMaterials();
    fetchCategory();
  }, []);

  const handleRentSuccess = (message: string) => {
    setMessage({ type: "success", text: message });
    setShowPopupRent(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Material Management</h1>

      {message && <Message type={message.type} text={message.text} />}

      <div className="flex gap-5 mb-4">
        <button
          onClick={() => setShowPopupNC(true)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add New Category
        </button>
        <button
          onClick={() => setShowPopupNM(true)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add New Material
        </button>
      </div>

      <div className="flex gap-5 mb-4">
        <button
          onClick={() => setActiveTab("materials")}
          className={`mr-2 px-4 py-2 rounded ${
            activeTab === "materials" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveTab("rented")}
          className={`px-4 py-2 rounded ${
            activeTab === "rented" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Rented Materials
        </button>
        <button
          onClick={() => setActiveTab("category")}
          className={`px-4 py-2 rounded ${
            activeTab === "category" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Category
        </button>
      </div>

      {activeTab === "materials" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Materials</h2>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Material Name</th>
                <th className="border border-gray-300 p-2">Amount</th>
                <th className="border border-gray-300 p-2">Category</th>
                <th className="border border-gray-300 p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                // @ts-expect-error error
                <tr key={material._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {material.materialName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {material.amount}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {material.category.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => {
                        setSelectedMaterial(material);
                        setShowPopupRent(true);
                      }}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Rent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "rented" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Rented Materials</h2>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Material Name</th>
                <th className="border border-gray-300 p-2">Amount</th>
                <th className="border border-gray-300 p-2">Date Rent</th>
                <th className="border border-gray-300 p-2">Date Return</th>
                <th className="border border-gray-300 p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rentedMaterials.map((rented) => (
                //@ts-expect-error error
                <tr key={rented._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {rented.materialId.materialName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {rented.amount}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {rented.returnDate}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {rented.returnDate}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {rented.returned?rented.returnedDate:(<button onClick={()=>handleReturn(rented._id)} className='text-white bg-blue-700 p-2 rounded hover:bg-blue-500'>Return</button>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "category" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Category Name</th>
              </tr>
            </thead>
            <tbody>
              {category.map((category) => (
                // @ts-expect-error error
                <tr key={category._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">
                    {/* @ts-expect-error error */}
                    {category.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPopupNM && (
        <PopupForm
          categories={category as never}
          onClose={() => setShowPopupNM(false)}
          onSuccess={handleRentSuccess}
        />
      )}
      {showPopupNC && (
        <PopupFormCategory
          categories={[]}
          onClose={() => setShowPopupNC(false)}
          onSuccess={handleRentSuccess}
        />
      )}
      {showPopupRent && selectedMaterial && (
        <PopupRentForm
          loggedUser={loggedUser as { _id: string }}
          material={selectedMaterial}
          onClose={() => setShowPopupRent(false)}
          onSuccess={handleRentSuccess}
        />
      )}
    </div>
  );
};

export default withAdminAuth(MaterialManagement);
