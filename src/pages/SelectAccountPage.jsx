import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SelectAccountPage = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleNext = () => {
        if (!selectedRole) {
            alert("Pilih dulu jenis akunmu!");
            return;
        }
        if (selectedRole === "pemilik") {
            navigate("/register-pemilik");
        } else {
            navigate("/register-pelanggan");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            {/* Judul */}
            <div className="text-center mt-16">
                <h1 className="text-3xl font-bold text-orange-600">Siapakah kamu?</h1>
            </div>

            {/* Pilihan Role */}
            <div className="flex flex-col items-center space-y-6 mt-10 px-6">
                {/* Pemilik Usaha */}
                <div
                    onClick={() => setSelectedRole("pemilik")}
                    className={`w-full max-w-md rounded-2xl p-5 flex justify-between items-center cursor-pointer transition 
            ${
                        selectedRole === "pemilik"
                            ? "bg-gradient-to-r from-[#FED014] to-[#FFFFFF] ring-2 ring-orange-500"
                            : "bg-yellow-100"
                    }`}
                >
                    <div>
                        <h2 className="text-lg font-bold text-gray-700">Pemilik Usaha</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Daftarkan bisnis Anda sekarang dan jangkau lebih banyak pelanggan
                            dengan <span className="font-bold">MyBusiness</span>.
                        </p>
                    </div>
                    <img
                        src="/pemilik.png"
                        alt="Pemilik Usaha"
                        className="w-24 h-24 object-contain"
                    />
                </div>

                {/* Pelanggan */}
                <div
                    onClick={() => setSelectedRole("pelanggan")}
                    className={`w-full max-w-md rounded-2xl p-5 flex justify-between items-center cursor-pointer transition 
            ${
                        selectedRole === "pelanggan"
                            ? "bg-gradient-to-r from-[#FED014] to-[#FFFFFF] ring-2 ring-orange-500"
                            : "bg-yellow-100"
                    }`}
                >
                    <div>
                        <h2 className="text-lg font-bold text-gray-700">Pelanggan</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Daftarkan diri Anda dan nikmati produk dengan kualitas yang baik
                            melalui <span className="font-bold">MyBusiness</span>.
                        </p>
                    </div>
                    <img
                        src="/pelanggan.png"
                        alt="Pelanggan"
                        className="w-24 h-24 object-contain"
                    />
                </div>
            </div>

            {/* Tombol Lanjut */}
            <div className="p-6">
                <button
                    onClick={handleNext}
                    className="w-full bg-yellow-200 hover:bg-yellow-300 text-gray-700 font-bold py-3 rounded-full text-lg transition"
                >
                    Lanjut
                </button>
            </div>
        </div>
    );
};

export default SelectAccountPage;
