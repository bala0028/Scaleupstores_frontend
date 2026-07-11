import { lazy, ReactNode } from "react";
import {
  Home as HomeIcon,
  Server,
  Users,
  Grid2x2,
  ShoppingBag,
  Tag,
  ShoppingCart,
  Phone,
  UsersRound,
  Puzzle,
  Box,
  Settings,
  Eye,
  Printer,
} from "lucide-react";

const Home = lazy(() => import("./pages/dashboard/home"));
const SignIn = lazy(() => import("./pages/auth/sign-in"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));
const AdminUser = lazy(() => import("./pages/admin/Admin"));
const Category = lazy(() => import("./pages/category/Category"));
const Product = lazy(() => import("./pages/product/Product"));
const Offer = lazy(() => import("./pages/offers/Offer"));
const Orders = lazy(() => import("./pages/orders/Order"));
const ContactUs = lazy(() => import("./pages/contactus/ContactUs"));
const Customers = lazy(() => import("./pages/customer/Customer"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const GSTSetting = lazy(() => import("./pages/gst/GSTSetting"));
const CourierSetting = lazy(() => import("./pages/courierCharge/CourierChargeSetting"));
const ProductVariant = lazy(() => import("./pages/productVariant/ProductVariant"));
const SettingsPage = lazy(() => import("./pages/Settings/SettingsPage"));
const Review = lazy(() => import("./pages/reviewmodule/Review"));
const PrintAddress = lazy(() => import("./pages/PrintAddress/PrintAddress"));

const icon = {
  className: "w-5 h-5 text-inherit",
};

export interface RoutePage {
  icon?: ReactNode;
  name: string;
  path?: string;
  element?: ReactNode;
  subRoutes?: RoutePage[];
}

export interface RouteGroup {
  title?: string;
  layout: string;
  pages: RoutePage[];
}

export const routes: RouteGroup[] = [
  {
    layout: "dashboard",
    title: "Main Menu",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "home",
        element: <Home />,
      },
      {
        icon: <Users {...icon} />,
        name: "admin",
        path: "AdminUser",
        element: <AdminUser />,
      },
      {
        icon: <Grid2x2 {...icon} />,
        name: "category",
        path: "category",
        element: <Category />,
      },
      {
        icon: <ShoppingBag {...icon} />,
        name: "Product",
        subRoutes: [
          {
            icon: <Box {...icon} />,
            name: "Product",
            path: "product",
            element: <Product />,
          },
          {
            icon: <Puzzle {...icon} />,
            name: "Product Variant",
            path: "product-variant",
            element: <ProductVariant />,
          },
        ],
      },
      {
        icon: <Tag {...icon} />,
        name: "Offers",
        path: "offer",
        element: <Offer />,
      },
      {
        icon: <ShoppingCart {...icon} />,
        name: "Orders",
        path: "orders",
        element: <Orders />,
      },
    ],
  },
  {
    layout: "dashboard",
    title: "Account Management",
    pages: [
      {
        icon: <UsersRound {...icon} />,
        name: "Customer Details",
        path: "customer_details",
        element: <Customers />,
      },
      {
        icon: <Phone {...icon} />,
        name: "Contact Us Details",
        path: "contact_us",
        element: <ContactUs />,
      },
      {
        icon: <Eye {...icon} />,
        name: "Review Details",
        path: "review",
        element: <Review />,
      },
      {
        icon: <Printer {...icon} />,
        name: "Print Address",
        path: "print_address",
        element: <PrintAddress />,
      },
      {
        icon: <Settings {...icon} />,
        name: "Master Data",
        path: "master_data",
        element: <SettingsPage />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <Server {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        name: "verify otp",
        path: "/verify-otp",
        element: <VerifyOtp />,
      },
      {
        name: "forgot password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        name: "reset password",
        path: "/reset-password/:uid/:token",
        element: <ResetPassword />,
      },
    ],
  },
];

export default routes;
