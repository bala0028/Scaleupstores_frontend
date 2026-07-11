import { useState } from "react";
import { Button } from "@/admin/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, UserCircle, LogOut, Bell, Mail, ChevronDown } from "lucide-react";
import { useAdminUI, setOpenSidenav } from "@/admin/context";
import { authService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import ProfileModal from "./ProfileModal";

export function DashboardNavbar() {
  const [controller, dispatch] = useAdminUI();
  const { openSidenav } = controller;
  const [profileOpen, setProfileOpen] = useState(false);

  const { logout, admin } = useAuth();
  const adminName = (admin as Record<string, string>)?.full_name || "Admin User";

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) await authService.admin.logout(refreshToken);
      logout();
      window.location.href = "/auth/sign-in";
    } catch (err) {
      console.error("Logout failed:", err);
      logout();
      window.location.href = "/auth/sign-in";
    }
  };

  return (
    <>
      <nav className="sticky top-4 z-40 py-1 px-1 w-full flex items-center justify-between">
        <div className="flex items-center">
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button className="p-2.5 rounded-full bg-white shadow-sm hover:shadow-md text-gray-500 transition-shadow">
            <Mail className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-full bg-white shadow-sm hover:shadow-md text-gray-500 transition-shadow">
            <Bell className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow outline-none">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Profile"
                  className="h-8 w-8 rounded-full border shadow-sm"
                />
                <span className="text-sm font-semibold text-gray-800 hidden sm:block">
                  {adminName}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg p-1 border-gray-100 rounded-xl">
              <DropdownMenuItem
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                <UserCircle className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50 mt-1"
              >
                <LogOut className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <ProfileModal open={profileOpen} handleClose={() => setProfileOpen(false)} />
    </>
  );
}

export default DashboardNavbar;
