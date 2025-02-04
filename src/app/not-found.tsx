'use client'
import Image from "next/image";
import { useEffect } from "react";




const Custom404: React.FC = () => {


  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href="/";
    }, 5000);

    return () => clearTimeout(timeout); 
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Image src={"/logo.png"} width={200} height={200} alt="" />
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-4 text-lg">
        Oops! The page you &lsqou;re looking for doesn&lsqou;t exist.
      </p>
      <p className="mt-2">You will be redirected to the homepage shortly...</p>
      <a href="/">
        <p className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md">
          Go Back Home
        </p>
      </a>
    </div>
  );
};

export default Custom404;
