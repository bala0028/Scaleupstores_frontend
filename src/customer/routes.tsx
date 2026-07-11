import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/shared/components/customer-ui";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { CartProvider } from "@/shared/contexts/CartContext";
import { ProfileModalProvider } from "./contexts/ProfileModalContext";
import CustomerLayout from "./CustomerLayout";

// Lazy load customer pages
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Favorites = lazy(() => import("./pages/Favorites"));
const ProfileUpdateForm = lazy(() => import("./pages/ProfileUpdateForm"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Verification = lazy(() => import("./pages/Verification"));
const PhoneLogin = lazy(() => import("./pages/PhoneLogin"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const PasswordResetConfirm = lazy(() => import("./pages/PasswordResetConfirm"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

const Loading = () => <LoadingSpinner fullPage />;

export default function CustomerRoutes() {
  return (
    <CartProvider>
      <ProfileModalProvider>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="product" element={<Products />} />
              <Route path="product-detail/:id" element={<Product />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orderhistory" element={<OrderHistory />} />
              <Route path="order-tracking/:orderNumber" element={<OrderTracking />} />
              <Route path="order-confirmation" element={<OrderConfirmation />} />
              <Route path="favoriteProducts" element={<Favorites />} />
              <Route path="profile" element={<ProfileUpdateForm />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="policies" element={<PoliciesPage />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="verification" element={<Verification />} />
              <Route path="phone-login" element={<PhoneLogin />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/phone-login" element={<PhoneLogin />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
          </Routes>
          </ErrorBoundary>
        </Suspense>
      </ProfileModalProvider>
    </CartProvider>
  );
}
