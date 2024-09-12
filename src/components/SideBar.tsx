import React, { ReactNode } from "react";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaUser,
  FaMoneyBill,
  FaExchangeAlt,
  FaCalendarCheck,
} from "react-icons/fa";


const SideBar = () => {
  return (
      <nav className="flex  flex-col gap-5 px-6  w-64   bg-gray-800 text-white h-screen min-h-screen ">
        <a
          aria-label="Dashboard"
          className="flex items-center gap-2 text-2xl font-bold hover:text-gray-400 w-full"
        >
          <FaTachometerAlt /> Dashboard
        </a>

        <a
          aria-label="Students"
          className="flex items-center gap-2 text-2xl font-bold hover:text-gray-400 w-full"
        >
          <FaUser /> Students
        </a>

        <a
          aria-label="Payment"
          className="flex items-center gap-2 text-2xl font-bold hover:text-gray-400 w-full"
        >
          <FaMoneyBill /> Payment
        </a>

        <a
          aria-label="Transaction"
          className="flex items-center gap-2 text-2xl font-bold hover:text-gray-400 w-full"
        >
          <FaExchangeAlt /> Transaction
        </a>

        <a
          aria-label="Attendances"
          className="flex items-center gap-2 text-2xl font-bold hover:text-gray-400 w-full"
        >
          <FaCalendarCheck /> Attendances
        </a>
      </nav>
      
  );
};

export default SideBar;
