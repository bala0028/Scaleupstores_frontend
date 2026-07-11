import { lazy, Suspense, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
const ProfileUpdateForm = lazy(() => import("../pages/ProfileUpdateForm"));
import { authService, notificationService } from "@/shared/api/services";
import { useAuth, useCart } from "@/shared/stores";
import { useFeedbackModal } from "@/shared/hooks";
import WhatsAppWidget from "../pages/WhatsAppWidget";
import InstagramWidget from "../pages/Instagramwidget";
import config from "@/shared/config/clientConfig";
import NotificationPanel from "./notificationsPanel";
import { MobileDrawer } from "./navbar/MobileDrawer";
import { ProfileDropdown } from "./navbar/ProfileDropdown";
import { FeedbackModal } from "./navbar/FeedbackModal";
import { LoginModal } from "./navbar/LoginModal";
import type { Notification } from "@/shared/api/services/types";
import type { CustomerUser } from "@/shared/contexts/AuthContext";
import { Search, Heart, Bell, ShoppingCart, LogIn, UserPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = ["Home", "Products", "About", "Contact"] as const;
const navPath = (name: string) =>
  name === "Home" ? "/" : name === "Products" ? "/product" : `/${name.toLowerCase()}`;

const Navbar = () => {
  const { items: state } = useCart();
  const navigate = useNavigate();
  const { user, logout: storeLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const {
    showModal,
    setShowModal,
    feedbackProduct,
    rating,
    setRating,
    hover,
    setHover,
    comment,
    setComment,
    maxLength,
    openFeedbackModal,
    submitFeedback,
  } = useFeedbackModal(200);

  const handleNavLinkClick = () => isMenuOpen && setIsMenuOpen(false);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh");
    try {
      await authService.customer.logout(refresh!);
    } catch {
      /* ignored */
    }
    localStorage.clear();
    storeLogout();
    navigate("/");
    handleNavLinkClick();
  };

  useEffect(() => {
    const customerId = user?.customer_details?.id;
    if (!customerId) return;
    const fetch = async () => {
      try {
        const res = await notificationService.customer.list(customerId);
        if (res.data.success) {
          setNotifications(res.data.data || []);
          setUnreadCount(res.data.total || 0);
        }
      } catch {
        /* ignored */
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [user?.customer_details?.id]);

  const getProfileImage = (u: CustomerUser) => {
    const cd = u.customer_details;
    if (!cd) return "/assets/Profile-image.jpg";
    if (u.login_method === "google" && cd.google_profile_image) return cd.google_profile_image;
    if (cd.profile_image) return cd.profile_image;
    return "/assets/Profile-image.jpg";
  };

  const profileImg = user ? getProfileImage(user) : "";

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 hidden lg:flex bg-brand-cream z-50">
        <div className="container mx-auto px-4 py-2 flex items-center w-full">
          <NavLink
            className="font-bold text-3xl flex items-center gap-2"
            to="/"
            onClick={handleNavLinkClick}
          >
            <img src={config.logo.customer} alt="Logo" className="h-8 w-auto" />
            {/* <span className="text-brand-action font-brand">{config.brand.name}</span> */}
          </NavLink>
          <WhatsAppWidget inNavbar={true} />
          <InstagramWidget inNavbar={true} />

          <div className="flex flex-1 items-center">
            <ul className="flex m-auto my-2 text-center gap-4 list-none p-0">
              {NAV_ITEMS.map((name) => (
                <li key={name}>
                  <NavLink
                    className="font-semibold no-underline px-1"
                    to={navPath(name)}
                    onClick={handleNavLinkClick}
                    style={({ isActive }) => ({
                      color: isActive ? "var(--color-brand-action)" : "#000",
                      borderBottom: isActive ? "2px solid var(--color-brand-action)" : "none",
                    })}
                  >
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center text-center flex-wrap gap-2">
              <Button
                variant="ghost"
                className="mr-2"
                onClick={() => navigate("/search")}
                title="Search"
              >
                <Search size={20} />
                {/* <span>Search</span> */}
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  className="mr-2"
                  onClick={() => navigate("/favoriteProducts")}
                  title="Favorites"
                >
                  <Heart size={16} className="text-red-500" />
                  <span>Wishlist</span>
                </Button>
              )}
              {user && (
                <Button
                  variant="ghost"
                  className="relative"
                  onClick={() => setNotifPanelOpen(true)}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              )}
              <NavLink
                to="/cart"
                className="relative inline-flex items-center justify-center mr-3"
                onClick={handleNavLinkClick}
              >
                <ShoppingCart
                  size={22}
                  className="text-green-800 hover:text-green-900 transition-colors"
                />

                {state.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {state.length}
                  </span>
                )}
              </NavLink>

              {user ? (
                <ProfileDropdown user={user} profileImage={profileImg} onLogout={handleLogout} />
              ) : (
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center gap-1 border border-brand text-brand px-4 py-2 rounded-pill font-semibold no-underline hover:bg-brand hover:text-white transition-colors"
                    onClick={() => {
                      handleNavLinkClick();
                      setIsLoginModalOpen(true);
                    }}
                  >
                    <LogIn size={16} /> Login
                  </button>
                  <NavLink
                    to="/register"
                    className="inline-flex items-center gap-1 bg-brand text-white px-4 py-2 rounded-pill font-semibold no-underline hover:bg-brand-action transition-colors"
                    onClick={handleNavLinkClick}
                  >
                    <UserPlus size={16} /> Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="flex lg:hidden justify-between items-center px-3 py-2 sticky top-0 bg-brand-cream border-b-2 border-brand-border z-50 h-[70px]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(true)}>
            <Menu size={22} className="text-brand" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/search")}>
            <Search size={20} className="text-brand" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <WhatsAppWidget inNavbar={true} />
          <InstagramWidget inNavbar={true} />
          <Button variant="ghost" size="icon" onClick={() => navigate("/favoriteProducts")}>
            <Heart size={20} className="text-destructive" />
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotifPanelOpen(true)}
            >
              <Bell size={20} className="text-brand" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] text-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart size={20} className="text-brand" />
            {state.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] text-center">
                {state.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        profileImage={profileImg}
        onLogout={handleLogout}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      {user && (
        <Suspense fallback={null}>
          <ProfileUpdateForm />
        </Suspense>
      )}
      {user && (
        <NotificationPanel
          isOpen={notifPanelOpen}
          onClose={() => setNotifPanelOpen(false)}
          user={user}
          notifications={notifications}
          setNotifications={setNotifications}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          openFeedbackModal={openFeedbackModal}
        />
      )}
      <FeedbackModal
        show={showModal}
        onClose={() => setShowModal(false)}
        productName={feedbackProduct?.name}
        rating={rating}
        setRating={setRating}
        hover={hover}
        setHover={setHover}
        comment={comment}
        setComment={setComment}
        maxLength={maxLength}
        onSubmit={submitFeedback}
      />
      <LoginModal show={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Navbar;
