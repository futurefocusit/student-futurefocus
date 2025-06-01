import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const withAdminAuth = <P extends object>(WrappedComponent: React.FC<P>) => {
  const AuthHOC: React.FC<P> = (props) => {
    const [loading, setLoading] = useState(true);
    const { fetchLoggedUser, loggedUser } = useAuth();

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
    }, [fetchLoggedUser]);

    useEffect(() => {
      if (!loading && loggedUser && !loggedUser.isAdmin && !loggedUser.isSuperAdmin) {
        toast.error("Unauthorized access. Redirecting...");
        window.location.href = "/staff/task";
      }
      else if(!loading && loggedUser&& loggedUser.isSuperAdmin)
        window.location.href = "/dash";


    }, [loading, loggedUser]);

    if (loading) {
      return (
        <div className="flex justify-center items-start mx-auto">
          <FaSpinner size={24} color="blue" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AuthHOC;
};

export default withAdminAuth;
