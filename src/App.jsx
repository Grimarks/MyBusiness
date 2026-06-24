import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPelangganPage from "./pages/RegisterPelangganPage";
import RegisterPemilikPage from "./pages/RegisterPemilikPage";
import SelectAccountPage from "./pages/SelectAccountPage";
import SplashMibi from "./pages/SplashMibi";
import SplashMyBusiness from "./pages/SplashMyBusiness";
import PilihanPage from "./pages/PilihanPage";
import FavoritePage from "./pages/FavoritePage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import ChatPage from "./pages/ChatPage";
import PendapatanPage from "./pages/PendapatanPage";
import ThankYouPage from "./pages/ThankYouPage";
import AddFoodPage from "./pages/AddFoodPage";
import EditFoodPage from "./pages/EditFoodPage";
import EditStorePage from "./pages/EditStorePage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import EditProfilePage from "./pages/EditProfilePage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SplashMibi />} />
                <Route path="/splash-mibi" element={<SplashMibi />} />
                <Route path="/splash-mybusiness" element={<SplashMyBusiness />} />
                <Route path="/select-account" element={<SelectAccountPage />} />
                <Route path="/loginpage" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register-pelanggan" element={<RegisterPelangganPage />} />
                <Route path="/register-pemilik" element={<RegisterPemilikPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/pilihan" element={<PilihanPage />} />
                <Route path="/favorite" element={<FavoritePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/chatPage" element={<ChatPage />} />
                <Route path="/pendapatan" element={<PendapatanPage />} />
                <Route path="/thankyou" element={<ThankYouPage />} />
                <Route path="/add-food" element={<AddFoodPage />} />
                <Route path="/edit-food" element={<EditFoodPage />} />
                <Route path="/edit-store" element={<EditStorePage />} />
                <Route path="/order" element={<OrderDetailPage />} />
                <Route path="/myOrder" element={<MyOrdersPage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin-page" element={<AdminPage />} />
            </Routes>
        </Router>
    );
}

export default App;
