"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import withAdminAuth from "@/components/withAdminAuth";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { TeamMember } from "@/types/types";
import Layout from "../layout";
import { hasPermission } from "@/libs/hasPermission";
import SideBar from "@/components/SideBar";
import FormattedDate from "@/components/FormattedDate";
import { X, ArrowUpRightFromSquareIcon, PhoneIcon, LucideLinkedin, Instagram, FacebookIcon,GripVertical  } from "lucide-react";
import SortableWrapper from "@/components/SortableWrapper";
import {
  CloudUpload,
  Person,
  Email,
  Phone,
  Work,
  AccessTime,
  CalendarToday,
} from "@mui/icons-material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  Box,
  InputAdornment,
} from "@mui/material";
import { SortableMemberCard } from "@/components/TeamInfo";

const MembersPage: React.FC = () => {
  const {
    fetchTeam,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    loggedUser,
    fetchLoggedUser,
  } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [moreInfo, setMoreInfo] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [togglesAdmin, setTogglesAdmin] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [togglesAttedance, setTogglesAttendance] = useState<{
    [key: string]: boolean;
  }>({});
  const [togglesActive, setTogglesActive] = useState<{
    [key: string]: boolean;
  }>({});
  const [viewSupporting, setViewSupporting] = useState<string | null>(null)

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
    institution: { logo: "", name: "" },
    contractType: "",
    linkedIn: "",
    nationalId: "",
    bio: "",
    skills: [],
    leaveDetails: {
      isOnLeave: false,
      leaveType: "",
      startDate: "",
      endDate: "",
    },
    cv: "",
    contract: "",
    certificate: [
      {
        name:"",
        url: ""
      }
    ] ,
    instagram: "",
    snapchat: "",
    facebook: "",
    ranking: "",
    paymentDate: "",
    salary: "",
    currency: "RWF",
    dateJoined: "",
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
        await fetchLoggedUser();
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

  const daysString = Array.isArray(member.days)
    ? member.days.join(", ")
    : member.days || "";

  setFormData({
    _id: member._id || "",
    name: member.name || "",
    image: member.image || "",
    position: member.position || "",
    entry: member.entry || "",
    exit: member.exit || "",
    email: member.email || "",
    days: daysString,
    phone: member.phone || "",
    isAdmin: member.isAdmin || false,
    isSuperAdmin: member.isSuperAdmin || false,
    attend: member.attend || false,
    active: member.active || true,
    institution: member.institution || { logo: "", name: "" },
    contractType: member.contractType || "",
    linkedIn: member.linkedIn || "",
    nationalId: member.nationalId || "",
    bio: member.bio || "",
    skills: member.skills || [],
    leaveDetails: {
      isOnLeave: member.leaveDetails?.isOnLeave || false,
      leaveType: member.leaveDetails?.leaveType || "",
      startDate: member.leaveDetails?.startDate || "",
      endDate: member.leaveDetails?.endDate || "",
    },
    cv: member.cv || "",
    contract: member.contract || "",
    certificate: Array.isArray(member.certificate) ? member.certificate : [],
    instagram: member.instagram || "",
    snapchat: member.snapchat || "",
    facebook: member.facebook || "",
    ranking: member.ranking || "",
    paymentDate: member.paymentDate || "",
    salary: member.salary || "",
    currency: member.currency || "RWF",
    dateJoined: member.dateJoined || "",
  });

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
      toast.error("failed to switch");
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
      toast.error("failed to switch");
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
      toast.error("failed to switch");
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
      institution: { logo: "", name: "" },
      contractType: "",
      linkedIn: "",
      nationalId: "",
      bio: "",
      skills: [],
      leaveDetails: {
        isOnLeave: false,
        leaveType: "",
        startDate: "",
        endDate: "",
      },
      cv: "",
      contract: "",
      certificate: [
        {
          name:"",
          url:""
        }
      ],
      instagram: "",
      snapchat: "",
      facebook: "",
      ranking: "",
      paymentDate: "",
      salary:"",
      currency: "RWF",
      dateJoined: "",
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE_URL}/upload/file`,
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
    setFormData((prev) => ({
      ...prev,
      days: selectedDays.join(", "),
    }));
  };

  const handleMoreInfo = (id: string) => {
    setMoreInfo((prev) => (prev === id ? null : id));
  };

  const handleSupportDocument = (id: string) =>{
    setViewSupporting((prev)=> prev === id ? null : id)
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          skills: [...formData.skills, skillInput.trim()],
        });
      }
      setSkillInput('');
    }
  };

  const handleSkillDelete = (skillToDelete) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToDelete),
    });
  };

  // Upload CV File
const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error("CV file must be less than 5MB");
    return;
  }

  try {
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/upload/file`, formDataUpload, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
    });

    setFormData((prev) => ({
      ...prev,
      cv: response.data.url,
    }));

    toast.success("CV uploaded successfully");
  } catch (error) {
    toast.error("Failed to upload CV");
  } finally {
    setIsUploading(false);
  }
};

  // Contract CV File
const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Contract file must be less than 5MB");
    return;
  }

  try {
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/upload/file`, formDataUpload, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
    });

    setFormData((prev) => ({
      ...prev,
      contract: response.data.url,
    }));

    toast.success("Contract uploaded successfully");
  } catch (error) {
    toast.error("Failed to upload Contract");
  } finally {
    setIsUploading(false);
  }
};

// Upload Certificate Files (Multiple)
const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const uploadedFiles: { name: string; url: string }[] = [];

  setIsUploading(true);
  for (const file of Array.from(files)) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File ${file.name} is too large`);
      continue;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload/file`, formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });

      uploadedFiles.push({ name: file.name, url: res.data.url });
    } catch (error) {
      toast.error(`Failed to upload: ${file.name}`);
    }
  }

  setFormData((prev) => ({
    ...prev,
    certificate: [
    ...(Array.isArray(prev.certificate) ? prev.certificate : []),
    ...uploadedFiles,
    ],
  }));

  toast.success("Certificates uploaded successfully");
  setIsUploading(false);
};

  return (
    <>
      <SideBar />
      <div className="p-2 md:px-20 md:ml-20 md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">TEAM MEMBERS</h1>
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
          <SortableWrapper
        items={members}
        setItems={setMembers}
        getId={(m) => m._id}
        onUpdateOrder={async (newOrder) => {
          try {
            const rankings = newOrder.map((member, index) => ({
              _id: member._id,
              ranking: index + 1,
            }));
            await axios.put(`${API_BASE_URL}/member/update-rankings`, {
              rankings,
            });
            toast.success("Ranking updated");
            // Update local state with new rankings
            setMembers((prevMembers) =>
              prevMembers.map((member) => {
                const found = rankings.find((r) => r._id === member._id);
                // Ensure ranking is a string to match TeamMember type
                return found ? { ...member, ranking: String(found.ranking) } : member;
              })
            );
          } catch {
            toast.error("Failed to update ranking");
          }
        }}
      >
        <div className="space-y-4">
          {members
        .slice()
        .sort((a, b) => Number(a.ranking || 0) - Number(b.ranking || 0))
        .map((member) => (
          <SortableMemberCard
            key={member._id}
            member={member}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleMoreInfo={handleMoreInfo}
            handleToggleAttend={handleToggleAttend}
            handleToggleActive={handleToggleActive}
            handleToggleAdmin={handleToggleAdmin}
            togglesAdmin={togglesAdmin}
            togglesAttedance={togglesAttedance}
            togglesActive={togglesActive} moreInfo={moreInfo} setMoreInfo={setMoreInfo}          />
      ))}
  </div>
</SortableWrapper>

        )}

        <Modal
          isOpen={isAddModalOpen || isUpdateModalOpen}
          onClose={closeModal}
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg md:text-xl font-bold mb-6 text-center">
              {editingMember ? "Edit Member" : "Add New Member"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Grid2 container spacing={3}>
                {/* Profile Image Upload */}
                <Grid2 xs={12}>
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
                          className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
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
                </Grid2>

                {/* Full Name */}
                <Grid2 xs={12} md={6}>
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
                </Grid2>

                {/* Email */}
                <Grid2 xs={12} md={6}>
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
                </Grid2>

                {/* Phone */}
                <Grid2 xs={12} md={6}>
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
                </Grid2>

                {/* Position */}
                <Grid2 xs={12} md={6}>
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
                </Grid2>

                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TextField
                            select
                            name="currency"
                            value={formData.currency || "USD"}
                            onChange={(e) =>
                              setFormData({ ...formData, currency: e.target.value })
                            }
                            variant="standard"
                            sx={{ width: 70 }}
                          >
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="RWF">RWF</MenuItem>
                          </TextField>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>

                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Joined Date"
                    name="dateJoined"
                    type="date"
                    value={formData.dateJoined}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <Work className="text-gray-400 mr-2" />,
                    }}
                  />
                </Grid2>

                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <Work className="text-gray-400 mr-2" />,
                    }}
                  />
                </Grid2>

                {/* Entry Time */}
                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Entry Time"
                    name="entry"
                    type="time"
                    value={formData.entry}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <AccessTime className="text-gray-400 mr-2" />
                      ),
                    }}
                  />
                </Grid2>

                {/* Exit Time */}
                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Exit Time"
                    name="exit"
                    type="time"
                    value={formData.exit}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <AccessTime className="text-gray-400 mr-2" />
                      ),
                    }}
                  />
                </Grid2>

                {/* Working Days */}
                <Grid2 xs={12} md={4}>
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
                      startAdornment={
                        <CalendarToday className="text-gray-400 mr-2" />
                      }
                    >
                      {weekDays.map((day) => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                {/* Contract Type */}
                <Grid2 xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Contract Type</InputLabel>
                    <Select
                      value={formData.contractType || ""}
                      onChange={handleChange}
                      name="contractType"
                      input={<OutlinedInput label="Contract Type" />}
                    >
                      <MenuItem value="Permanent">Permanent</MenuItem>
                      <MenuItem value="Fixed-Term">Fixed-Term</MenuItem>
                      <MenuItem value="Part-Time">Part-Time</MenuItem>
                      <MenuItem value="Freelance">Freelance</MenuItem>
                      <MenuItem value="Consultancy">Consultancy</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>

                {/* LinkedIn */}
                <Grid2 xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile"
                    name="linkedIn"
                    value={formData.linkedIn || ""}
                    onChange={handleChange}
                  />
                </Grid2>

                {/* Instagram */}
                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Instagram Profile"
                    name="instagram"
                    value={formData.instagram || ""}
                    onChange={handleChange}
                    placeholder="https://instagram.com/username"
                  />
                </Grid2>

                {/* Snapchat */}
                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Snapchat Profile"
                    name="snapchat"
                    value={formData.snapchat || ""}
                    onChange={handleChange}
                    placeholder="https://snapchat.com/add/username"
                  />
                </Grid2>

                {/* Facebook */}
                <Grid2 xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Facebook Profile"
                    name="facebook"
                    value={formData.facebook || ""}
                    onChange={handleChange}
                    placeholder="https://facebook.com/username"
                  />
                </Grid2>
                {/* NationalId */}
                <Grid2 xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="National ID"
                    name="nationalId"
                    value={formData.nationalId || ""}
                    onChange={handleChange}
                  />
                </Grid2>

                {/* Bio */}
                <Grid2 xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                  />
                </Grid2>
                
                <Grid2 xs={12} md={4}>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Upload CV</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvUpload}
                      disabled={isUploading}
                    />
                    {formData.cv && (
                      <a href={formData.cv} target="_blank" className="text-sm text-blue-600 underline">
                        View uploaded CV
                      </a>
                    )}
                  </div>
                </Grid2>

                <Grid2 xs={12} md={4}>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Upload Contract</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleContractUpload}
                      disabled={isUploading}
                    />
                    {formData.contract && (
                      <a href={formData.contract} target="_blank" className="text-sm text-blue-600 underline">
                        View uploaded Contract
                      </a>
                    )}
                  </div>
                </Grid2>
                

                {/* Certificate Uploads */}
                <Grid2 xs={12} md={4}>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Upload Certificates</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleCertificateUpload}
                      disabled={isUploading}
                    />
                    {formData.certificate?.length > 0 && (
                      <ul className="list-disc ml-5 mt-1 text-sm text-blue-700">
                        {formData.certificate?.map((cert, i) => (
                          <li key={i}>
                            <a href={cert.url} target="_blank" rel="noopener noreferrer">
                               {cert.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Grid2>

                {/* Skills */}
                <Grid2 xs={12}>
                  <InputLabel>Skills</InputLabel>
                  <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 1,
                  border: '1px solid #c4c4c4',
                  borderRadius: 1,
                  p: 1,
                }}
          >   
                {formData.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => handleSkillDelete(skill)}
                color="primary"
              />
            ))}
          </Box>
          <TextField
            fullWidth
            label="Type a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
        </Grid2>

                {/* Leave Details */}
                <Grid2 xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.leaveDetails?.isOnLeave || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leaveDetails: {
                              ...formData.leaveDetails,
                              isOnLeave: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Is On Leave"
                  />
                </Grid2>

                {formData.leaveDetails?.isOnLeave && (
                  <>
                    <Grid2 xs={12} md={4}>
                      <FormControl fullWidth>
                        <TextField
                          label="Leave Type"
                          value={formData.leaveDetails?.leaveType || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              leaveDetails: {
                                ...formData.leaveDetails,
                                leaveType: e.target.value,
                              },
                            })
                          }
                          name="leaveType"
                          variant="outlined"
                        />
                      </FormControl>
                    </Grid2>

                    <Grid2 xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        name="leaveStartDate"
                        InputLabelProps={{ shrink: true }}
                        value={formData.leaveDetails?.startDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leaveDetails: {
                              ...formData.leaveDetails,
                              startDate: e.target.value,
                            },
                          })
                        }
                      />
                    </Grid2>

                    <Grid2 xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        name="leaveEndDate"
                        InputLabelProps={{ shrink: true }}
                        value={formData.leaveDetails?.endDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leaveDetails: {
                              ...formData.leaveDetails,
                              endDate: e.target.value,
                            },
                          })
                        }
                      />
                    </Grid2>
                  </>
                )}
                {/* Submit Button */}
                <Grid2 xs={12}>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-md text-sm md:text-base hover:bg-blue-700 transition-colors"
                  >
                    {editingMember ? "Update Member" : "Add Member"}
                  </button>
                </Grid2>
              </Grid2>
            </form>
          </div>
        </Modal>
      </div>
    </>
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
      className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full z-50 overflow-y-auto"
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
