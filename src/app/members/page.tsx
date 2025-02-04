"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import withAdminAuth from "@/components/withAdminAuth";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { TeamMember } from "@/types/types";
import Layout from "../layout";
import { hasPermission } from "@/libs/hasPermission";

const MembersPage: React.FC = () => {
  const { fetchTeam, addTeamMember, updateTeamMember, deleteTeamMember,loggedUser,fetchLoggedUser } =
    useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // New state to handle toggles for each member
  const [togglesAdmin, setTogglesAdmin] = useState<{ [key: string]: boolean }>({});
  const [togglesAttedance, setTogglesAttendance] = useState<{ [key: string]: boolean }>({});
  const [togglesActive, setTogglesActive] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    image: "",
    role: "",
    position: "",
    entry:"",
    exit:"",
    email: "",
    days:"",
    phone:'',
    instagram: "",
    isAdmin:false
  });

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        await fetchLoggedUser()
        const teamMembers = await fetchTeam();
        setMembers(teamMembers);

        // Initialize toggles for each member
        const initialTogglesAdmin: { [key: string]: boolean } = {};
        const initialTogglesAttendance: { [key: string]: boolean } = {};
        const initialTogglesActive: { [key: string]: boolean } = {};
        teamMembers.forEach((member) => {
          initialTogglesAdmin[member._id] = member.isAdmin; // Set default toggle state
          initialTogglesAttendance[member._id] = member.attend; // Set default toggle state
          initialTogglesActive[member._id] = member.active; // Set default toggle state
        });
        setTogglesAdmin(initialTogglesAdmin);
        setTogglesAttendance(initialTogglesAttendance);
        setTogglesActive(initialTogglesActive);
      } catch (error) {
        toast.error("Failed to fetch team data");
      } finally {
        setIsLoading(false);
      }
    };
    loadTeamMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingMember) {
        //@ts-expect-error errro
        await updateTeamMember(editingMember._id, formData);
        toast.success("Member updated successfully");
      } else {
        //@ts-expect-error errro
        await addTeamMember(formData);
        toast.success("Member added successfully");
      }
      setMembers(await fetchTeam());
      closeModal();
    } catch (error) {
      toast.error(`Failed to ${editingMember ? "update" : "add"} member`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    //@ts-expect-error errro
    setFormData(member);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeamMember(id);
      setMembers(members.filter((member) => member._id !== id));
      toast.success("Member deleted successfully");
      const { [id]: _, ...remainingTogglesAdmin } = togglesAdmin;
      const { [id]: p, ...remainingTogglesAttendance } = togglesAttedance;
      setTogglesAdmin(remainingTogglesAdmin);
      setTogglesAttendance(remainingTogglesAttendance);
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  const handleToggleAttend = async(id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/member/toogle-attendance/${id}`);
      setTogglesAttendance((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
     toast.success("switched succsfully"); 

    } catch (error) {
     toast.error('failed to switch') 
    }
  };
  const handleToggleActive = async(id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/member/toogle-active/${id}`);
      setTogglesActive((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
     toast.success("switched succsfully"); 

    } catch (error) {
     toast.error('failed to switch') 
    }
  };
  const handleToggleAdmin = async(id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/member/toogle-admin/${id}`);
      setTogglesAdmin((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
     toast.success("switched succsfully"); 

    } catch (error) {
     toast.error('failed to switch') 
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    setEditingMember(null);
    setFormData({
      _id: "",
      name: "",
      image: "",
      role: "",
      phone:"",
      position: "",
      entry:"",
      email: "",
      instagram: "",
      isAdmin:false,
      exit:"",
      days:""
    });
  };

  return (
     <Layout>
      <div className="p-2 md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">Team Members</h1>
          <button
            disabled={!hasPermission(loggedUser, "team", "create")}
            onClick={() => setIsAddModalOpen(true)}
            className={`w-full sm:w-auto px-4 py-2 ${
              !hasPermission(loggedUser, "team", "create")
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600"
            } text-white rounded-md`}
          >
            Add Member
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex flex-col  md:flex-row md:justify-between   items-center p-3 md:p-4 border  rounded-lg shadow-md bg-white "
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                  />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg md:text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-gray-700 mb-1">{member.position}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4  sm:ml-auto">
                  <div className="flex flex-col gap-4 w-full md:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-sm md:text-base">ATTENDANCE:</p>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`attendance-${member._id}`}
                          className="toggle-checkbox hidden"
                          checked={togglesAttedance[member._id] || false}
                          onChange={() => handleToggleAttend(member._id)}
                        />
                        <div
                          onClick={() => handleToggleAttend(member._id)}
                          className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${
                            togglesAttedance[member._id] ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              togglesAttedance[member._id] ? "translate-x-6 md:translate-x-8" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-sm md:text-base">ACTIVE:</p>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`active-${member._id}`}
                          className="toggle-checkbox hidden"
                          checked={togglesActive[member._id] || false}
                          onChange={() => handleToggleActive(member._id)}
                        />
                        <div
                          onClick={() => handleToggleActive(member._id)}
                          className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${
                            togglesActive[member._id] ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              togglesActive[member._id] ? "translate-x-6 md:translate-x-8" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:gap-4">
                      <p className="font-bold text-sm md:text-base">ADMIN:</p>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`admin-${member._id}`}
                          className="toggle-checkbox hidden"
                          checked={togglesAdmin[member._id] || false}
                          onChange={() => handleToggleAdmin(member._id)}
                        />
                        <div
                          onClick={() => handleToggleAdmin(member._id)}
                          className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${
                            togglesAdmin[member._id] ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              togglesAdmin[member._id] ? "translate-x-6 md:translate-x-8" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-center gap-2 w-full md:w-auto">
                    <button
                      disabled={!hasPermission(loggedUser, "team", "update")}
                      onClick={() => handleEdit(member)}
                      className={`flex-1 md:flex-none px-4 py-2 text-sm md:text-base ${
                        !hasPermission(loggedUser, "team", "update")
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600"
                      } text-white rounded-md`}
                    >
                      Edit
                    </button>
                    <button
                      disabled={!hasPermission(loggedUser, "team", "delete")}
                      onClick={() => handleDelete(member._id)}
                      className={`flex-1 md:flex-none px-4 py-2 text-sm md:text-base ${
                        !hasPermission(loggedUser, "team", "delete")
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600"
                      } text-white rounded-md`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isAddModalOpen || isUpdateModalOpen} onClose={closeModal}>
          <h2 className="text-lg md:text-xl font-bold mb-4">
            {editingMember ? "Edit Member" : "Add New Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Position"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Instagram URL"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="time"
              name="entry"
              value={formData.entry}
              onChange={handleChange}
              placeholder="Entry time"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="time"
              name="exit"
              value={formData.exit}
              onChange={handleChange}
              placeholder="Exit time"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="days"
              value={formData.days}
              onChange={handleChange}
              placeholder="working days"
              className="w-full p-2 border rounded-md text-sm md:text-base"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md text-sm md:text-base"
            >
              {editingMember ? "Update Member" : "Add Member"}
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
  

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default withAdminAuth(MembersPage);
