import React from "react";
import { X } from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import { Switch } from "@/admin/components/ui/Switch";
import {
  useAdminUI,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/admin/context";

export function Configurator() {
  const [controller, dispatch] = useAdminUI();
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar } = controller;

  const sidenavColors: Record<string, string> = {
    white: "from-gray-100 to-gray-100",
    dark: "from-black to-black",
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-400 to-pink-600",
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-2.5 shadow-sm transition-transform duration-300 ${openConfigurator ? "translate-x-0" : "translate-x-96"}`}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <div>
          <h5 className="text-xl font-semibold text-foreground">Dashboard Configurator</h5>
          <p className="font-normal text-muted-foreground">See our dashboard options.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpenConfigurator(dispatch, false)}>
          <X strokeWidth={2.5} className="h-5 w-5" />
        </Button>
      </div>
      <div className="py-4 px-6">
        <div className="mb-12">
          <h6 className="text-base font-semibold text-foreground">Sidenav Colors</h6>
          <div className="mt-3 flex items-center gap-2">
            {Object.keys(sidenavColors).map((color) => (
              <span
                key={color}
                className={`h-6 w-6 cursor-pointer rounded-full border bg-gradient-to-br transition-transform hover:scale-105 ${sidenavColors[color]} ${sidenavColor === color ? "border-black" : "border-transparent"}`}
                onClick={() => setSidenavColor(dispatch, color)}
              />
            ))}
          </div>
        </div>
        <div className="mb-12">
          <h6 className="text-base font-semibold text-foreground">Sidenav Types</h6>
          <p className="text-sm text-muted-foreground">Choose between 3 different sidenav types.</p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={sidenavType === "dark" ? "default" : "outline"}
              onClick={() => setSidenavType(dispatch, "dark")}
            >
              Dark
            </Button>
            <Button
              variant={sidenavType === "transparent" ? "default" : "outline"}
              onClick={() => setSidenavType(dispatch, "transparent")}
            >
              Transparent
            </Button>
            <Button
              variant={sidenavType === "white" ? "default" : "outline"}
              onClick={() => setSidenavType(dispatch, "white")}
            >
              White
            </Button>
          </div>
        </div>
        <div className="mb-12">
          <hr />
          <div className="flex items-center justify-between py-5">
            <h6 className="text-base font-semibold text-foreground">Navbar Fixed</h6>
            <Switch
              id="navbar-fixed"
              checked={fixedNavbar}
              onCheckedChange={() => setFixedNavbar(dispatch, !fixedNavbar)}
            />
          </div>
          <hr />
        </div>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";
export default Configurator;
