import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const withMemberAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthHOC: React.FC<P> = (props) => {
    const [loading, setLoading] = useState(true);
    const { fetchLoggedUser } = useAuth();

    useEffect(() => {
      const checkAuth = async () => {
        setLoading(true);
        try {
          await fetchLoggedUser();
        } catch (error) {
          toast.error("You have been logged out.");
          window.location.href = "/login";
          return;
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, []); // Remove fetchLoggedUser from dependencies to prevent infinite loop

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin" size={24} color="blue" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  // Preserve the display name for debugging purposes
  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  AuthHOC.displayName = `withMemberAuth(${wrappedComponentName})`;

  return AuthHOC;
};

export default withMemberAuth;
