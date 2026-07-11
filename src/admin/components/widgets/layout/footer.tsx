import { Heart } from "lucide-react";
import config from "@/shared/config/clientConfig";

interface FooterRoute {
  name: string;
  path: string;
}
interface FooterProps {
  brandName?: string;
  brandLink?: string;
  routes?: FooterRoute[];
}

export function Footer({
  brandName = config.admin.brandName,
  brandLink = "/",
  routes = [],
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <p className="text-sm font-normal text-inherit">
          &copy; {year}, made with{" "}
          <Heart className="-mt-0.5 inline-block h-3.5 w-3.5 text-red-600" /> by{" "}
          <a
            href={brandLink}
            target="_blank"
            className="transition-colors hover:text-admin-accent font-bold"
          >
            {brandName}
          </a>{" "}
          for a better web.
        </p>
        <ul className="flex items-center gap-4">
          {routes.map(({ name, path }) => (
            <li key={name}>
              <a
                href={path}
                target="_blank"
                className="py-0.5 px-1 text-sm font-normal text-inherit transition-colors hover:text-admin-accent"
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

Footer.displayName = "/src/widgets/layout/footer.jsx";
export default Footer;
