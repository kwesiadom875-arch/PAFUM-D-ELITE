import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

const Cart = () => {
    const { cart, addToCart, decreaseCartItem, removeFromCart, getCartTotal } = useContext(CartContext);
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');

    const subtotal = getCartTotal();
    const total = subtotal; // + shipping/tax if needed, but design says calculated at checkout

    const recommendations = [
        {
            id: 'sultani',
            name: 'Sultani',
            brand: 'Arabian Oud',
            price: 4800,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd51KxBHL5yPVhnw8AN5ZXoAhtnjWuuVqxbJp2ZD02Qov6M-8N2QPhGsh_kNFdMTDIQ8V1QFZfhQHhRaAOASptvI1uwOo4iD1vGz-4nqU8Vq8K-P7vuTejrEv660P9QBXhigui_-ifj392Ah86-kKik_2WeHriBfyW0CNY0CESYtxAzOxpF7mltazlS9hQYJ7oVyQXhOEwJLm4k2-m2KWAx0k8ZuNJxmUHjYp12DuwYWPXuAlhO6jfo7xPOh6WrMmRDfKyujIb97I'
        },
        {
            id: 'pink-me-up',
            name: 'Pink Me Up',
            brand: 'Atelier des Ors',
            price: 3900,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiPtfCRFcnveIFqrRlgg_EuGn-tN4ui1nUypxbGfgmPTJDIVH5VcUBDxNNWQA2rjlzzl58X93zDWrOZjIMlj25sqFknK_5PSn_TQCfd-DaIrw5avPmKT7IqcCwpCVNSkkLifnJX2TauOePN9ESCZFYDSkbkVIGluiViC8QOOn1IR1STkMBK6qwf2l3AmuV_P7pRtI-1CzmHsDPRa08XeLW8c5lRFtZvBnlg_GE0MAIS8-CaxwcHCOH9fOTzKq2rK_MwW8p3T_GZaI'
        },
        {
            id: 'fan-your-flames',
            name: 'Fan Your Flames',
            brand: 'Nishane',
            price: 500,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1WBvUC2zniqIVKOrol1SJ_eT0qIAJ6vemaAzSNGyZst5GvNM5l3-jA0UQz2T0HOY_fzn9UTTVqeCTkQeW1o2iIDFhtlIYtpt62yFtnTv70vf844uODDiLP_yJD7QXVXWlvIDke4uNJsSr1zrylsXPGPUjEWB2S2mOrKsQdNcbPh2Pl9pzsluDdnn-M3Jd6QBHdn95tPsrWs608lSA2aRhXj8fwWnS6ho5v-9uIw8RtbjohprQYUTGDeM1HUQZMpQkJEjzU3BAp8s'
        },
        {
            id: 'ani',
            name: 'Ani',
            brand: 'Nishane',
            price: 550,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1WBvUC2zniqIVKOrol1SJ_eT0qIAJ6vemaAzSNGyZst5GvNM5l3-jA0UQz2T0HOY_fzn9UTTVqeCTkQeW1o2iIDFhtlIYtpt62yFtnTv70vf844uODDiLP_yJD7QXVXWlvIDke4uNJsSr1zrylsXPGPUjEWB2S2mOrKsQdNcbPh2Pl9pzsluDdnn-M3Jd6QBHdn95tPsrWs608lSA2aRhXj8fwWnS6ho5v-9uIw8RtbjohprQYUTGDeM1HUQZMpQkJEjzU3BAp8s' // Using similar image as placeholder if needed, design implies specific image but I'll reuse one if needed or assume user provided link works
        }
    ];

    if (cart.length === 0) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center text-text-light dark:text-text-dark font-body transition-colors duration-300">
                <nav className="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                                <Link to="/" className="font-display text-2xl font-bold tracking-wider text-black dark:text-white">
                                    Parfum <span className="text-primary italic">D'Elite</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="flex flex-col items-center justify-center flex-grow">
                    <h2 className="font-display text-2xl mb-4">Your Cart is Empty</h2>
                    <button onClick={() => navigate('/shop')} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded uppercase tracking-widest text-sm font-semibold transition-colors">
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body transition-colors duration-300 min-h-screen flex flex-col">
            <nav className="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="hidden md:flex space-x-8 text-xs tracking-widest uppercase font-semibold text-gray-500 dark:text-gray-400">
                            <Link to="/shop" className="hover:text-primary transition-colors">Collection</Link>
                            <Link to="/request" className="hover:text-primary transition-colors">Request</Link>
                            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
                            <Link to="/olfactory-map" className="hover:text-primary transition-colors">Scent Map</Link>
                        </div>
                        <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                            <Link to="/" className="font-display text-2xl font-bold tracking-wider text-black dark:text-white">
                                Parfum <span className="text-primary italic">D'Elite</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-6">
                            <button className="text-xs uppercase font-semibold text-primary hover:text-primary-dark tracking-widest hidden sm:block">Ask Josie</button>
                            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </Link>
                            <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors relative">
                                <span className="material-symbols-outlined text-xl">shopping_bag</span>
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-display text-3xl md:text-4xl text-gray-900 dark:text-white">Shopping Cart</h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{cart.length} Items</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                            {cart.map((item) => (
                                <div key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden p-2 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                        <img src={item.image} alt={item.name} className="max-h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-grow w-full text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-display text-xl text-gray-900 dark:text-white font-medium mb-1">{item.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{item.selectedSize || 'Standard'}</p>
                                                <p className="text-green-600 text-xs font-semibold">In Stock</p>
                                            </div>
                                            <div className="text-right mt-2 sm:mt-0">
                                                <p className="text-lg font-display text-primary font-semibold">GH₵{item.price * (item.quantity || 1)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
                                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-sm">
                                                <button onClick={() => decreaseCartItem(item.id)} className="px-3 py-1 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-center">{item.quantity || 1}</span>
                                                <button onClick={() => addToCart(item)} className="px-3 py-1 text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                                <button className="text-xs text-gray-400 hover:text-primary uppercase tracking-wider flex items-center gap-1 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">favorite</span> Save
                                                </button>
                                                <button onClick={() => removeFromCart(item.id)} className="text-xs text-gray-400 hover:text-red-500 uppercase tracking-wider flex items-center gap-1 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">delete</span> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <Link to="/shop" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-surface-dark rounded-lg p-8 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28">
                            <h2 className="font-display text-xl text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>Subtotal</span>
                                    <span className="font-medium">GH₵{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>Shipping</span>
                                    <span className="text-gray-400 italic">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>Tax</span>
                                    <span className="text-gray-400 italic">Included</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="font-display text-lg text-gray-900 dark:text-white font-medium">Total</span>
                                    <span className="font-display text-2xl text-primary font-bold">GH₵{total.toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/checkout')} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center space-x-2 group">
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">lock</span>
                                <span>Proceed to Checkout</span>
                            </button>
                            <div className="mt-6 flex justify-center space-x-4 text-gray-400 opacity-60">
                                <span className="material-symbols-outlined">credit_card</span>
                                <span className="material-symbols-outlined">account_balance</span>
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                        </div>

                        <div className="mt-6 bg-white dark:bg-surface-dark rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <label htmlFor="promo" className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Promo Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="promo"
                                    placeholder="Enter code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                />
                                <button className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded text-xs uppercase tracking-widest hover:bg-primary transition-colors">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                    <h3 className="font-display text-2xl text-center mb-10 text-gray-900 dark:text-white">You Might Also Like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {recommendations.map((prod) => (
                            <div key={prod.id} className="group bg-white dark:bg-surface-dark rounded-lg p-4 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/product/${prod.id}`)}>
                                <div className="relative aspect-square mb-4 overflow-hidden rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                    {prod.image ? (
                                        <img src={prod.image} alt={prod.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined text-4xl">local_florist</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark">
                                            <span className="material-symbols-outlined text-sm block">add</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-display font-semibold text-gray-800 dark:text-white truncate text-sm">{prod.name}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mb-1">{prod.brand}</p>
                                    <p className="text-primary font-semibold text-xs">GH₵{prod.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <Link to="/" className="font-display text-2xl font-bold tracking-wider text-black dark:text-white mb-6">
                        Parfum <span className="text-primary italic">D'Elite</span>
                    </Link>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Luxury Scents for the Elite.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">public</span></a>
                        <a href="#" className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">photo_camera</span></a>
                        <a href="#" className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">alternate_email</span></a>
                    </div>
                    <p className="text-gray-400 dark:text-gray-600 text-xs mt-8">© 2023 Parfum D'Elite. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Cart;
