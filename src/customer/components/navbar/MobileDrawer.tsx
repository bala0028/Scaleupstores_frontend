import { NavLink, useNavigate } from "react-router-dom";
import config from "@/shared/config/clientConfig";
import { useProfileModal } from "@/customer/contexts/ProfileModalContext";
import type { CustomerUser } from "@/shared/contexts/AuthContext";

const NAV_ITEMS = ["Home", "Products", "About", "Contact"] as const;
const navPath = (name: string) =>
  name === "Home" ? "/" : name === "Products" ? "/product" : `/${name.toLowerCase()}`;

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerUser | null;
  profileImage: string;
  onLogout: () => void;
  onLoginClick: () => void;
}

export function MobileDrawer({ isOpen, onClose, user, profileImage, onLogout, onLoginClick }: MobileDrawerProps) {
  const navigate = useNavigate();
  const { open } = useProfileModal();
  if (!isOpen) return null;

  const linkCls =
    "block no-underline w-full text-left border-none bg-none py-2.5 font-semibold text-brand border-b border-brand-border-light hover:text-brand-action transition-colors";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[1040]" onClick={onClose} />
      <div className="fixed top-0 left-0 w-[260px] h-screen bg-brand-cream border-r-2 border-brand-border z-[1050] p-5 overflow-y-auto animate-[slideInLeft_0.3s_ease_forwards]">
        <button
          className="absolute top-2.5 right-4 bg-none border-none text-2xl text-brand"
          onClick={onClose}
        >
          ×
        </button>

        <div className="text-center mt-4">
          <img src={config.logo.customer} alt="Logo" className="h-[50px]" />
          <h5 className="font-bold mt-2 text-brand-action">{config.brand.name}</h5>
        </div>

        {user && (
          <div className="text-center mt-4">
            <img
              src={profileImage}
              alt="Profile"
              className="rounded-full border-2 border-brand-border w-[60px] h-[60px] object-cover mx-auto"
            />
            <p className="mt-2 font-semibold">{user.customer_details?.full_name || "User"}</p>
          </div>
        )}

        <ul className="list-none mt-6 p-0">
          {NAV_ITEMS.map((name) => (
            <li key={name}>
              <NavLink to={navPath(name)} className={linkCls} onClick={onClose}>
                {name}
              </NavLink>
            </li>
          ))}
        </ul>
        <hr />

        {user ? (
          <>
            <button
              className={linkCls}
              onClick={() => {
                open();
                onClose();
              }}
            >
              Profile Details
            </button>
            <button
              className={linkCls}
              onClick={() => {
                navigate("/orderhistory");
                onClose();
              }}
            >
              Order History
            </button>
            <button
              className={`${linkCls} !text-destructive`}
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className={linkCls}
              onClick={() => {
                onLoginClick();
                onClose();
              }}
            >
              🔑 Login
            </button>
            <button
              className={linkCls}
              onClick={() => {
                navigate("/register");
                onClose();
              }}
            >
              ✍️ Register
            </button>
          </>
        )}
      </div>
    </>
  );
}
