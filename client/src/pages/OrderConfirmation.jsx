import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order, orderId } = location.state || {};

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body transition-colors duration-300">
                <h2 className="font-display text-2xl mb-4">No Order Found</h2>
                <button onClick={() => navigate('/')} className="bg-primary text-white px-6 py-3 rounded hover:bg-primary-dark transition-colors">Return Home</button>
            </div>
        );
    }

    const { items, shippingAddress, totalAmount, deliveryMethod } = order;
    // Calculate estimated delivery
    const deliveryDateStart = new Date();
    const deliveryDateEnd = new Date();
    if (deliveryMethod === 'express') {
        deliveryDateStart.setDate(deliveryDateStart.getDate() + 1);
        deliveryDateEnd.setDate(deliveryDateEnd.getDate() + 2);
    } else {
        deliveryDateStart.setDate(deliveryDateStart.getDate() + 3);
        deliveryDateEnd.setDate(deliveryDateEnd.getDate() + 5);
    }
    const options = { month: 'short', day: 'numeric' };
    const dateRange = `${deliveryDateStart.toLocaleDateString('en-US', options)} - ${deliveryDateEnd.toLocaleDateString('en-US', options)}`;

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body transition-colors duration-300 flex flex-col min-h-screen">
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
                            <div className="text-gray-600 dark:text-gray-300 relative">
                                <span className="material-symbols-outlined text-xl">shopping_bag</span>
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex-grow flex items-center justify-center">
                <div className="w-full text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
                        </div>
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl text-gray-900 dark:text-white mb-6">Thank you for your order, {shippingAddress.firstName}!</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">We've received your order and it will be processed shortly.</p>
                    <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-12">Order #{orderId}</p>

                    <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-lg p-8 md:p-10 shadow-sm max-w-2xl mx-auto mb-12 text-left">
                        <h2 className="font-display text-xl text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Order Summary</h2>

                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-6 mb-8">
                                <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 p-2 flex-shrink-0">
                                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">{item.productName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">GH₵{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                            <div>
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Shipping Address</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {shippingAddress.firstName} {shippingAddress.lastName}<br />
                                    {shippingAddress.address}<br />
                                    {shippingAddress.city}, {shippingAddress.country} {shippingAddress.postalCode}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Estimated Delivery</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery'}<br />
                                    <span className="font-medium text-gray-900 dark:text-white">{dateRange}</span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</span>
                            <span className="font-display text-2xl font-bold text-primary">GH₵{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => navigate('/shop')} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest text-xs font-bold">
                            Continue Shopping
                        </button>
                        <div className="flex gap-4">
                            <Link to="/track-order/123" className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-primary transition-colors px-6 py-4 border border-transparent hover:border-gray-200 rounded">Track Order</Link>
                            <button className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-primary transition-colors px-6 py-4 border border-transparent hover:border-gray-200 rounded">View Receipt</button>
                        </div>
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
                        <a href="#" className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">social_leaderboard</span></a>
                        <a href="#" className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">photo_camera</span></a>
                        <a href="#" className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">alternate_email</span></a>
                    </div>
                    <p className="text-gray-400 dark:text-gray-600 text-xs mt-8">© 2023 Parfum D'Elite. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default OrderConfirmation;
