"use client";
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { FaPlay, FaHistory, FaChartBar, FaSpinner, FaDatabase } from 'react-icons/fa';
import Popup from './Popup';
import Loader from './loader';

interface Backup {
    _id: string;
    status: 'in_progress' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    collections?: {
        name: string;
        status: string;
        documentCount: number;
    }[];
}

interface BackupStats {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
}

const BackupManager: React.FC = () => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [stats, setStats] = useState<BackupStats | null>(null);
    const [currentBackup, setCurrentBackup] = useState<Backup | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [popupMessage, setPopupMessage] = useState('');

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        setPopupType(type);
        setPopupMessage(message);
        setShowPopup(true);
    };

    useEffect(() => {
        const ws = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
            transports: ['websocket']
        });

        ws.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        ws.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        setSocket(ws);

        return () => {
            ws.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && currentBackup) {
            socket.emit('joinBackupRoom', currentBackup._id);
            socket.on('backupUpdate', (backup: Backup) => {
                setCurrentBackup(backup);
                if (backup.status === 'completed' || backup.status === 'failed') {
                    fetchRecentBackups();
                    fetchBackupStats();
                }
            });

            return () => {
                socket.emit('leaveBackupRoom', currentBackup._id);
                socket.off('backupUpdate');
            };
        }
    }, [socket, currentBackup]);

    const fetchRecentBackups = async () => {
        try {
            const response = await axios.get('/api/backup/recent?limit=5');
            setBackups(response.data);
        } catch (error) {
            showNotification('error', 'Failed to fetch recent backups');
        }
    };

    const fetchBackupStats = async () => {
        try {
            const response = await axios.get('/api/backup/statistics');
            setStats(response.data);
        } catch (error) {
            showNotification('error', 'Failed to fetch backup statistics');
        }
    };

    const startBackup = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post('/api/backup/start');
            setCurrentBackup({
                _id: response.data.backupId,
                status: 'in_progress',
                startTime: new Date().toISOString()
            });
            showNotification('success', 'Backup started successfully');
        } catch (error) {
            showNotification('error', 'Failed to start backup');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentBackups();
        fetchBackupStats();
    }, []);

    return (
        <div className="space-y-4">
            {/* Backup Control */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                    <FaDatabase className="text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Backup Control</span>
                </div>
                <button
                    onClick={startBackup}
                    disabled={isLoading || currentBackup?.status === 'in_progress'}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isLoading ? (
                        <FaSpinner className="animate-spin mr-1" />
                    ) : (
                        <FaPlay className="mr-1" />
                    )}
                    Start Backup
                </button>
            </div>

            {/* Current Backup Status */}
            {currentBackup && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Current Backup:</span>
                        <span className={`px-2 py-1 rounded text-sm ${currentBackup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                currentBackup.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                            }`}>
                            {currentBackup.status}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Started: {new Date(currentBackup.startTime).toLocaleString()}
                    </div>
                </div>
            )}

            {/* Recent Backups */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                    <FaHistory className="text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Recent Backups</span>
                </div>
                <div className="space-y-2">
                    {backups.map((backup) => (
                        <div key={backup._id} className="flex justify-between items-center text-xs">
                            <span>{new Date(backup.startTime).toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded ${backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {backup.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                    <FaChartBar className="text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Statistics</span>
                </div>
                {stats && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span>Total:</span>
                            <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Completed:</span>
                            <span className="text-green-600 font-medium">{stats.completed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Failed:</span>
                            <span className="text-red-600 font-medium">{stats.failed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>In Progress:</span>
                            <span className="text-yellow-600 font-medium">{stats.inProgress}</span>
                        </div>
                    </div>
                )}
            </div>

            {showPopup && (
                <Popup
                    type={popupType}
                    message={popupMessage}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

export default BackupManager; 