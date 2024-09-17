'use client'
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
} from "react-icons/fa";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: "Dashboard", icon: FaTachometerAlt, href: "/" },
    { label: "Students", icon: FaUser, href: "/students" },
    { label: "Payment", icon: FaMoneyBill, href: "/payment" },
    { label: "Transaction", icon: FaExchangeAlt, href: "#" },
    { label: "Attendances", icon: FaCalendarCheck, href: "#" },
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

      
      <nav
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-30 flex flex-col h-screen py-8 overflow-y-auto bg-gray-800 transition-all duration-300 ease-in-out ${
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
            <span className={`mx-4 font-medium ${isExpanded ? "" : "hidden"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default SideBar;
