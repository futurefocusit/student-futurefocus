"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import axios from 'axios';

const Viewer: React.FC = () => {
    const searchParams = useSearchParams();
    const [fileUrl, setFileUrl] = useState<string>('');
    const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);

    useEffect(() => {
        const fetchFile = async () => {
            const url = searchParams.get('url');
            if (!url) {
                setError('No file URL provided');
                setLoading(false);
                return;
            }

            try {
                // Determine file type from URL
                const isPdf = url.toLowerCase().endsWith('.pdf');
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

                if (!isPdf && !isImage) {
                    setError('Unsupported file type');
                    setLoading(false);
                    return;
                }

                // For PDFs, we need to fetch the content
                if (isPdf) {
                    const response = await axios.get(url, {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('ffa-admin')}`,
                        },
                    });

                    // Create a blob URL from the response
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    setFileContent(blobUrl);
                } else {
                    // For images, we can use the URL directly
                    setFileUrl(url);
                }

                setFileType(isPdf ? 'pdf' : 'image');
                setLoading(false);
            } catch (err) {
                console.error('Error fetching file:', err);
                setError('Failed to load file. Please check the URL and try again.');
                setLoading(false);
            }
        };

        fetchFile();

        // Cleanup function to revoke blob URL
        return () => {
            if (fileContent) {
                URL.revokeObjectURL(fileContent);
            }
        };
    }, [searchParams]);

    if (loading) {
        return (
            <div>
                <SideBar />
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <SideBar />
                <div className="flex justify-center items-center h-screen">
                    <div className="text-red-500 text-xl">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <SideBar />
            <div className="p-6 ml-64">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {fileType === 'pdf' ? (
                        <iframe
                            src={fileContent || ''}
                            className="w-full h-[80vh]"
                            title="PDF Viewer"
                        />
                    ) : fileType === 'image' ? (
                        <div className="flex justify-center">
                            <img
                                src={fileUrl}
                                alt="Displayed content"
                                className="max-w-full max-h-[80vh] object-contain"
                                onError={(e) => {
                                    setError('Failed to load image. Please check the URL and try again.');
                                }}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default withAdminAuth(Viewer); 