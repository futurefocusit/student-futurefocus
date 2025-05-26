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
import SideBar from "@/components/SideBar";
import { CloudUpload, Person, Email, Phone, Work, AccessTime, CalendarToday } from "@mui/icons-material";
import { TextField, Select, MenuItem, FormControl, InputLabel, Grid, Chip, OutlinedInput } from "@mui/material";

const MembersPage: React.FC = () => {
  const { fetchTeam, addTeamMember, updateTeamMember, deleteTeamMember, loggedUser, fetchLoggedUser } =
    useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [togglesAdmin, setTogglesAdmin] = useState<{ [key: string]: boolean }>({});
  const [togglesAttedance, setTogglesAttendance] = useState<{ [key: string]: boolean }>({});
  const [togglesActive, setTogglesActive] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    image: "",
    position: "",
    entry: "",
    exit: "",
    email: "",
    days: "",
    phone: "",
    isAdmin: false,
    isSuperAdmin: false,
    attend: false,
    active: true,
    institution: { logo: "", name: "" }
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const weekDays = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        await fetchLoggedUser()
        const teamMembers = await fetchTeam();
        setMembers(teamMembers);

        const initialTogglesAdmin: { [key: string]: boolean } = {};
        const initialTogglesAttendance: { [key: string]: boolean } = {};
        const initialTogglesActive: { [key: string]: boolean } = {};
        teamMembers.forEach((member) => {
          initialTogglesAdmin[member._id] = member.isAdmin;
          initialTogglesAttendance[member._id] = member.attend;
          initialTogglesActive[member._id] = member.active;
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
        //@ts-expect-error error
        await updateTeamMember(editingMember._id, formData);
        toast.success("Member updated successfully");
      } else {
        //@ts-expect-error error
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

  const handleToggleAttend = async (id: string) => {
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
  const handleToggleActive = async (id: string) => {
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
  const handleToggleAdmin = async (id: string) => {
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
      position: "",
      entry: "",
      exit: "",
      email: "",
      days: "",
      phone: "",
      isAdmin: false,
      isSuperAdmin: false,
      attend: false,
      active: true,
      institution: { logo: "", name: "" }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is WebP format
    if (!file.type.startsWith("image/")) {
  toast.error("Please upload only image format images");
  return;
}

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        image: response.data.url,
      }));
      setImagePreview(response.data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDaysChange = (event) => {
    const selectedDays = event.target.value;
    setFormData(prev => ({
      ...prev,
      days: selectedDays.join(", ")
    }));
  };

  return (
    <><SideBar /><div className="p-2 md:pl-24 md:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-xl md:text-2xl font-semibold">Team Members</h1>
        <button
          disabled={!hasPermission(loggedUser, "team", "create")}
          onClick={() => setIsAddModalOpen(true)}
          className={`w-full sm:w-auto px-4 py-2 ${!hasPermission(loggedUser, "team", "create")
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600"} text-white rounded-md`}
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
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" />
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
                        onChange={() => handleToggleAttend(member._id)} />
                      <div
                        onClick={() => handleToggleAttend(member._id)}
                        className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${togglesAttedance[member._id] ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${togglesAttedance[member._id] ? "translate-x-6 md:translate-x-8" : ""}`} />
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
                        onChange={() => handleToggleActive(member._id)} />
                      <div
                        onClick={() => handleToggleActive(member._id)}
                        className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${togglesActive[member._id] ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${togglesActive[member._id] ? "translate-x-6 md:translate-x-8" : ""}`} />
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
                        onChange={() => handleToggleAdmin(member._id)} />
                      <div
                        onClick={() => handleToggleAdmin(member._id)}
                        className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${togglesAdmin[member._id] ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${togglesAdmin[member._id] ? "translate-x-6 md:translate-x-8" : ""}`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-center gap-2 w-full md:w-auto">
                  <button
                    disabled={!hasPermission(loggedUser, "team", "update")}
                    onClick={() => handleEdit(member)}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm md:text-base ${!hasPermission(loggedUser, "team", "update")
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600"} text-white rounded-md`}
                  >
                    Edit
                  </button>
                  <button
                    disabled={!hasPermission(loggedUser, "team", "delete")}
                    onClick={() => handleDelete(member._id)}
                    className={`flex-1 md:flex-none px-4 py-2 text-sm md:text-base ${!hasPermission(loggedUser, "team", "delete")
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600"} text-white rounded-md`}
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-center">
            {editingMember ? "Edit Member" : "Add New Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Grid container spacing={3}>
              {/* Profile Image Upload */}
              <Grid item xs={12}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Image (image format only)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        <CloudUpload className="mr-2" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="relative w-20 h-20">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 2MB. Only image format is supported.
                  </p>
                </div>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Person className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Email className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Phone className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Work className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              {/* Working Hours */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Entry Time"
                  name="entry"
                  type="time"
                  value={formData.entry}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AccessTime className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Exit Time"
                  name="exit"
                  type="time"
                  value={formData.exit}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AccessTime className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Working Days</InputLabel>
                  <Select
                    multiple
                    value={formData.days ? formData.days.split(", ") : []}
                    onChange={handleDaysChange}
                    input={<OutlinedInput label="Working Days" />}
                    renderValue={(selected) => (
                      <div className="flex flex-wrap gap-1">
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </div>
                    )}
                    startAdornment={<CalendarToday className="text-gray-400 mr-2" />}
                  >
                    {weekDays.map((day) => (
                      <MenuItem key={day.value} value={day.value}>
                        {day.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors"
                >
                  {editingMember ? "Update Member" : "Add Member"}
                </button>
              </Grid>
            </Grid>
          </form>
        </div>
      </Modal>
    </div></>
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
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default withAdminAuth(MembersPage);
