"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashRestore, FaTrash, FaUser, FaMoneyBill, FaBookOpen, FaCalendar, FaClock, FaCalendarCheck, FaToolbox, FaExchangeAlt, FaTeamspeak, FaTasks, FaMoneyBillAlt } from 'react-icons/fa';
import withAdminAuth from '@/components/withAdminAuth';
import SideBar from '@/components/SideBar';
import Loader from '@/components/loader';
import Popup from '@/components/Popup';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/libs/hasPermission';
import API_BASE_URL from '@/config/baseURL';
import { headers } from 'next/headers';


interface BaseDeletedItem {
    _id: string;
    institution: string;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
}

interface DeletedStudent extends BaseDeletedItem {
    name: string;
    email: string;
    phone: string;
    selectedCourse: string;
    selectedShift: string;
    intake: string;
    message?: string;
    status: string;
}

interface DeletedPayment extends BaseDeletedItem {
    studentId: { name: string };
    status: string;
    amountDue: number;
    amountPaid: number;
    amountDiscounted: number;
    extraAmount: number;
}

interface DeletedCourse extends BaseDeletedItem {
    title: string;
    rating: number;
    image: string;
    scholarship: number;
    nonScholarship: number;
    active: boolean;
    shifts: string[];
}

interface DeletedShift extends BaseDeletedItem {
    name: string;
    start: string;
    end: string;
    days: string;
}
interface DeletedRole extends BaseDeletedItem {
    role: string;

}

// Add new interfaces for additional types
interface DeletedAttendance extends BaseDeletedItem {
    studentId: { name: string };
    date: string;
    status: 'present' | 'absent' | 'late';
    type: 'student' | 'staff';
    reason?: string;
}

interface DeletedInventory extends BaseDeletedItem {
    materialName: string;
    amount: number;

}

interface DeletedCashflow extends BaseDeletedItem {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
}

interface DeletedTeam extends BaseDeletedItem {
    name: string;
    position: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'inactive';
}

interface DeletedTask extends BaseDeletedItem {
    task: string;
    description: string;
    user: { name: string };
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
}

interface DeletedTransaction extends BaseDeletedItem {
    studentId: { name: string };
    type: 'payment' | 'refund';
    amount: number;
    paymentMethod: string;
    status: 'pending' | 'completed' | 'failed';
    reference: string;
}

// Update the DeletedItem type
type DeletedItem =
    | DeletedStudent
    | DeletedPayment
    | DeletedCourse
    | DeletedShift
    | DeletedAttendance
    | DeletedInventory
    | DeletedCashflow
    | DeletedTeam
    | DeletedTask
    | DeletedRole
    | DeletedTransaction;

interface DeletedItemsResponse {
    message: string;
    data: {
        Student?: DeletedStudent[];
        Payment?: DeletedPayment[];
        Course?: DeletedCourse[];
        Shift?: DeletedShift[];
        Attendance?: DeletedAttendance[];
        Inventory?: DeletedInventory[];
        Cashflow?: DeletedCashflow[];
        Team?: DeletedTeam[];
        Task?: DeletedTask[];
        Transaction?: DeletedTransaction[];
        Role?: DeletedRole[];
    };
}

interface Message {
    type: 'success' | 'error' | 'info';
    text: string;
}

// Update the ItemType type
type ItemType =
    | 'Student'
    | 'Payment'
    | 'Course'
    | 'Shift'
    | 'Attendance'
    | 'Material'
    | 'Cashflow'
    | 'Team'
    | 'Role'
    | 'Task'
    | 'Transaction';

const tabConfig = [
    { id: 'Student', label: 'Students', icon: FaUser },
    { id: 'Payment', label: 'Payments', icon: FaMoneyBill },
    { id: 'Course', label: 'Courses', icon: FaBookOpen },
    { id: 'Shift', label: 'Shifts', icon: FaClock },
    { id: 'Attendance', label: 'Attendance', icon: FaCalendarCheck },
    { id: 'Material', label: 'Inventory', icon: FaToolbox },
    { id: 'Role', label: 'Role', icon: FaUser },
    { id: 'Cashflow', label: 'Cashflow', icon: FaMoneyBillAlt },
    { id: 'Team', label: 'Team', icon: FaTeamspeak },
    { id: 'Task', label: 'Tasks', icon: FaTasks },
    { id: 'Transaction', label: 'Transactions', icon: FaExchangeAlt },
] as const;

const RecycleBinPage: React.FC = () => {
    const [deletedItems, setDeletedItems] = useState<DeletedItemsResponse['data']>({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<Message | null>(null);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ItemType>('Student');
    const { loggedUser } = useAuth();

    const fetchDeletedItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get<DeletedItemsResponse>(`${API_BASE_URL}/deleted/all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('ffa-admin')}`
                }
            });
            setDeletedItems(response.data.data);
        } catch (error) {
            console.error('Error fetching deleted items:', error);
            setMessage({
                type: 'error',
                text: 'Failed to load deleted items'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedItems();
    }, []);

    const handleRestore = async (itemType: ItemType, itemId: string) => {
        try {
            setRestoringId(itemId);
            const response = await axios.put(
                `${API_BASE_URL}/deleted/restore/${itemType}/${itemId}`,{},{
                    headers:{
                        "Authorization":`Bearer ${localStorage.getItem('ffa-admin')}`
                    }
                }
               
            );

         
            setDeletedItems(prev => ({
                ...prev,
                [itemType]: prev[itemType]?.filter(item => item._id !== itemId)
            }));

            setMessage({
                type: 'success',
                text: `${itemType} restored successfully`
            });
        } catch (error) {
            console.error('Error restoring item:', error);
            setMessage({
                type: 'error',
                text: `Failed to restore ${itemType.toLowerCase()}`
            });
        } finally {
            setRestoringId(null);
        }
    };

    const handleDeletePermanently = async (itemType: ItemType, itemId: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete this ${itemType.toLowerCase()}?`)) {
            return;
        }

        try {
            setDeletingId(itemId);
            await axios.delete(`${API_BASE_URL}/deleted/${itemType}/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('ffa-admin')}`
                }
            });

            // Update the items list by removing the deleted item
            setDeletedItems(prev => ({
                ...prev,
                [itemType]: prev[itemType]?.filter(item => item._id !== itemId)
            }));

            setMessage({
                type: 'success',
                text: `${itemType} permanently deleted`
            });
        } catch (error) {
            console.error('Error deleting item permanently:', error);
            setMessage({
                type: 'error',
                text: `Failed to delete ${itemType.toLowerCase()}`
            });
        } finally {
            setDeletingId(null);
        }
    };

    const canRestore = loggedUser ? hasPermission(loggedUser, 'recycle-bin', 'restore') : false;
    const canDeletePermanently = loggedUser ? hasPermission(loggedUser, 'recycle-bin', 'delete') : false;

    const renderItemDetails = (item: DeletedItem, type: ItemType) => {
        switch (type) {
            case 'Student':
                const student = item as DeletedStudent;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.intake}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.status}</td>
                    </>
                );
            case 'Payment':
                const payment = item as DeletedPayment;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.studentId?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {payment.amountDue.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {payment.amountPaid.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {payment.amountDiscounted.toLocaleString()}</td>
                    </>
                );
            case 'Course':
                const course = item as DeletedCourse;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.rating}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {course.scholarship.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {course.nonScholarship.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.active ? 'Active' : 'Inactive'}</td>
                    </>
                );
            case 'Shift':
                const shift = item as DeletedShift;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shift.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.start}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.end}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.days}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(shift.createdAt).toLocaleDateString()}
                        </td>
                    </>
                );
            case 'Attendance':
                const attendance = item as DeletedAttendance;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendance.studentId?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(attendance.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendance.reason || '-'}</td>
                    </>
                );
            case 'Material':
                const inventory = item as DeletedInventory;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inventory.materialName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inventory.amount}</td>

                    </>
                );
            case 'Cashflow':
                const cashflow = item as DeletedCashflow;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cashflow.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {cashflow.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cashflow.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cashflow.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(cashflow.date).toLocaleDateString()}
                        </td>
                    </>
                );
            case 'Team':
                const team = item as DeletedTeam;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.status}</td>
                    </>
                );
            case 'Task':
                const task = item as DeletedTask;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.task}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                    </>
                );
            case 'Transaction':
                const transaction = item as DeletedTransaction;
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.studentId.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RWF {transaction.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.status}</td>
                    </>
                );
        }
    };

    const getTableHeaders = (type: ItemType) => {
        switch (type) {
            case 'Student':
                return ['Name', 'Email', 'Phone', 'Intake', 'Status'];
            case 'Payment':
                return ['Student ID', 'Status', 'Amount Due', 'Amount Paid', 'Amount Discounted'];
            case 'Course':
                return ['Title', 'Rating', 'Scholarship', 'Non-Scholarship', 'Status'];
            case 'Shift':
                return ['Name', 'Start Time', 'End Time', 'Days', 'Created At'];
            case 'Attendance':
                return ['Student ID', 'Date', 'Status', 'Type', 'Reason'];
            case 'Material':
                return ['Name', 'Quantity'];
            case 'Cashflow':
                return ['Type', 'Amount', 'Category', 'Payment Method', 'Date'];
            case 'Team':
                return ['Name', 'Position', 'Email', 'Role', 'Status'];
            case 'Task':
                return ['Title', 'Assigned To', 'Status', 'Priority', 'Due Date'];
            case 'Transaction':
                return ['Student', 'Type', 'Amount', 'Payment Method', 'Status'];
        }
    };

    return (
        <div className="py-6 w-fit md:max-w-6xl  sm:px-6 md:mx-auto ">
            <SideBar />
            <div className="md:overflow-x-hidden">
                <div className="flex justify-around items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">RECYCLE BIN</h1>
                    <button
                        onClick={fetchDeletedItems}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>

                {message && (
                    <Popup
                        type={message.type}
                        message={message.text}
                        onClose={() => setMessage(null)}
                    />
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                    <nav className=" flex space-x-8">
                        {tabConfig?.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as ItemType)}
                                className={`
                  flex items-center px-1 py-4 border-b-2 font-medium text-sm
                  ${activeTab === id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                <Icon className="mr-2" />
                                {label}
                                {deletedItems[id] && deletedItems[id]!.length > 0 && (
                                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                        {deletedItems[id]!.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader text="Loading deleted items..." />
                    </div>
                ) : !deletedItems[activeTab] || deletedItems[activeTab]!.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No deleted {activeTab.toLowerCase()}s found</p>
                    </div>
                ) : (
                    <div className="bg-white shadow md:overflow-x-auto sm:rounded-lg">
                        <div className="">
                            <table className="divide-y divide-gray-200 overflow-x-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {getTableHeaders(activeTab)?.map((header, index) => (
                                            <th
                                                key={index}
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 overflow-x-scroll">
                                    {deletedItems[activeTab]?.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            {renderItemDetails(item, activeTab)}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => handleRestore(activeTab, item._id)}
                                                    disabled={restoringId === item._id}
                                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white 
                            ${ restoringId === item._id
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                        }`}
                                                >
                                                    <FaTrashRestore className="mr-1.5" />
                                                    {restoringId === item._id ? 'Restoring...' : 'Restore'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePermanently(activeTab, item._id)}
                                                    disabled={ deletingId === item._id}
                                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white 
                            ${ deletingId === item._id
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700'
                                                        }`}
                                                >
                                                    <FaTrash className="mr-1.5" />
                                                    {deletingId === item._id ? 'Deleting...' : 'Delete Permanently'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAdminAuth(RecycleBinPage);