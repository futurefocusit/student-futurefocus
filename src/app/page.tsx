"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import withAdminAuth from "@/components/withAdminAuth";
import SideBar from "@/components/SideBar";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import Loader from "@/components/loader";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler
);

interface Dashboard {
  totalStudents: number;
  studentStatusCounts: {
    pending: number;
    started: number;
    registered: number;
    accepted: number;
    droppedOut: number;
    completed: number;
  };
  totalPayments: number;
  paymentStatusCounts: {
    unpaid: number;
    partial: number;
    paid: number;
  };
  totalAmountPaid: number;
  totalAmountToBePaid: number;
  shiftStudents: {
    _id: string;
    total: number;
    pending: number;
    accepted: number;
    registered: number;
    started: number;
    completed: number;
    droppedout: number;
  }[];
  shiftPayments: {
    _id: string;
    totalPaid: number;
    totalDue: number;
    totalUnpaid: number;
  }[];
  monthlyCashflows: {
    _id: number;
    totalIncome: number;
    totalExpenses: number;
  }[];
}

const Dashboard = () => {
  const [summary, setSummary] = useState<Dashboard>({
    totalStudents: 0,
    studentStatusCounts: {
      pending: 0,
      started: 0,
      registered: 0,
      accepted: 0,
      droppedOut: 0,
      completed: 0,
    },
    totalPayments: 0,
    paymentStatusCounts: { unpaid: 0, partial: 0, paid: 0 },
    totalAmountPaid: 0,
    totalAmountToBePaid: 0,
    shiftStudents: [],
    shiftPayments: [],
    monthlyCashflows: [],
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

  if (loading)
    return (
      <div className="flex flex-col items-center p-4">
        <SideBar />
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center p-4">
        <SideBar />
        {/* @ts-expect-error ignore error */}
        Error loading summary: {error.message}
      </div>
    );

  const shifts = summary.shiftStudents.map((ss) => ss._id);

  const cashflowMonths = summary.monthlyCashflows.map(
    (cf) => `Month ${cf._id}`
  );
  const cashflowIncome = summary.monthlyCashflows.map((cf) => cf.totalIncome);
  const cashflowExpenses = summary.monthlyCashflows.map(
    (cf) => cf.totalExpenses
  );

  // In your Dashboard component

  // Students Chart Data
  const studentsData = {
    labels: summary.shiftStudents.map((ss) => ss._id),
    datasets: [
      {
        label: "Pending",
        data: summary.shiftStudents.map((ss) => ss.pending),
        backgroundColor: "rgba(255, 206, 86, 0.6)", // Yellow
      },
      {
        label: "Accepted",
        data: summary.shiftStudents.map((ss) => ss.accepted),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Green
      },
      {
        label: "Registered",
        data: summary.shiftStudents.map((ss) => ss.registered),
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
      },
      {
        label: "Started",
        data: summary.shiftStudents.map((ss) => ss.started),
        backgroundColor: "rgba(153, 102, 255, 0.6)", // Purple
      },
      {
        label: "Completed",
        data: summary.shiftStudents.map((ss) => ss.completed),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Another green
      },
      {
        label: "Dropped Out",
        data: summary.shiftStudents.map((ss) => ss.droppedout),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        type: "category",
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          //@ts-expect-error error
          footer: (tooltipItems) => {
            const shift = tooltipItems[0].label;
            const shiftData = summary.shiftStudents.find(
              (ss) => ss._id === shift
            );
            return `Total: ${shiftData?.total || 0}`;
          },
        },
      },
    },
  };

  // In your JSX
  <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
    <h2 className="text-2xl font-semibold mb-4">
      Students by Shift and Status
    </h2>
    {/* @ts-expect-error error */}
    <Bar data={studentsData} options={options} />
  </div>;
  // Payments Chart Data
  const paymentsData = {
    labels: shifts,
    datasets: [
      {
        label: "Paid Amounts by Shift",
        data: summary.shiftPayments.map((sp) => sp.totalPaid),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Unpaid Amounts by Shift",
        data: summary.shiftPayments.map((sp) => sp.totalUnpaid),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Total Amount Due by Shift",
        data: summary.shiftPayments.map((sp) => sp.totalDue),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  // Cashflows Line Graph Data
  const cashflowData = {
    labels: cashflowMonths,
    datasets: [
      {
        label: "Total Income",
        data: cashflowIncome,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Total Expenses",
        data: cashflowExpenses,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  

  return (
    <div className="flex flex-col md:items-center p-4">
      <SideBar />
      <h1 className="text-3xl font-bold mb-4">Dashboard Summary</h1>

      {/* Overview Section with Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6  gap-4 w-full max-w-64 md:max-w-xl lg:max-w-6xl">
        {/* Student Status Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Total Students</h3>
          <p className="text-2xl font-bold">{summary.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Candidates</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.pending}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Active Students</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.started}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Registered Students</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.registered}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Admitted Students</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.accepted}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Dropped Out Students</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.droppedOut || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Completed Students</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.completed || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Unpaid Students</h3>
          <p className="text-2xl font-bold">
            {summary.paymentStatusCounts.unpaid}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Partial Paid Student</h3>
          <p className="text-2xl font-bold">
            {summary.paymentStatusCounts.partial}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">completed Payments</h3>
          <p className="text-2xl font-bold">
            {summary.paymentStatusCounts.paid}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Total Amount Paid</h3>
          <p className="text-2xl font-bold">
            ${summary.totalAmountPaid.toFixed(0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Total Amount To Be Paid</h3>
          <p className="text-2xl font-bold">
            ${summary.totalAmountToBePaid.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl  mt-6">
        <h2 className="text-2xl font-semibold mb-4">Students Statistics</h2>
        {/* @ts-expect-error error */}
        <Bar data={studentsData} options={options} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
        <h2 className="text-2xl font-semibold mb-4">Payments Statistics</h2>
        {/* @ts-expect-error error */}
        <Bar data={paymentsData} options={options} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
        <h2 className="text-2xl font-semibold mb-4">Monthly Cash Flow</h2>
        <Line data={cashflowData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default withAdminAuth(Dashboard);
