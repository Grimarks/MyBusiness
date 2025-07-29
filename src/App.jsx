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
            </Routes>
        </Router>

    );
}

export default App;