import { useNavigate } from "react-router-dom";
import { useProfileModal } from "@/customer/contexts/ProfileModalContext";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CustomerUser } from "@/shared/contexts/AuthContext";

interface ProfileDropdownProps {
  user: CustomerUser;
  profileImage: string;
  onLogout: () => void;
}

export function ProfileDropdown({ user, profileImage, onLogout }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { open: openModal } = useProfileModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 bg-transparent border-none font-semibold text-base whitespace-nowrap">
          <img
            src={profileImage}
            alt={user.customer_details?.full_name || "User"}
            referrerPolicy="no-referrer"
            className="rounded-full border-2 border-brand-border-light w-10 h-10 object-cover"
          />
          <span
            className="max-w-[140px] inline-block whitespace-nowrap overflow-hidden text-ellipsis align-middle"
            title={user.customer_details?.full_name || "User"}
          >
            {user.customer_details?.full_name || "User"}
          </span>
          <ChevronDown size={13} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[180px] bg-brand-cream border-[1.5px] border-brand-border-light rounded-xl p-2.5 shadow-card-hover"
      >
        <DropdownMenuItem
          className="text-brand-action font-semibold rounded-lg px-6 py-2.5 cursor-pointer focus:bg-brand-action focus:text-white"
          onClick={openModal}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-brand-action font-semibold rounded-lg px-6 py-2.5 cursor-pointer focus:bg-brand-action focus:text-white"
          onClick={() => navigate("/orderhistory")}
        >
          Order History
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive font-semibold rounded-lg px-6 py-2.5 cursor-pointer focus:bg-destructive focus:text-white"
          onClick={onLogout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
