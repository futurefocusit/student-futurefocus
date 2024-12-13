"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "@/components/message";
import {
  PopupForm,
  PopupFormCategory,
} from "@/components/inventoryPopup";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import withAdminAuth from "@/components/withAdminAuth";
import SideBar from "@/components/SideBar";
import Loader from "@/components/loader";
import { ShoppingCart } from "lucide-react";
import { CartItem, useCart } from "@/context/cartContext";
import Cart from "@/components/cart";
interface IMaterial {
  _id:string
  materialName: string;
  category: {name:string,_id:string};
  amount: number;
  SN:string,
  type:string
  rent: number;
}
export interface IMaterialRent {
  _id:string
  materialId: IMaterial;
  render: {name:string,_id:string};
  receiver: {name:string,_id:string};
  rendeeName: string; 
  returnDate: Date;
  returnedDate: Date;
  returned:boolean
  amount: number;
  cost: number;
  createdAt:Date
  
}
const MaterialManagement: React.FC = () => {
  const { fetchLoggedUser, loggedUser } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [category, setCategory] = useState([]);
  const [rentedMaterials, setRentedMaterials] = useState<IMaterialRent[]>([]);
  const [showPopupNM, setShowPopupNM] = useState(false);
  const [showPopupNC, setShowPopupNC] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCart, setShowCart] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"materials" | "rented" | "category">("materials");

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      setMaterials(response.data);
      await fetchLoggedUser();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load materials" });
    } finally {
      setLoading(false);
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

  const handleReturn = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/inventory/${id}`, {
        receiver: loggedUser?._id,
      });
      toast.success("Item returned");
      await fetchRented();
    } catch (error) {
      toast.error("Failed to return item");
    }
  };

  useEffect(() => {
    fetchRented();
    fetchMaterials();
    fetchCategory();
  }, []);

  const handleRentSuccess = (message: string) => {
    setMessage({ type: "success", text: message });
  };

  const handleAddToCart = (material:CartItem) => {
    const amount = 1; // Default amount
    if (material.amount - material.rent < amount) {
      toast.error("This item hit maximum");
      return;
    }
    addToCart(material, amount);
    toast.success("Added to cart");
  };

  const handleUpdate = async (material:IMaterial) => {
    try {
      // Simulating the updated material's data. You may want to open a form for this.
      const updatedMaterial = {
        materialName: material.materialName, // Replace with updated values
        amount: material.amount, // Replace with updated values
        rent: material.rent, // Replace with updated values
        category: material.category._id, // Replace with updated category ID
      };
      
      await axios.patch(`${API_BASE_URL}/inventory/${material._id}`, updatedMaterial);
      toast.success("Material updated successfully!");
      fetchMaterials(); // Refetch materials to reflect changes
    } catch (error) {
      toast.error("Failed to update material.");
    }
  };

  const handleDelete = async (material:IMaterial) => {
    try {
      await axios.delete(`${API_BASE_URL}/inventory/${material._id}`);
      toast.success("Material deleted successfully!");
      fetchMaterials(); // Refetch materials to reflect changes
    } catch (error) {
      toast.error("Failed to delete material.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20">
        <SideBar />
        <Loader />
      </div>
    );
  }

  return (
    <>
      <SideBar />
      <div className="p-4 mx-auto container">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-center">INVENTORY MANAGEMENT</h1>
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            <ShoppingCart size={20} />
            <span>Cart ({cartItems.length})</span>
          </button>
        </div>

        {message && <Message type={message.type} text={message.text} />}

        <div className="flex gap-5 mb-4">
          <button
            onClick={() => setShowPopupNC(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            NEW CATEGORY
          </button>
          <button
            onClick={() => setShowPopupNM(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            NEW MATERIAL
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`mr-2 px-4 py-2 rounded ${
              activeTab === "materials" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            MATERIALS
          </button>
          <button
            onClick={() => setActiveTab("rented")}
            className={`px-4 py-2 rounded ${
              activeTab === "rented" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            RENT MATERIALS
          </button>
          <button
            onClick={() => setActiveTab("category")}
            className={`px-4 py-2 rounded ${
              activeTab === "category" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            CATEGORY
          </button>
        </div>

        {activeTab === "materials" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">MATERIAL</h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">MATERIAL NAME</th>
                  <th className="border border-gray-300 p-2">AMOUNT</th>
                  <th className="border border-gray-300 p-2">CATEGORY</th>
                  <th className="border border-gray-300 p-2">RENT</th>
                  <th className="border border-gray-300 p-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material._id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{material.materialName}</td>
                    <td className="border border-gray-300 p-2">{material.amount}</td>
                    <td className="border border-gray-300 p-2">{material.category.name}</td>
                    <td className="border border-gray-300 p-2">{material.rent}</td>
                    <td className="border border-gray-300 p-2 flex gap-3">
                      <button
                        onClick={() => handleAddToCart(material)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleDelete(material)} // Corrected delete function
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleUpdate(material)} // Corrected update function
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Update
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
                  <th className="border border-gray-300 p-2">Rent by</th>
                  <th className="border border-gray-300 p-2">Rent to</th>
                  <th className="border border-gray-300 p-2">Date Rent</th>
                  <th className="border border-gray-300 p-2">Return Date</th>
                  <th className="border border-gray-300 p-2">Receiver</th>
                  <th className="border border-gray-300 p-2"> Date Returned</th>
                </tr>
              </thead>
              <tbody>
                {rentedMaterials.map((rented) => (
                  <tr key={rented._id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{rented.materialId.materialName}</td>
                    <td className="border border-gray-300 p-2">{rented.amount}</td>
                    <td className="border border-gray-300 p-2">{rented.render.name}</td>
                    <td className="border border-gray-300 p-2">{rented.rendeeName}</td>
                    <td className="border border-gray-300 p-2">{new Date(rented.createdAt).toDateString()}</td>
                    <td className="border border-gray-300 p-2">{new Date(rented?.returnDate)?.toDateString()}</td>
                    <td className="border border-gray-300 p-2">{rented?.receiver?.name}</td>
                    <td className="border border-gray-300 p-2">
                      {rented.returned ? new Date(rented?.returnedDate)?.toDateString() : (
                        <button
                          onClick={() => handleReturn(rented._id)}
                          className="text-white bg-blue-700 p-2 rounded hover:bg-blue-500"
                        >
                          Return
                        </button>
                      )}
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
                {category.map((category:{name:string,_id:string}) => (
                  <tr key={category._id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{category.name}</td>
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
            onSuccess={() => {
              fetchMaterials();
              setShowPopupNM(false);
            }}
          />
        )}
        {showPopupNC && (
          <PopupFormCategory
            categories={[]}
            onClose={() => setShowPopupNC(false)}
            onSuccess={() => {
              fetchCategory();
              setShowPopupNC(false);
            }}
          />
        )}
        {showCart && (
          <Cart
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            loggedUser={loggedUser as { _id: string; name: string }}
          />
        )}
      </div>
    </>
  );
};

export default withAdminAuth(MaterialManagement);
