import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";

interface PopupFormProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  categories:[]
}

export const PopupForm: React.FC<PopupFormProps> = ({ onClose, onSuccess,categories }) => {
  const [formData, setFormData] = useState({
    materialName: "",
    amount: 1,
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/inventory`, formData);
      onSuccess("Material added successfully!");
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
          //@ts-expect-error ERROR
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
      
        >
          {
            categories.map((category, index) => (
              //@ts-expect-error error
              <option key={index} value={category._id}>{category.name}</option>
              ))
          }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/inventory/category`, formData);
      onSuccess("Category added successfully!");
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



interface PopupRentFormProps {
  material: {
    _id: string;
    materialName: string;
    amount: number;
  };
  loggedUser:{
    _id:string
  }
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const PopupRentForm: React.FC<PopupRentFormProps> = ({
  loggedUser,
  material,
  onClose,
  onSuccess,
}) => {
    const [error, setError] = useState<string | null>(null);
 const [formData, setFormData] = useState({
   amount:0,
   returnDate:"",
   rendeeName:'',
   const:0
  
 });

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });
 };

  const handleRent = async () => {
   
    try {

      const response = await axios.post(`${API_BASE_URL}/inventory/${material._id}`, {
        amount: formData.amount,
        returnDate: formData.returnDate,
        rendeeName:formData.rendeeName,
        const:formData.const,
        render:loggedUser._id
      });

      onSuccess(
        `Successfully rented ${material.materialName} `
      );
      onClose(); 
    } catch (err) {
      setError("Failed to rent the material.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Rent Material</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Material: {material.materialName}
          </label>
          <label className="block text-sm font-medium mb-1">
            Amount Available: {material.amount}
          </label>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Return Date:
          </label>
          <input
            type="Date"
            id="return"
            name="returnDate"
            // value={formData.returnDate}
            onChange={(e) => handleChange(e)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Amount:
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            // value={formData.returnDate}
            onChange={(e) => handleChange(e)}
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter Amount"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Rent To:
          </label>
          <input
            type="text"
            id="return"
            name="rendeeName"
            // value={formData.returnDate}
            onChange={(e) => handleChange(e)}
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter Person To Rent"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Cost for all:
          </label>
          <input
            type="number"
            id="return"
            name="cost"
            // value={formData.returnDate}
            onChange={(e) => handleChange(e)}
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Enter Cost for all"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleRent}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Rent
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupRentForm;

