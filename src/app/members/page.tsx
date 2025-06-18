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
import FormattedDate from "@/components/FormattedDate";
import { X, ArrowUpRightFromSquareIcon, PhoneIcon, LucideLinkedin, Instagram, FacebookIcon } from "lucide-react";
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
} from "@mui/material";
import { FaFacebook, FaInstagram, FaLinkedin, FaSnapchat } from "react-icons/fa";

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
  const [moreInfo, setMoreInfo] = useState<string | null>(null);
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
    certificate: [] ,
    instagram: "",
    snapchat: "",
    facebook: "",
    ranking: "",
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
      certificate: [],
      instagram: "",
      snapchat: "",
      facebook: "",
      ranking: "",
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
    certificate: [...prev.certificate, ...uploadedFiles],
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
                    <h3 className="text-lg md:text-xl font-bold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-gray-700 mb-1">{member.position}</p>
                    <div
                      onClick={() => handleMoreInfo(member._id)}
                      className="flex items-center gap-2 text-blue-700 cursor-pointer hover:text-green-700 hover:underline"
                    >
                      <p className="font-bold text-sm ">More Info...</p>
                      <ArrowUpRightFromSquareIcon size={13} />
                    </div>
                  </div>
                </div>

                {moreInfo === member._id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 py-0 md:py-5">
                    <div className="bg-white p-3 md:p-5 w-full md:w-1/2 overflow-y-auto h-full rounded">
                      <div className="flex flex-col gap-10">
                        <div className="fixed top-0 left-0 right-0 z-50 bg-white flex justify-between items-center p-4 md:static">
                    <h1 className="font-bold text-2xl text-blue-700">
                      Member Profile
                    </h1>
                    <X
                      onClick={() => setMoreInfo(null)}
                      size={25}
                      className="cursor-pointer hover:bg-red-700 rounded-full p-1 hover:text-white"
                    />
                  </div>

                  <div className="flex md:mt-0 mt-16 md:flex-row flex-col items-start md:items-center gap-5">
                    {/* Image */}
                    <div className="shrink-0 w-36 h-36 rounded-full bg-black overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                      <div className="flex-1">
                        <h1 className="font-bold text-lg">{member.name}</h1>
                        <p className="font-medium text-gray-500">{member.email}</p>
                        <p className="font-medium text-gray-500">{member.phone}</p>
                        <p className="font-medium italic text-blue-700">{member.position}</p>
                      </div>

                      <div className="flex flex-col gap-1 items-start text-right min-w-[120px]">
                        <div className="flex gap-2 items-center">
                          <p className="text-sm font-bold">Contract Type:</p>
                          <p className=" text-gray-600">{member.contractType}</p>
                        </div>
                          <a href={member.contract} className="text-blue-700 italic text-sm hover:underline">View Contract...</a>
                      <div className="flex gap-2 items-start">
                        <p className="text-sm font-bold">ID:</p>
                        <p className=" text-gray-600">{member.nationalId}</p>
                      </div>

                      <div className="flex gap-2 items-start">
                        <p className="text-sm font-bold">Leave Status:</p>
                        <p className=" text-white font-semibold text-[12px]">{member.leaveDetails.isOnLeave === false ? (
                            <p className="bg-green-600 p-1 min-w-full rounded">Active</p>
                        ): (
                            <p className="bg-red-600 p-1 w-full rounded">On Leave</p>
                        ) }</p>
                      </div>
                      </div>
                    </div>
                  </div>

                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                            <h1 className="font-bold text-2xl">About Me</h1>
                            <p>{member.bio}</p>

                            <p onClick={()=>handleSupportDocument(member._id)} className="text-green-700 text-sm font-bold italic hover:underline cursor-pointer">View Supporting Files </p>
                          </div>

                          {viewSupporting === member._id && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 py-0 md:py-5">
                              <div className="bg-white p-4 w-[90%] md:w-1/3 rounded shadow-lg">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                  <h1 className="text-lg font-bold">Supporting Files</h1>
                                  <X
                                    onClick={() => setViewSupporting(null)}
                                    size={25}
                                    className="cursor-pointer hover:bg-red-700 rounded-full p-1 hover:text-white"
                                  />
                                </div>
                                                    
                                {/* Files Section */}
                                <div className="flex flex-col gap-4">
                                  {/* CV */}
                                  {member.cv && (
                                    <div className="border border-gray-300 p-3 rounded">
                                      <p className="font-medium mb-1">CV:</p>
                                      <a
                                        href={member.cv}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-700 italic hover:text-blue-500 underline text-sm"
                                      >
                                        View CV
                                      </a>
                                    </div>
                                  )}
                          
                                  {/* Certificates */}
                                  {member.certificate && member.certificate.length > 0 && (
                                    <div className="border border-gray-300 p-3 rounded">
                                      <p className="font-medium mb-2">Certificates:</p>
                                      <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                                        {member.certificate.map((cert, index) => (
                                          <li key={index}>
                                            <a
                                              href={cert}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="italic hover:text-blue-500 underline"
                                            >
                                              Certificate {index + 1}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                            <h1 className="font-bold text-2xl">Skills</h1>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {member.skills.map((skill, index) => (
                                <div key={index} className="">
                                  <p className="font-medium">📍 {skill}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 min-w-full">
                            <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                              <h1 className="font-bold text-2xl">Phone Number</h1>
                              <p className="flex gap-2 items-center"><span><PhoneIcon size={15}/></span>{member.phone}</p>
                             </div>

                             <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                                <h1 className="font-bold text-2xl">Social Profile</h1>
                                <div className="flex gap-3">
                                  <a href={member.linkedIn} className="hover:text-blue-700"><span><FaLinkedin/></span></a>
                                  <a href={member.instagram} className="hover:text-blue-700"><span><FaInstagram/></span></a>
                                  <a href={member.facebook} className="hover:text-blue-700"><span><FaFacebook/></span></a>
                                  <a href={member.snapchat} className="hover:text-blue-700"><span><FaSnapchat/></span></a>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col">
                            {member.leaveDetails.isOnLeave === true &&(
                              <div className="flex flex-col border border-gray-400 p-3 rounded gap-1">
                                <p className="font-bold text-2xl ">{member.leaveDetails.isOnLeave === true && (
                                  <div>
                                    <p>Leave Details</p>
                                    <p className="font-semibold text-sm">Leave Type: <span className="text-blue-700 font-semibold text-sm">{member.leaveDetails.leaveType}</span></p>
                                  </div>
                                )}</p>
                                <div className="flex gap-2">
                                  <p>Starting From <span className="font-bold"><FormattedDate date={member.leaveDetails.startDate} /></span></p>
                                  <p>To <span className="font-bold"><FormattedDate date={member.leaveDetails.endDate}/></span></p>
                                </div>
                                <p>{member.leaveDetails.approvedBy}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4  sm:ml-auto">
                  <div className="flex flex-col gap-4 w-full md:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-sm md:text-base">
                        ATTENDANCE:
                      </p>
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
                            togglesAttedance[member._id]
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              togglesAttedance[member._id]
                                ? "translate-x-6 md:translate-x-8"
                                : ""
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
                            togglesActive[member._id]
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              togglesActive[member._id]
                                ? "translate-x-6 md:translate-x-8"
                                : ""
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
                            togglesAdmin[member._id]
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              togglesAdmin[member._id]
                                ? "translate-x-6 md:translate-x-8"
                                : ""
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

                {/* Ranking */}
                <Grid2 xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ranking"
                    name="ranking"
                    value={formData.ranking || ""}
                    onChange={handleChange}
                    placeholder="e.g., A+, 1st Place, Senior"
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
                    {formData.certificate.length > 0 && (
                      <ul className="list-disc ml-5 mt-1 text-sm text-blue-700">
                        {formData.certificate.map((url, i) => (
                          <li key={i}>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              Certificate {i + 1}
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
                        <InputLabel>Leave Type</InputLabel>
                        <Select
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
                          input={<OutlinedInput label="Leave Type" />}
                        >
                          <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                          <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                          <MenuItem value="Maternity Leave">
                            Maternity Leave
                          </MenuItem>
                          <MenuItem value="Paternity Leave">
                            Paternity Leave
                          </MenuItem>
                          <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
                        </Select>
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
