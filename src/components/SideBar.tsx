"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaUser,
  FaMoneyBill,
  FaExchangeAlt,
  FaCalendarCheck,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillAlt,
  FaClock,
  FaTasks,
  FaClipboardList,
  FaToolbox,
  FaCode,
  FaBookOpen,
  FaCalendar,
  FaTeamspeak,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaHouseCrack, FaLockOpen, FaMessage, FaRightFromBracket, FaWebAwesome } from "react-icons/fa6";
import { MdEventAvailable } from "react-icons/md";
import Image from "next/image";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { fetchLoggedUser, logout, loggedUser, loading } = useAuth();


  const menuItems = [
    { label: "DASHBOARD", icon: FaTachometerAlt, href: "/dashboard", admin: true },
    { label: "STUDENTS", icon: FaUser, href: "/students", admin: true },
    {
      label: "STUDENT ATTENDANCE",
      icon: FaCalendarCheck,
      href: "/attendance",
      admin: true,
    },

    {
      label: "Team",
      icon: FaTeamspeak,
      href: "/members",
      admin: true,
    },
    {
      label: "COURSES",
      icon: FaBookOpen,
      href: "/course",
      admin: true,
    },
    {
      label: "INTAKE",
      icon: FaCalendar,
      href: "/intake",
      admin: true,
    },
    {
      label: "SHIFT",
      icon: FaHouseCrack,
      href: "/shift",
      admin: true,
    },
    {
      label: "STAFF ATTENDANCE",
      icon: FaClock,
      href: "/attendance/staff",
      admin: true,
    },
    { label: "MY ATTENDANCE", icon: MdEventAvailable, href: "/staff" },

    { label: "TASK", icon: FaTasks, href: "/tasks", admin: true },
    { label: "MY TASK", icon: FaClipboardList, href: "/staff/task" },

    { label: "PAYMENT", icon: FaMoneyBill, href: "/payment", admin: true },
    {
      label: "TRANSACTIONS",
      icon: FaExchangeAlt,
      href: "/transactions",
      admin: true,
    },
    { label: "CASHFLOW", icon: FaMoneyBillAlt, href: "/cashflow", admin: true },

    { label: "INVENTORY", icon: FaToolbox, href: "/inventory", admin: true },
    {
      label: "MANAGE ROLE",
      icon: FaLockOpen,
      href: "/manage-role",
      admin: true,
    },
    {
      label: "MESSAGE",
      icon: FaMessage,
      href: "/message",
      admin: true,
    },

    {
      label: "TECHUP PROGRAM",
      icon: FaCode,
      href: "/techups",
      admin: true,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      await fetchLoggedUser();
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading && !loggedUser) {
      logout();
    }
  }, [loading, loggedUser, logout]);

  const handleLogout = async () => {
    await logout();
  };
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden text-white bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <div
        className={`flex flex-col fixed top-0 left-0 ${isOpen ? " bg-gray-800" : ""
          } lg:bg-gray-800 z-30 justify-between  h-full`}
      >
        <nav
          ref={sidebarRef}
          className={` flex flex-col h-screen justify-between py-8 overflow-y-auto transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 ${isExpanded ? "w-72" : "w-20"}`}
        >
          <div className="flex items-center justify-between mb-6 px-4">
            <h2
              className={`text-2xl font-semibold text-white ${isExpanded ? "" : "hidden"
                }`}
            >
              MENU
            </h2>
            <button
              onClick={toggleExpand}
              className="hidden md:block text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg"
            >
              {isExpanded ? (
                <FaChevronLeft size={20} />
              ) : (
                <FaChevronRight size={20} />
              )}
            </button>
          </div>
          <img
            src={loggedUser?.institution?.logo} alt={`${loggedUser?.institution?.logo}'s logo`} className="rounded-full  bg-gray-600 w-10 h-10 " />
          <div className="">
            {menuItems
              .filter(
                (item) => !item.admin || (item.admin && loggedUser?.isAdmin)
              )
              .map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center px-4 py-2 mt-2 text-gray-300 transition-colors duration-300 transform rounded-md hover:bg-gray-700 hover:text-white ${isExpanded ? "" : "justify-center"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span
                    className={`mx-4 font-medium ${isExpanded ? "" : "hidden"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
          </div>

          <div className="px-4">
            <a
              href="https://www.futurefocus.co.rw/admin"
              className={`flex items-center px-4 py-2 mb-10 text-gray-300 transition-colors duration-300 transform rounded-md hover:bg-gray-700 hover:text-white ${loggedUser && loggedUser.isAdmin ? '' : 'hidden'} `}
            >
              <FaWebAwesome className="w-5 h-5" />
              <p className={`mx-4 font-medium ${isExpanded ? "" : "hidden"}`}>
                Go to web
              </p>
            </a>
            <button
              className={`flex items-center px-4 py-2 mb-10 text-gray-300 transition-colors duration-300 transform rounded-md hover:bg-gray-700 hover:text-white `}
              onClick={handleLogout}
            >
              <FaRightFromBracket className="w-5 h-5" />
              <p className={`mx-4 font-medium ${isExpanded ? "" : "hidden"}`}>
                Logout
              </p>
            </button>
            <div className="flex flex-row ">
              <img src={loggedUser.image} alt={`${loggedUser.name}'s profile`} className="rounded-full  bg-gray-600 w-10 h-10 " />
              <span className="flex flex-col  items-center">
                <p
                  className={`mx-4 text-sm text-white ${isExpanded ? "" : "hidden"
                    }`}
                >
                  {loggedUser?.name}
                </p>
                <p
                  className={`mx-4 font-medium text-gray-400 ${isExpanded ? "" : "hidden"
                    }`}
                >
                  {loggedUser?.role?.role || loggedUser?.position}
                </p>
              </span>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SideBar;
