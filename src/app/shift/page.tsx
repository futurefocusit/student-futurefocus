"use client";
import React, { useEffect, useState } from "react";
import API_BASE_URL from "@/config/baseURL";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Layout from "../layout";
import { hasPermission } from "@/libs/hasPermission";
import withAdminAuth from "@/components/withAdminAuth";

const Shift = () => {
  const [shift, setShift] = useState({
    start: "",
    end: "",
    name: "",
    days: "",
  });
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<null | {
    _id: string;
    start: string;
    end: string;
    name: string;
    days: string;
  }>(null);
const {loggedUser,fetchLoggedUser}=useAuth()
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShift((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle deleting a shift
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await axios.delete(`${API_BASE_URL}/others/shift/${id}`);
      await getIntakes();
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch all shifts
  const getIntakes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/others/shift`);
      setShifts(response.data.shifts);
      await fetchLoggedUser();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission (either create or update)
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const endpoint = editingShift
        ? `${API_BASE_URL}/others/shift/${editingShift._id}`
        : `${API_BASE_URL}/others/shift`;
      const method = editingShift ? "put" : "post";

      const response = await axios[method](endpoint, {
        start: shift.start,
        end: shift.end,
        name: shift.name,
        days: shift.days,
      });
      toast.success(response.data.message);
      setEditingShift(null); // Reset after submitting
      await getIntakes();
    } catch (error) {
      toast.error("Failed to add or update shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a shift
  const handleEdit = (shift: {
    _id: string;
    start: string;
    end: string;
    name: string;
    days: string;
  }) => {
    setEditingShift(shift);
    setShift({
      start: shift.start,
      end: shift.end,
      name: shift.name,
      days: shift.days, 
    });
  };

  // Run on component mount
  useEffect(() => {
    getIntakes();
  }, []);

  return (
    <div>
      <Layout>
        <div className="">
          <h1 className="text-3xl font-bold mb-4 text-center">Shift</h1>
          <div className="flex gap-3 items-center justify-center">
            <div className="flex flex-col gap-2">
              <span className="flex gap-10">
                <p className="w-1/2">START AT:</p>
                <input
                  className="w-1/2"
                  type="time"
                  name="start"
                  value={shift.start}
                  onChange={handleChange}
                />
              </span>
              <span className="flex gap-2">
                <p className="w-1/2">END AT:</p>
                <input
                  className="w-1/2"
                  type="time"
                  name="end"
                  value={shift.end}
                  onChange={handleChange}
                />
              </span>
              <span className="flex gap-2">
                <p className="w-1/2">Name:</p>
                <input
                  className="w-1/2"
                  type="text"
                  name="name"
                  value={shift.name}
                  onChange={handleChange}
                />
              </span>
              <span className="flex gap-2">
                <p className="w-1/2">Days:</p>
                <input
                  className="w-1/2"
                  type="text"
                  name="days"
                  value={shift.days}
                  onChange={handleChange}
                  placeholder="Comma-separated days"
                />
              </span>
            </div>
            <button
              disabled={
                !hasPermission(
                  loggedUser,
                  "intake",
                  editingShift ? "create" : "create"
                )
              }
              className={`${
                !hasPermission(
                  loggedUser,
                  "intake",
                  editingShift ? "create" : "create"
                )
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700  hover:bg-blue-500"
              } text-white rounded p-2`}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Submitting..."
                : editingShift
                ? "Update Shift"
                : "Add New Shift"}
            </button>
          </div>

          <div className="flex flex-col text-center md:w-fit mx-auto border-2 mt-10 border-[#837979] rounded bg-blue-100">
            {isLoading
              ? "Loading..."
              : shifts.length === 0
              ? "No shift found"
              : shifts.map(
                  (shift: { _id: string;name:string; start: string; end: string }) => (
                    <div
                      key={shift._id}
                      className="border-b-2 border-[#837979] p-2 flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Name</p>
                        <h5>{shift.name}</h5>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">START AT</p>
                        <h5>{shift.start}</h5>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">END AT</p>
                        <h5>{shift.end}</h5>
                      </div>

                      <div className="flex gap-4">
                        <button
                        //@ts-expect-error error
                          onClick={() => handleEdit(shift)}
                          className="bg-green-500 text-white p-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          disabled={
                            !hasPermission(
                              loggedUser,
                              "intake",
                              "delete"
                            )
                          }
                          onClick={() => handleDelete(shift._id)}
                          className={`${
                            !hasPermission(
                              loggedUser,
                              "intake",
                              "delete"
                            )
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 text-white"
                          } p-1 rounded`}
                        >
                          {deletingId === shift._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )
                )}
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default withAdminAuth(Shift);
