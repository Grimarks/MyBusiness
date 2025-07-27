import React from "react";
import { Link } from "react-router-dom";

const SelectAccountPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 flex flex-col justify-center items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">
                    Pilih Jenis Akun
                </h1>
                <p className="text-gray-700 text-center mb-4">
                    Untuk melanjutkan, pilih jenis akun yang sesuai.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/register-pelanggan"
                        className="block bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-lg text-center"
                    >
                        Daftar sebagai Pelanggan
                    </Link>
                    <Link
                        to="/register-pemilik"
                        className="block bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold text-lg text-center"
                    >
                        Daftar sebagai Pemilik Usaha
                    </Link>
                </div>

                <div className="text-center mt-6">
                    Sudah punya akun?{" "}
                    <Link to="/loginpage">
                        <span className="font-bold text-black cursor-pointer hover:underline">
                            Masuk
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SelectAccountPage;