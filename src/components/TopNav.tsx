import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';

interface TopNavProps {
    userName: string;
    notifications?: Array<{
        id: string;
        message: string;
        read: boolean;
        createdAt: string;
    }>;
}

const TopNav = ({ userName, notifications = [] }: TopNavProps) => {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('ffa-admin');
        router.push('/login');
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex justify-center items-center">
                        <Image src="/xcooll.png" alt="logo" width={100} height={100} />
                        <h1 className="text-xl font-bold text-gray-800"> Admin</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                            >
                                <FaBell className="h-5 w-5" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1 max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-2 text-sm ${!notification.read ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    <p className="text-gray-700">{notification.message}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-500">
                                                No notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-2 p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FaUser className="h-5 w-5" />
                                <span className="hidden sm:inline-block text-sm font-medium">
                                    {userName}
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <FaSignOutAlt className="mr-2 h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNav; 