import React, { useState } from "react";;
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { toast } from "react-toastify";
import { useCart } from "@/context/cartContext";
import { printRentalContract } from "@/libs/rentContract";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  loggedUser: { _id: string,name:string };
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, loggedUser }) => {
  const { cartItems, removeFromCart, clearCart, updateAmount } = useCart();
  const [rendeeName, setRendeeName] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const handleSubmitCart = async () => {
    try {
      if (!rendeeName || !returnDate) {
        toast.error("Please fill in all required fields");
        return;
      }

     
        await axios.post(`${API_BASE_URL}/inventory/rent`, {
          items:cartItems,
          render: loggedUser._id,
          rendeeName,
          returnDate,
        },{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem('ffa-admin')}`
          }
        });
      
     printRentalContract({rendeeName,render:loggedUser.name},cartItems)
      toast.success("Items rented successfully");
      clearCart();
      onClose();
    } catch (error) {
      toast.error("Failed to rents items");
      console.log(error)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Cart</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <h3 className="font-semibold">{item.materialName}</h3>
                    <p className="text-sm text-gray-600">
                      Category: {item.category?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max={item.amount}
                      value={item.requestedAmount}
                      onChange={(e) =>
                        updateAmount(item._id, parseInt(e.target.value), item.amount-item.rent)
                      }
                      className="w-20 border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rendee Name
                </label>
                <input
                  type="text"
                  value={rendeeName}
                  onChange={(e) => setRendeeName(e.target.value)}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={clearCart}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Cart
              </button>
              <button
                onClick={handleSubmitCart}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit Rental
              </button>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute top-10 text-3xl right-20 text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Cart;
