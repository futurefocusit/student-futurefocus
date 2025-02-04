import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";

interface PopupFormProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  categories:{_id:string, name:string}[]
}

export const PopupForm: React.FC<PopupFormProps> = ({ onClose, onSuccess,categories }) => {
  const [formData, setFormData] = useState({
    materialName: "",
    amount: 1,
    category: "",
    SN:"",
    type:""
  });
 const fetchMaterials = async () => {
   try {
     const response = await axios.get(`${API_BASE_URL}/inventory`);
   } catch (error) {
    console.log(error)
   }
 };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/inventory`, formData);
      onSuccess("Material added successfully!");
      await fetchMaterials()
    } catch (error) {
      onSuccess("Failed to add material");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md w-1/3"
      >
        <h2 className="text-xl font-semibold mb-4">Add Material</h2>
        <input
          type="text"
          name="materialName"
          value={formData.materialName}
          onChange={handleChange}
          placeholder="Material Name"
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="text"
          name="SN"
          value={formData.SN}
          onChange={handleChange}
          placeholder="Serial Number"
          className="border p-2 mb-4 w-full"
        />
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="Type"
          className="border p-2 mb-4 w-full"
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="border p-2 mb-4 w-full"
          min="1"
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        >
          {categories.map((category, index) => (
            <option key={index} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};


export const PopupFormCategory: React.FC<PopupFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
  });
  const fetchCategory = async () => {
    try {
     await axios.get(`${API_BASE_URL}/inventory/category`);

    } catch (error) {
   console.log(error)
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/inventory/category`, formData);
      onSuccess("Category added successfully!");
      await fetchCategory()
    } catch (error) {
      onSuccess("Failed to add material");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md w-1/3"
      >
        <h2 className="text-xl font-semibold mb-4">Add Category</h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Material Name"
          className="border p-2 mb-4 w-full"
          required
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};








