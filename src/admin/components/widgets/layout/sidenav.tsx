import config from "@/shared/config/clientConfig";
import { Link, NavLink } from "react-router-dom";
import { X, ChevronDown, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import { useState } from "react";
import { useAdminUI, setOpenSidenav, setSidenavCollapsed } from "@/admin/context";
import { useAuth } from "@/shared/contexts/AuthContext";
import { RouteGroup } from "@/admin/routes";

interface SidenavProps {
  brandImg?: string;
  brandName?: string;
  routes: RouteGroup[];
}

export function Sidenav({ routes }: SidenavProps) {
  const [controller, dispatch] = useAdminUI();
  const { openSidenav, sidenavCollapsed } = controller;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { admin } = useAuth();

  const adminName = (admin as Record<string, string>)?.fullName || (admin as Record<string, string>)?.full_name || "Admin User";
  const adminId = (admin as Record<string, string | number>)?.id;

  const handleCloseOnMobile = () => {
    if (window.innerWidth < 1280) setOpenSidenav(dispatch, false);
  };

  const toggleDropdown = (name: string) => {
    // Icon-only mode has nowhere to render a dropdown — expand the rail first.
    if (sidenavCollapsed) {
      setSidenavCollapsed(dispatch, false);
      setOpenDropdown(name);
      return;
    }
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const NavIcon = ({ icon, active }: { icon: React.ReactNode; active?: boolean }) => (
    <span
      className={`flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${
        active ? "bg-admin-sidebar text-admin-sidebar-foreground" : "bg-admin-sidebar-icon-bg text-admin-sidebar-muted"
      }`}
    >
      {icon}
    </span>
  );

  return (
    <aside
      className={`bg-admin-sidebar ${openSidenav ? "translate-x-0" : "-translate-x-80"} fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] ${
        sidenavCollapsed ? "w-[96px]" : "w-[280px]"
      } rounded-[24px] transition-[transform,width] duration-300 xl:translate-x-0 shadow-[0_8px_30px_rgb(0,0,0,0.18)] overflow-hidden flex flex-col`}
    >
      <div className={`flex items-center pt-7 pb-6 ${sidenavCollapsed ? "flex-col gap-3 px-3" : "justify-between px-6"}`}>
        <Link to="/" className={`flex items-center gap-2.5 min-w-0 ${sidenavCollapsed ? "justify-center" : ""}`}>
          <img
            src="/Logo.png"
            alt="Logo"
            className="h-8 w-8 rounded-lg object-contain flex-shrink-0"
          />
          {!sidenavCollapsed && (
            <h6 className="font-extrabold tracking-wide text-[13px] uppercase text-admin-sidebar-foreground leading-tight truncate">
              {config.admin.brandName || "OFSPACE.CO"}
            </h6>
          )}
        </Link>

        <button
          type="button"
          aria-label={sidenavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden xl:flex items-center justify-center w-8 h-8 rounded-full text-admin-sidebar-muted hover:bg-white/10 hover:text-admin-sidebar-foreground transition-colors flex-shrink-0"
          onClick={() => setSidenavCollapsed(dispatch, !sidenavCollapsed)}
        >
          <Menu strokeWidth={2.25} className="h-5 w-5" />
        </button>

      </div>

      <div className={`flex-1 overflow-y-auto scrollbar-none pb-4 ${sidenavCollapsed ? "px-3" : "px-4"}`}>
        {routes
          .filter((rg) => rg.layout !== "auth")
          .map(({ layout, title, pages }, key) => (
            <div key={key} className="mb-5">
              {title && !sidenavCollapsed && (
                <p className="px-4 text-[10px] font-bold tracking-wider uppercase text-admin-sidebar-muted/70 mb-2.5">
                  {title}
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {pages.map(({ icon, name, path, subRoutes }) => (
                  <li key={name}>
                    {subRoutes ? (
                      <>
                        <button
                          title={sidenavCollapsed ? name : undefined}
                          className={`flex w-full items-center rounded-full capitalize text-admin-sidebar-muted hover:bg-white/5 transition-colors ${
                            sidenavCollapsed ? "justify-center py-1.5" : "justify-between gap-3 px-3 py-1.5"
                          }`}
                          onClick={() => toggleDropdown(name)}
                        >
                          <div className={`flex items-center ${sidenavCollapsed ? "" : "gap-3"}`}>
                            <NavIcon icon={icon} />
                            {!sidenavCollapsed && <span className="font-medium text-[13px]">{name}</span>}
                          </div>
                          {!sidenavCollapsed && (
                            openDropdown === name ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )
                          )}
                        </button>
                        {!sidenavCollapsed && openDropdown === name && (
                          <ul className="ml-[1.15rem] mt-1 flex flex-col gap-1 border-l-2 border-white/10 pl-3">
                            {subRoutes.map((sub) => (
                              <li key={sub.name}>
                                <NavLink to={`/${layout}/${sub.path}`}>
                                  {({ isActive }) => (
                                    <button
                                      className={`flex w-full items-center gap-3 rounded-full px-4 py-2 text-[13px] capitalize transition-colors ${
                                        isActive
                                          ? "bg-admin-sidebar-active-bg text-admin-sidebar-active-fg font-bold"
                                          : "text-admin-sidebar-muted hover:bg-white/5"
                                      }`}
                                      onClick={handleCloseOnMobile}
                                    >
                                      {sub.icon && <span className="w-4 h-4">{sub.icon}</span>}
                                      <span>{sub.name}</span>
                                    </button>
                                  )}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <NavLink to={`/${layout}/${path}`} title={sidenavCollapsed ? name : undefined}>
                        {({ isActive }) => (
                          <button
                            className={`flex w-full items-center rounded-full capitalize transition-all duration-200 ${
                              sidenavCollapsed ? "justify-center py-1.5" : "gap-3 pr-4 py-1.5 pl-1.5"
                            } ${
                              isActive
                                ? "bg-admin-sidebar-active-bg text-admin-sidebar-active-fg font-bold shadow-sm"
                                : "text-admin-sidebar-muted hover:bg-white/5 font-medium"
                            }`}
                            onClick={handleCloseOnMobile}
                          >
                            <NavIcon icon={icon} active={isActive} />
                            {!sidenavCollapsed && <span className="text-[13px]">{name}</span>}
                          </button>
                        )}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {/* User account card */}
      <div className={`pb-4 pt-2 flex-shrink-0 ${sidenavCollapsed ? "px-3" : "px-4"}`}>
        {!sidenavCollapsed && (
          <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-admin-sidebar-muted/70 mb-2.5">
            User Account
          </p>
        )}
        <div
          className={`flex items-center rounded-2xl bg-admin-sidebar-card ${
            sidenavCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-3"
          }`}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="h-9 w-9 rounded-full flex-shrink-0 border border-white/10"
          />
          {!sidenavCollapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-admin-sidebar-foreground truncate">{adminName}</p>
              {adminId !== undefined && (
                <p className="text-[11px] text-admin-sidebar-muted truncate">#admin-{adminId}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidenav;
