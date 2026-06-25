import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const ROLES = [
    {
        value:    "pemilik",
        title:    "Pemilik Usaha",
        emoji:    "🏪",
        desc:     "Daftarkan bisnis Anda, kelola menu, dan jangkau lebih banyak pelanggan.",
        image:    "/pemilik.png",
        gradient: "from-orange-400 to-orange-600",
    },
    {
        value:    "pelanggan",
        title:    "Pelanggan",
        emoji:    "🛍️",
        desc:     "Temukan makanan favoritmu dan pesan langsung dari kedai pilihan.",
        image:    "/pelanggan.png",
        gradient: "from-yellow-400 to-orange-400",
    },
];

export default function SelectAccountPage() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div
                className="px-6 pt-16 pb-10 text-center"
                style={{ background: "linear-gradient(160deg,#F97316,#EAB308)" }}
            >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 mb-4">
                    <span className="text-2xl">👋</span>
                </div>
                <h1 className="text-white text-2xl font-bold">Siapakah kamu?</h1>
                <p className="text-white/80 text-sm mt-1">Pilih jenis akun yang sesuai</p>
            </div>

            {/* Cards */}
            <div className="flex-1 px-5 -mt-4 space-y-4 pt-4 pb-8">
                {ROLES.map((role) => {
                    const active = selected === role.value;
                    return (
                        <button
                            key={role.value}
                            onClick={() => setSelected(role.value)}
                            className={`w-full text-left rounded-2xl overflow-hidden transition-all duration-200 ${
                                active
                                    ? "ring-2 ring-orange-500 shadow-lg"
                                    : "ring-1 ring-gray-200 shadow-sm"
                            } bg-white`}
                        >
                            <div className="flex items-center gap-4 p-5">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-2xl">{role.emoji}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold text-gray-900">{role.title}</h2>
                                        {active && <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">{role.desc}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* CTA */}
            <div className="px-5 pb-10">
                <button
                    onClick={() => {
                        if (!selected) return alert("Pilih dulu jenis akunmu!");
                        navigate(selected === "pemilik" ? "/register-pemilik" : "/register-pelanggan");
                    }}
                    className="btn btn-primary btn-full btn-lg"
                >
                    Lanjutkan
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                    Sudah punya akun?{" "}
                    <button onClick={() => navigate("/loginpage")} className="text-orange-600 font-semibold hover:underline">
                        Masuk
                    </button>
                </p>
            </div>
        </div>
    );
}
