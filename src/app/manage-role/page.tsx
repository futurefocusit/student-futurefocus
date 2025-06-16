"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import { toast } from "react-toastify";
import { IFeature, IRole, IPermission, TeamMember } from "@/types/types";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/libs/hasPermission";
import SideBar from "@/components/SideBar";
import Loader from "@/components/loader";
import Head from "next/head";



const ManageRolesPermissions: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [features, setFeatures] = useState<IFeature[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [newFeature, setNewFeature] = useState({ feature: "", web: "website" });
  const [newPermission, setNewPermission] = useState({
    feature: "",
    permission: "",
  });
  const [newRole, setNewRole] = useState({ role: "", permission: [] });
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [userData, setUserData] = useState<TeamMember|null>()
  const { fetchLoggedUser, loggedUser } = useAuth();

useEffect(()=>{
    document.title = "XCOOLL | Role Managenent";
})

  useEffect(() => {
    fetchFeatures();
    fetchPermissions();
    fetchRoles();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      const role = roles.find((role) => role._id === selectedRole);
      if (role) {
        setRolePermissions(role.permission.map((p) => p._id));
        setSelectedPermissions(role.permission.map((p) => p._id));
      }
    } else {
      setRolePermissions([]);
      setSelectedPermissions([]);
    }
  }, [selectedRole, roles]);

  const fetchFeatures = async () => {
   try {
     const res = await axios.get<IFeature[]>(`${API_BASE_URL}/role/feature`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
     });
     setFeatures(res.data);
     await fetchLoggedUser();
     setUserData(loggedUser);
   } catch (error) {
      setError("Failed to load attendance data.");
    
   }finally{
      setIsLoading(false);

   }
  };

  const fetchPermissions = async () => {
    const res = await axios.get<IPermission[]>(
      `${API_BASE_URL}/role/permission`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      }
    );
    setPermissions(res.data);
  };

  const fetchRoles = async () => {
    const res = await axios.get<IRole[]>(`${API_BASE_URL}/role`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
    });
    setRoles(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get<TeamMember[]>(`${API_BASE_URL}/member/admins`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
    });
    setUsers(res.data);
  };


  const handleAddRole = async () => {
    await axios.post(`${API_BASE_URL}/role`, newRole,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
    });
    fetchRoles();
    setNewRole({ role: "", permission: [] });
  };

 

  const handleDeleteRole = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/role`, { data: { id },headers: {
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      }},);
      toast.success("role deleted successfully");
      fetchRoles();
    } catch (error) {
      toast.error("failed to delete role");
    }
  };

  const handleAssignPermissionsToRole = async () => {
    console.log(selectedRole)
    if(!selectedRole)return
    try {
      await axios.put(`${API_BASE_URL}/role/${selectedRole}`, {
        permissions: selectedPermissions,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      toast.success(`permissions assigned ${selectedRole}`);
      fetchRoles();
    } catch (error) {
      toast.error("failed to assing permission");
    }
  };

  const handleAssignRoleToUser = async () => {
    try {
      await axios.put(`${API_BASE_URL}/others/role/${selectedUser}`, {
        role: selectedRole,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      toast.success(`role assigned user`);
      fetchUsers();
    } catch (error) {
      toast.error("failed toassing role to user");
    }
  };
if (isLoading) return <Loader />;
if (error) return <div>{error}</div>;
  return (

     <>
      <>
      <Head>
        <title>Manage Role</title>
        <meta name="description" content="Xcool management system" />
      </Head>
    </>
     <SideBar /><div className="max-w-4xl  mx-auto p-5">

      <h1 className="text-3xl font-bold ml-10 mb-6">MANAGE ROLES AND PERMISSIONS</h1>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Add Role</h2>
        <div className="flex mb-4">
          <input
            disabled={!hasPermission(userData as TeamMember, "roles", "add")}
            type="text"
            className="border rounded px-3 py-2 flex-grow mr-2"
            value={newRole.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRole({ ...newRole, role: e.target.value })}
            placeholder="Role" />
          <button
            disabled={!hasPermission(userData as TeamMember, "roles", "add")}
            onClick={handleAddRole}
            className={`${!hasPermission(userData as TeamMember, "roles", "add")
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500"} text-white rounded px-4 ml-2`}
          >
            Add Role
          </button>
        </div>
        <h2 className="text-lg font-semibold mb-2">Roles</h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id} className="border-b">
                <td className="px-4 py-2">{role.role}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    disabled={!hasPermission(userData as TeamMember, "roles", "delete")}
                    onClick={() => handleDeleteRole(role._id)}
                    className={`${!hasPermission(userData as TeamMember, "roles", "delete")
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-500"}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Permissions to Role */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Assign Permissions to Role
        </h2>
        <select
          // disabled={!hasPermission(userData as TeamMember, "role", "permit")}
          className="border rounded px-3 py-2 flex-grow mb-4"
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setSelectedPermissions([]); // Reset selected permissions when role changes
          } }
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.role}
            </option>
          ))}
        </select>
        <h3 className="text-lg font-semibold mb-2">Select Permissions</h3>
        <div className="grid grid-flow-row lg:grid-rows-3 md:grid-cols-6 grid-cols-2 mb-4 ">
          {permissions.map((permission) => (
            <label key={permission._id} className="mr-4">
              <input
                disabled={!hasPermission(userData as TeamMember, "roles", "permit")}
                type="checkbox"
                value={permission._id}
                checked={selectedPermissions.includes(permission._id)} // Check if the permission is included
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedPermissions((prev) => prev.includes(value)
                    ? prev.filter((id) => id !== value)
                    : [...prev, value]
                  );
                } } />
              {permission.permission} ({permission.feature?.feature})
            </label>
          ))}
        </div>
        <button
          disabled={!hasPermission(userData as TeamMember, "roles", "permit")}
          onClick={handleAssignPermissionsToRole}
          className={`${!hasPermission(userData as TeamMember, "roles", "permit")
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500"} text-white rounded px-4`}
        >
          Assign Permissions
        </button>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Assign Role to User</h2>
        <select
          disabled={!hasPermission(userData as TeamMember, "roles", "assign")}
          className="border rounded px-3 py-2 flex-grow mb-4"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        <select
          disabled={!hasPermission(userData as TeamMember, "roles", "assign")}
          className="border rounded px-3 py-2 flex-grow mb-4"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.role}
            </option>
          ))}
        </select>
        <button
          disabled={!hasPermission(userData as TeamMember, "roles", "assign")}
          onClick={handleAssignRoleToUser}
          className={`${!hasPermission(userData as TeamMember, "roles", "assign")
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500"} text-white rounded px-4`}
        >
          Assign Role
        </button>
      </div>
    </div></>
  );
};

export default withAdminAuth(ManageRolesPermissions);
