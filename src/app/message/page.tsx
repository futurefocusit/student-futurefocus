"use client";
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Message {
  _id: number;
  name: string;
  email: string;
  location: number; 
  message: string;
  createdAt: string; 
  status: "read" | "unread"; 
}

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all"); // Active tab for filtering

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/message`); 
        if (!response) {
          throw new Error("Network response was not ok");
        }

        setMessages(response.data);
        setFilteredMessages(response.data); // Initialize with all incidents
      } catch (error) {
        console.error("Error fetching incident data:", error);
        toast.error("Failed to fetch incidents. Check internet connection.");
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(
        messages.filter((message) => message.status === activeTab)
      );
    }
  }, [activeTab, messages]);

  const groupedMessages = filteredMessages.reduce((acc, message) => {
    const date = new Date(message.createdAt).toLocaleDateString(); // Format date
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div>
      <div className="py-4">
        <div className="flex space-x-4">
          <button
            className={`p-2 border-b-2 ${
              activeTab === "all"
                ? "border-blue-500 font-bold"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`p-2 border-b-2 ${
              activeTab === "incident"
                ? "border-blue-500 font-bold"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("read")}
          >
           Read
          </button>
          <button
            className={`p-2 border-b-2 ${
              activeTab === "message"
                ? "border-blue-500 font-bold"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("unread")}
          >
            UnRead
          </button>
        </div>
      </div>
      <div className="overflow-x-auto py-10">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border-b border-gray-300 p-4">Date</th>
              <th className="border-b border-gray-300 p-4">Name</th>
              <th className="border-b border-gray-300 p-4">Email</th>
              <th className="border-b border-gray-300 p-4">Message</th>
              <th className="border-b border-gray-300 p-4">Type</th>
        
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedMessages).map(([date, incidents]) => (
              <React.Fragment key={date}>
                <tr>
                  <td
                    colSpan={7}
                    className="font-bold text-left p-2 bg-gray-100"
                  >
                    {date}
                  </td>
                </tr>
                {incidents.map((incident) => (
                  <tr key={incident._id}>
                    <td className="border-b border-gray-300 p-4">
                      {incident.name}
                    </td>
                    <td className="border-b border-gray-300 p-4">
                      {incident.email}
                    </td>
                   
                    <td className="border-b border-gray-300 p-4">
                      {incident.message}
                    </td>
                    <td className={`border-b border-gray-300 p-4 ${incident.status==='read'?'':'text-green-500'}`}>
                      {incident.status}
                    </td>
                    
                  
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default withAdminAuth(MessagePage);