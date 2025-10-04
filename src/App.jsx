import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPelangganPage from './pages/RegisterPelangganPage.jsx';
import RegisterPemilikPage from './pages/RegisterPemilikPage.jsx';
import SelectAccountPage from './pages/SelectAccountPage';
import SplashMibi from './pages/SplashMibi';
import SplashMyBusiness from './pages/SplashMyBusiness';
import PilihanPage from './pages/PilihanPage';
import FavoritePage from './pages/FavoritePage';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import ChatPage from './pages/ChatPage';
import PendapatanPage from "./pages/PendapatanPage.jsx";
import ThankYouPage from "./pages/ThankYouPage.jsx";
import AddFoodPage from "./pages/AddFoodPage.jsx";
import EditStorePage from "./pages/EditStorePage.jsx";
import EditFoodPage from "./pages/EditFoodPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import MyOrdersPage from "./pages/MyOrdersPage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/loginpage" element={<LoginPage />} />
                <Route path="/register-pelanggan" element={<RegisterPelangganPage />} />
                <Route path="/register-pemilik" element={<RegisterPemilikPage />} />
                <Route path="/select-account" element={<SelectAccountPage />} />
                <Route path="/splash-mibi" element={<SplashMibi />} />
                <Route path="/splash-mybusiness" element={<SplashMyBusiness />} />
                <Route path="/pilihan" element={<PilihanPage />} />
                <Route path="/favorite" element={<FavoritePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/chatPage" element={<ChatPage />} />
                <Route path="/" element={<SplashMibi />} />
                <Route path="/pendapatan" element={<PendapatanPage></PendapatanPage>} />
                <Route path="/thankyou" element={<ThankYouPage />} />
                <Route path="/add-food" element={<AddFoodPage/>} />
                <Route path="/edit-food" element={<EditFoodPage/>} />
                <Route path="/edit-store" element={<EditStorePage/>} />
                <Route path="/order" element={<OrderDetailPage/>} />
                <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
                <Route path="/myOrder" element={<MyOrdersPage/>} />
                <Route path="/edit-profile" element={<EditProfilePage/>} />
            </Routes>
        </Router>

    );
}

export default App;