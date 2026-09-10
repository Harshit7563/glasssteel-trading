import { Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Payment from "./pages/Payment.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Policy from "./pages/Policy.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function Router() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="pay/:productId" element={<Payment />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policies/:slug" element={<Policy />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </>
  );
}
