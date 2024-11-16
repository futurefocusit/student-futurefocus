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
import { hasPermission } from "@/libs/hasPermission";
import {  useAuth } from "@/context/AuthContext";
import { TeamMember } from "@/types/types";


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
    droppedout: number;
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
      droppedout: 0,
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
  const { fetchLoggedUser, loggedUser } = useAuth();


  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/others/dashboard`);
        setSummary(response.data);
        await fetchLoggedUser();
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
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
      {
        label: "Accepted",
        data: summary.shiftStudents.map((ss) => ss.accepted),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Registered",
        data: summary.shiftStudents.map((ss) => ss.registered),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Started",
        data: summary.shiftStudents.map((ss) => ss.started),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Completed",
        data: summary.shiftStudents.map((ss) => ss.completed),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
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
      <h1 className="text-3xl font-bold mb-4">DASHBOARD</h1>
      {/* Overview Section with Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6  gap-4 w-full max-w-64 md:max-w-xl lg:max-w-6xl">
        {/* Student Status Cards */}

        <a
          href="/students"
          className="text-white p-6 rounded-lg shadow-md text-center bg-yellow-800"
        >
          <h3 className="text-lg font-semibold ">CANDIDATES</h3>
          <p className="text-2xl font-bold ">
            {summary.studentStatusCounts.pending}
          </p>
        </a>
        <a
          href="/students?filter=accepted"
          className="bg-blue-800 p-6 rounded-lg shadow-md text-white text-center"
        >
          <h3 className="text-lg font-semibold">ADMITTED</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.accepted}
          </p>
        </a>

        <a
          href="/students?filter=registered"
          className="bg-green-700 text-white p-6 rounded-lg shadow-md text-center"
        >
          <h3 className="text-lg font-semibold">REGISTRED</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.registered}
          </p>
        </a>
        <a
          href="/students?filter=started"
          className="text-white bg-green-500 p-6 rounded-lg shadow-md text-center"
        >
          <h3 className="text-lg font-semibold">ACTIVE</h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.started}
          </p>
        </a>
        <a
          href="/students?filter=droppedOut"
          className="text-white p-6 rounded-lg shadow-md text-center bg-red-900"
        >
          <h3 className="text-lg font-semibold">DROPOUT </h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.droppedout || 0}
          </p>
        </a>
        <a
          href="/students/?filter=completed"
          className="text-white p-6 rounded-lg shadow-md text-center bg-green-950"
        >
          <h3 className="text-lg font-semibold">COMPLETED </h3>
          <p className="text-2xl font-bold">
            {summary.studentStatusCounts.completed || 0}
          </p>
        </a>

        {hasPermission(
          loggedUser as TeamMember,
          "dashboard",
          "view-dashboard"
        ) ? (
          <a
            href="/payment"
            className="text-white bg-red-950 p-6 rounded-lg shadow-md text-center"
          >
            <h3 className="text-lg font-semibold ">NOT PAID</h3>
            <p className="text-2xl font-bold">
              {summary.paymentStatusCounts.unpaid}
            </p>
          </a>
        ) : (
          ""
        )}
        {hasPermission(
          loggedUser as TeamMember,
          "dashboard",
          "view-dashboard"
        ) ? (
          <a
            href="/payment"
            className="text-white p-6 rounded-lg shadow-md text-center bg-yellow-500"
          >
            <h3 className="text-lg font-semibold">PARTIAL PAID </h3>
            <p className="text-2xl font-bold">
              {summary.paymentStatusCounts.partial}
            </p>
          </a>
        ) : (
          ""
        )}
        {hasPermission(
          loggedUser as TeamMember,
          "dashboard",
          "view-dashboard"
        ) ? (
          <a
            href="/payment"
            className="text-white p-6 rounded-lg shadow-md text-center bg-green-700"
          >
            <h3 className="text-lg font-semibold">FULL PAID</h3>
            <p className="text-2xl font-bold">
              {summary.paymentStatusCounts.paid}
            </p>
          </a>
        ) : (
          ""
        )}
        <a
          href="/students"
          className="bg-white p-6 rounded-lg shadow-md text-center"
        >
          <h3 className="text-lg font-semibold">TOTAL STUDENTS</h3>
          <p className="text-2xl font-bold">{summary.totalStudents}</p>
        </a>
        {hasPermission(
          loggedUser as TeamMember,
          "dashboard",
          "view-dashboard"
        ) ? (
          <a
            href="/payment"
            className="text-white bg-red-200 font-extrabold p-6 rounded-lg shadow-md text-center"
          >
            <h3 className="text-lg font-semibold">TOTAL TO BE PAID</h3>
            <p className="text-2xl font-bold">
              {summary.totalAmountToBePaid.toLocaleString()}
            </p>
          </a>
        ) : (
          ""
        )}
        {hasPermission(
          loggedUser as TeamMember,
          "dashboard",
          "view-dashboard"
        ) ? (
          <a className="bg-green-800 text-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold ">TOTAL PAID</h3>
            <p className="text-2xl font-bold">
              {summary.totalAmountPaid.toLocaleString()}
            </p>
          </a>
        ) : (
          ""
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl  mt-6">
        <h2 className="text-2xl font-semibold text-center mb-4">STUDENT STATISTICS</h2>
        {/* @ts-expect-error error */}
        <Bar data={studentsData} options={options} />
      </div>
      {hasPermission(
        loggedUser as TeamMember,
        "dashboard",
        "view-dashboard"
      ) ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">PAYMENT STATISTICS</h2>
          {/* @ts-expect-error error */}
          <Bar data={paymentsData} options={options} />
        </div>
      ) : (
        ""
      )}

      {hasPermission(
        loggedUser as TeamMember,
        "dashboard",
        "view-dashboard"
      ) ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">MONTHLY CASHFLOW</h2>
          <Line data={cashflowData} options={{ responsive: true }} />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default withAdminAuth(Dashboard);
