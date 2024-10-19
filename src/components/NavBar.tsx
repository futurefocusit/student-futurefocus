import Link from "next/link";
export const Navbar: React.FC<{
  //@ts-expect-error errro
  loggedMember;
  logout: () => void;
  active: string;
}> = ({ loggedMember, logout, active }) => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className=" flex gap-5">
          <Link
            href="/staff"
            className={`${
              active === "attendance" ? "text-blue-600" : "text-white"
            } text-lg font-bold hover:text-gray-500`}
          >
            My Attendances
          </Link>
          <Link
            href="/staff/task"
            className={`${
              active === "task" ? "text-blue-600" : "text-white"
            } text-lg font-bold hover:text-gray-500`}
          >
            My Tasks
          </Link>
        </div>
        <div className="flex items-center">
          {loggedMember ? (
            <>
              <span className="mr-4">
                {loggedMember?.name} | {loggedMember?.email}
              </span>
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-blue-500 px-3 py-1 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
