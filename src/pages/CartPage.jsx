import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav';
import {collection, getDocs, doc, getDoc, db} from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import Loader from '../components/Loader';

const CartPage = () => {
    const [cartItemsDetails, setCartItemsDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchCartDetails = async () => {
            if (userId) {
                setLoading(true);
                setError(null);
                try {
                    const cartCollection = collection(db, "carts");
                    const cartSnapshot = await getDocs(cartCollection);
                    let userCart = null;
                    cartSnapshot.forEach(doc => {
                        if (doc.data()?.userId === userId) {
                            userCart = {
                                id: doc.id,
                                ...doc.data()
                            };
                        }
                    });

                    if (userCart && userCart.items) {
                        const itemDetails = await Promise.all(
                            userCart.items.map(async (item) => {
                                const foodDoc = await getDoc(doc(db, 'foods', item.foodId));
                                if (foodDoc.exists()) {
                                    return {
                                        ...foodDoc.data(),
                                        id: foodDoc.id,
                                        quantity: item.quantity
                                    };
                                }
                                return null;
                            }).filter(item => item !== null)
                        );
                        setCartItemsDetails(itemDetails);
                    } else {
                        setCartItemsDetails([]); // User has no items in cart
                    }
                } catch (e) {
                    console.error("Error fetching cart:", e);
                    setError("Gagal memuat keranjang.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setCartItemsDetails([]);
            }
        };

        fetchCartDetails();
    }, [userId]);

    const increaseQuantity = async (itemId) => {
        // Implement logic to update quantity in Firestore
        const updatedCart = cartItemsDetails.map(item =>
            item.id === itemId ? {
                ...item,
                quantity: item.quantity + 1
            } : item
        );
        setCartItemsDetails(updatedCart);
        // TODO: Update Firestore cart document
    };

    const decreaseQuantity = async (itemId) => {
        const updatedCart = cartItemsDetails.map(item =>
            item.id === itemId && item.quantity > 1 ? {
                ...item,
                quantity: item.quantity - 1
            } : item
        );
        setCartItemsDetails(updatedCart);
        // TODO: Update Firestore cart document
    };

    const subTotal = cartItemsDetails.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingCost = 2000; // Fixed shipping cost
    const adminFee = 1000; // Fixed admin fee
    const total = subTotal + shippingCost + adminFee;

    if (loading) {
        return <Loader message="Memuat keranjang..." />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNav title="Pesanan kamu!" />

            <main className="container mx-auto p-4 max-w-2xl">
                {/* Alamat Pengantaran */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-2">Alamat pengantaran</h2>
                    <div className="bg-gray-100 p-2 rounded-md mb-2">
                        Jalan Srijaya Negara No.1
                    </div>
                    <button className="text-sm text-gray-600">Catatan</button>
                </div>

                {/* Daftar Item */}
                {cartItemsDetails.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md p-4 mb-4 flex items-center">
                        <img src={item.image} alt={item.name} className="w-24 h-24 rounded-md mr-4 object-cover" />
                        <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-gray-700">Rp {item.price?.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <button
                                    onClick={() => decreaseQuantity(item.id)}
                                    className="bg-orange-200 text-orange-700 rounded-full w-8 h-8 flex items-center justify-center"
                                >
                                    -
                                </button>
                                <span className="mx-2">{item.quantity}</span>
                                <button
                                    onClick={() => increaseQuantity(item.id)}
                                    className="bg-orange-200 text-orange-700 rounded-full w-8 h-8 flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {cartItemsDetails.length === 0 && !loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Keranjang kamu kosong.</p>
                        {/* Tambahkan link ke halaman utama jika mau */}
                    </div>
                ) : (
                    <>
                        {/* Detail Pembayaran */}
                        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                            <h2 className="text-lg font-semibold mb-2">Detail pembayaran</h2>
                            <div className="flex justify-between mb-2">
                                <span>Sub Total</span>
                                <span>Rp {subTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Biaya Pengantaran</span>
                                <span>Rp {shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Biaya Admin</span>
                                <span>Rp {adminFee.toLocaleString()}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total Pembayaran</span>
                                <span>Rp {total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Tombol Pesan Sekarang */}
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl w-full shadow-md">
                            Pesan Sekarang
                        </button>
                    </>
                )}
            </main>
        </div>
    );
};

export default CartPage;