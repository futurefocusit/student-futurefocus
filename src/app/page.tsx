"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import withAdminAuth from "@/components/withAdminAuth";

interface Dashboard {
  totalStudents: string;
  totalPayments: string;
  totalPaid: string;
  totalUnpaid: string;
  totalPartial: string;
  totalOverpaid: string;
  totalAmountPaid: number;
  totalAmountUnpaid: number;
  totalPending: string;
  totalAccepted: string;
  totalRegistered: string;
  totalCompleted: string;
  totalDroppedOut: string;
  totalAmountTobePaid: number;
  totalAmountOverpaid:number;

}

const Dashboard = () => {
  const [summary, setSummary] = useState<Dashboard>({
    totalStudents: "",
    totalPayments: "",
    totalPaid: "",
    totalUnpaid: "",
    totalPartial: "",
    totalOverpaid: "",
    totalAmountPaid: 0,
    totalAmountUnpaid: 0,
    totalPending: "",
    totalAccepted: "",
    totalRegistered: "",
    totalCompleted: "",
    totalDroppedOut: "",
    totalAmountTobePaid:0,
    totalAmountOverpaid:0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);
        setSummary(response.data);
      } catch (error) {
        //@ts-expect-error ignore error
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p>Loading...</p>;
  //@ts-expect-error ignore error
  if (error) return <p>Error loading summary: {error.message}</p>;

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard Summary</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Total Students: {summary.totalStudents}</li>
          <li>Total Pending Students: {summary.totalPending}</li>
          <li>Total Accepted Students: {summary.totalAccepted}</li>
          <li>Total Registered Students: {summary.totalRegistered}</li>
          <li>Total Completed Students: {summary.totalCompleted}</li>
          <li>Total Dropped Out Students: {summary.totalDroppedOut}</li>
          <li>Total Payments: {summary.totalPayments}</li>
          <li>Total Paid: {summary.totalPaid}</li>
          <li>Total Unpaid: {summary.totalUnpaid}</li>
          <li>Total Partial Payments: {summary.totalPartial}</li>
          <li>Total Overpaid: {summary.totalOverpaid}</li>
          <li>Total Amount Paid: ${summary.totalAmountPaid.toFixed(0)}</li>
          <li>Total Amount Unpaid: ${summary.totalAmountUnpaid.toFixed(0)}</li>
          <li>Total Amount Tobe Paid: ${summary.totalAmountTobePaid.toFixed(0)}</li>
          <li>Total Amount Overpaid: ${summary.totalAmountOverpaid.toFixed(0)}</li>
        </ul>
      </div>
    </div>
  );
};

export default withAdminAuth(Dashboard);
