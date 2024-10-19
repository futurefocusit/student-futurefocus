import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { fetchUser } from "@/context/adminAuth";

const withAdminAuth = <P extends object>(WrappedComponent: React.FC) => {
  const AuthHOC: React.FC<P> = () => {
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          await fetchUser();
          setLoading(false);
        } catch (error) {
          console.log(error)
          toast.error("logged out ");
          // setError("Unauthorized");
          window.location.href = "/login";
        }
      };

      checkAuth();
    }, []);

    if (loading) {
      return (
        <p className=" items-start mx-auto ">
          <FaSpinner size={1} color="blue" />
        </p>
      );
    }

    return <WrappedComponent />;
  };

  return AuthHOC;
};

export default withAdminAuth;
