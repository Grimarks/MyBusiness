import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
    {
        value: "pemilik",
        title: "Pemilik Usaha",
        desc: "Daftarkan bisnis Anda sekarang dan jangkau lebih banyak pelanggan dengan",
        image: "/pemilik.png",
    },
    {
        value: "pelanggan",
        title: "Pelanggan",
        desc: "Daftarkan diri Anda dan nikmati produk dengan kualitas yang baik melalui",
        image: "/pelanggan.png",
    },
];

export default function SelectAccountPage() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleNext = () => {
        if (!selectedRole) {
            alert("Pilih dulu jenis akunmu!");
            return;
        }
        navigate(selectedRole === "pemilik" ? "/register-pemilik" : "/register-pelanggan");
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <div className="text-center mt-16">
                <h1 className="text-3xl font-bold text-orange-600">Siapakah kamu?</h1>
            </div>

            <div className="flex flex-col items-center space-y-6 mt-10 px-6">
                {ROLES.map((role) => (
                    <div
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className={`w-full max-w-md rounded-2xl p-5 flex justify-between items-center cursor-pointer transition ${
                            selectedRole === role.value
                                ? "bg-gradient-to-r from-[#FED014] to-[#FFFFFF] ring-2 ring-orange-500"
                                : "bg-yellow-100"
                        }`}
                    >
                        <div>
                            <h2 className="text-lg font-bold text-gray-700">{role.title}</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {role.desc}{" "}
                                <span className="font-bold">MyBusiness</span>.
                            </p>
                        </div>
                        <img
                            src={role.image}
                            alt={role.title}
                            className="w-24 h-24 object-contain"
                        />
                    </div>
                ))}
            </div>

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
}
