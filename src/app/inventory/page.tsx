"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Message from "@/components/message";
import{
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
import { useCart } from "@/context/cartContext";
import Cart from "@/components/cart";

const MaterialManagement: React.FC = () => {
  const { fetchLoggedUser, loggedUser } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [materials, setMaterials] = useState([]);
  const [category, setCategory] = useState([]);
  const [rentedMaterials, setRentedMaterials] = useState([]);
  const [showPopupNM, setShowPopupNM] = useState(false);
  const [showPopupNC, setShowPopupNC] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCart, setShowCart] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "materials" | "rented" | "category"
  >("materials");

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
    toast.success("item returned");
    await axios.get(`${API_BASE_URL}/inventory`);
    await fetchRented();
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
  // setShowPopupRent(false);
};
if (loading) {
  return (
    <div className="text-center mt-20">
      <SideBar />
      <Loader />
    </div>
  );
}

  const handleAddToCart = (material: any) => {
    const amount = 1; // Default amount, you could add an input for this
    if (material.amount < 1) {
      toast.error("This item is out of stock");
      return;
    }
    addToCart(material, amount);
    toast.success("Added to cart");
  };

  return (
    <>
      <SideBar />
      <div className="p-4 mx-auto container">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Material Management</h1>
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
              activeTab === "materials"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
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
              activeTab === "category"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
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
                  <th className="border border-gray-300 p-2">Rent</th>
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
                      {/* @ts-expect-error error */}
                      {material.rent}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => handleAddToCart(material)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Add to Cart
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
                      {rented.render.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {/* @ts-expect-error error */}
                      {rented.rendeeName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {/* @ts-expect-error error */}
                      {new Date(rented.createdAt).toDateString()}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {/* @ts-expect-error error */}
                      {new Date(rented?.returnDate)?.toDateString()}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {/* @ts-expect-error error */}
                      {rented?.receiver?.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {/* @ts-expect-error error */}
                      {rented.returned ? (
                        //@ts-expect-error error
                        new Date(rented?.returnedDate)?.toDateString()
                      ) : (
                        <button
                          //@ts-expect-error error
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
            loggedUser={loggedUser as { _id: string,name:string }}
          />
        )}
      </div>
    </>
  );
};

export default withAdminAuth(MaterialManagement);
