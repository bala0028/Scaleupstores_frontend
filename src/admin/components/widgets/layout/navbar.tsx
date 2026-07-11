import React, { ReactNode, ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/admin/components/ui/Button";
import { Menu, X } from "lucide-react";

interface NavbarRoute {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}
interface NavbarComponentProps {
  brandName?: string;
  routes: NavbarRoute[];
  action?: ReactNode;
}

export function Navbar({ brandName, routes, action }: NavbarComponentProps) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener("resize", () => window.innerWidth >= 960 && setOpenNav(false));
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon }) => (
        <li key={name} className="text-sm capitalize text-foreground">
          <Link to={path} className="flex items-center gap-1 p-1 font-normal">
            {icon && React.createElement(icon, { className: "w-[18px] h-[18px] opacity-50 mr-1" })}
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="block w-full rounded-xl bg-white p-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between text-foreground">
        <Link to="/">
          <span className="mr-4 ml-2 cursor-pointer py-1.5 text-sm font-bold">{brandName}</span>
        </Link>
        <div className="hidden lg:block">{navList}</div>
        {action && <div className="hidden lg:inline-block">{action}</div>}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <X strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Menu strokeWidth={2} className="h-6 w-6" />
          )}
        </Button>
      </div>
      {openNav && (
        <div className="container mx-auto">
          {navList}
          {action && <div className="w-full block lg:hidden">{action}</div>}
        </div>
      )}
    </nav>
  );
}

Navbar.displayName = "/src/widgets/layout/navbar.jsx";
export default Navbar;
