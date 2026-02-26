import { NavLink } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";

export const Sidebar = () => {
  const { user } = useAuth();

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-primary-soft text-primary"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800">
          TestTrack Pro
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={linkStyle}>
          Dashboard
        </NavLink>

        {user?.role === "TESTER" && (
          <NavLink to="/my-tests" className={linkStyle}>
            My Test Cases
          </NavLink>
        )}

        {user?.role === "DEVELOPER" && (
          <NavLink to="/my-bugs" className={linkStyle}>
            My Bugs
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        Logged in as <span className="font-medium">{user?.role}</span>
      </div>
    </aside>
  );
};
