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
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaRightFromBracket, FaWebAwesome } from "react-icons/fa6";
import { IUser } from "@/types/types";
import { fetchUser, getLoggedUserData } from "@/context/adminAuth";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<IUser>();

  const { logout } = useAuth();

  const menuItems = [
    { label: "Dashboard", icon: FaTachometerAlt, href: "/" },
    { label: "Students", icon: FaUser, href: "/students" },
    { label: "Payment", icon: FaMoneyBill, href: "/payment" },
    { label: "Transaction", icon: FaExchangeAlt, href: "/transactions" },
    { label: "Attendances", icon: FaCalendarCheck, href: "/attendance" },
    { label: "Cashflow", icon: FaMoneyBillAlt, href: "/cashflow" },
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
      await fetchUser();
      setUserData(await getLoggedUserData());
    };
    fetchUserData();
  }, []);
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
        className={`flex flex-col fixed top-0 left-0 ${
          isOpen ? " bg-gray-800" : ""
        } lg:bg-gray-800 z-30 justify-between  h-full`}
      >
        <nav
          ref={sidebarRef}
          className={` flex flex-col h-screen justify-between py-8 overflow-y-auto transition-all duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 ${isExpanded ? "w-64" : "w-20"}`}
        >
          <div className="flex items-center justify-between mb-6 px-4">
            <h2
              className={`text-2xl font-semibold text-white ${
                isExpanded ? "" : "hidden"
              }`}
            >
              Menu
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
          <div className="">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center px-4 py-2 mt-2 text-gray-300 transition-colors duration-300 transform rounded-md hover:bg-gray-700 hover:text-white ${
                  isExpanded ? "" : "justify-center"
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
              className={`flex items-center px-4 py-2 mb-10 text-gray-300 transition-colors duration-300 transform rounded-md hover:bg-gray-700 hover:text-white `}
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
              <FaUser className="rounded-full p-2 bg-gray-600 w-10 h-10 " />
              <span className="flex flex-col  items-center">
                <p
                  className={`mx-4 text-sm text-white ${
                    isExpanded ? "" : "hidden"
                  }`}
                >
                  {userData?.name}
                </p>
                <p
                  className={`mx-4 font-medium text-gray-400 ${
                    isExpanded ? "" : "hidden"
                  }`}
                >
                  {userData?.role.role}
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
