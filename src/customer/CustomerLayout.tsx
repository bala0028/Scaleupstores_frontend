import { Outlet } from "react-router-dom";
import { Navbar, Footer, OfferModal } from "./components";

const CustomerLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <OfferModal />
    </>
  );
};

export default CustomerLayout;
