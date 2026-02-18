
import React, { useState, useContext, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate, Link } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { toast } from 'react-toastify';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// PAYSTACK PUBLIC KEY - REPLACE WITH YOUR OWN
const PAYSTACK_PUBLIC_KEY = 'pk_live_8a853c7fcc5a73d4f20ee52019d3ecb070acb83b';

function LocationMarker({ onLocationSelect, position, setPosition }) {
    const [loading, setLoading] = useState(false);

    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            onLocationSelect({ lat, lng, address: "Loading address..." }); // Optimistic update

            // Fetch address
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    onLocationSelect({ lat, lng, address: data.display_name });
                })
                .catch(() => {
                    onLocationSelect({ lat, lng, address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
                });
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Delivery Location</Popup>
        </Marker>
    );
}

const Checkout = () => {
    const { cart, clearCart, user, refreshUser, getCartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    // State
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [mapPosition, setMapPosition] = useState({ lat: 6.5244, lng: -3.3792 }); // Default Lagos
    const [addressDisplay, setAddressDisplay] = useState('');

    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [invoiceEmail, setInvoiceEmail] = useState(user?.email || '');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);

    // Stepper State
    // 1: Shipping, 2: Delivery, 3: Payment
    const [step, setStep] = useState(1);

    // Navigation handlers
    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Calculate Totals
    const subtotal = getCartTotal();
    const discountRate = user ? (
        user.tier === 'Elite Diamond' ? 0.25 :
            user.tier === 'Diamond' ? 0.20 :
                user.tier === 'Platinum' ? 0.15 :
                    user.tier === 'Gold' ? 0.10 :
                        user.tier === 'Bronze' ? 0.05 : 0
    ) : 0;
    const discountAmount = subtotal * discountRate;
    const finalTotal = subtotal - discountAmount;

    // Paystack
    const config = {
        reference: (new Date()).getTime().toString(),
        email: invoiceEmail,
        amount: Math.round(finalTotal * 100), // kobo
        publicKey: PAYSTACK_PUBLIC_KEY,
        currency: 'GHS',
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference) => {
        processOrder(reference);
    };

    const onClose = () => {
        toast.info("Payment cancelled.");
        setProcessing(false);
    };

    const processOrder = async (paymentReference = null) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to complete purchase');
                navigate('/login');
                return;
            }

            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    productImage: item.image,
                    originalPrice: item.price,
                    finalPrice: item.price, // Simplified for brevity
                    quantity: item.quantity || 1,
                })),
                deliveryLocation: deliveryLocation, // Contains lat/lng/address
                phoneNumber,
                invoiceEmail,
                paymentMethod,
                paymentReference: paymentReference ? paymentReference.reference : null,
                shippingAddress: `${streetAddress}, ${city}`
            };

            const response = await fetch(`${API_URL}/api/user/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Purchase failed');

            toast.success("Order placed successfully!");
            clearCart();
            navigate('/profile'); // Redirect to profile/dashboard
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handlePlaceOrder = () => {
        if (!deliveryLocation) {
            toast.warn('Please select a delivery location on the map');
            setStep(2);
            return;
        }
        if (!phoneNumber || !invoiceEmail || !firstName) {
            toast.warn('Please fill in your contact details');
            setStep(1);
            return;
        }

        setProcessing(true);
        if (paymentMethod === 'card') {
            initializePayment(onSuccess, onClose);
        } else {
            processOrder();
        }
    };

    if (cart.length === 0) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen text-text-light dark:text-text-dark font-body transition-colors duration-300 flex flex-col">
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
                                <button className="text-xs uppercase font-semibold text-primary hover:text-primary-dark tracking-widest hidden sm:block">
                                    Ask Josie
                                </button>
                                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </Link>
                                <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors relative">
                                    <span className="material-symbols-outlined text-xl">shopping_bag</span>
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="flex flex-col items-center justify-center flex-grow">
                    <h2 className="font-display text-2xl mb-4 text-[#181611] dark:text-gray-100">Your Cart is Empty</h2>
                    <button
                        onClick={() => navigate('/shop')}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded uppercase tracking-widest text-sm font-semibold transition-colors"
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-text-light dark:text-text-dark font-body transition-colors duration-300 flex flex-col">
            {/* Header */}
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
                            <button className="text-xs uppercase font-semibold text-primary hover:text-primary-dark tracking-widest hidden sm:block">
                                Ask Josie
                            </button>
                            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </Link>
                            <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors relative">
                                <span className="material-symbols-outlined text-xl">shopping_bag</span>
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                    {cart.length}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column: Form Steps */}
                    <div className="flex-1 lg:max-w-3xl">
                        <h1 className="font-display text-3xl md:text-4xl text-gray-900 dark:text-white mb-10">Checkout</h1>

                        {/* Step 1: Shipping Information */}
                        {step === 1 && (
                            <div className="mb-12 animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-display text-xl text-gray-900 dark:text-white">1. Shipping Information</h2>
                                    <span className="text-xs text-primary uppercase tracking-wider font-semibold">Step 1 of 3</span>
                                </div>
                                <div className="bg-white dark:bg-[#1a160c] p-8 rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528] space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                                            <input
                                                value={firstName}
                                                onChange={e => setFirstName(e.target.value)}
                                                className="w-full py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors bg-white dark:bg-transparent"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                                            <input
                                                value={lastName}
                                                onChange={e => setLastName(e.target.value)}
                                                className="w-full py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors bg-white dark:bg-transparent"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Street Address</label>
                                        <input
                                            value={streetAddress}
                                            onChange={e => setStreetAddress(e.target.value)}
                                            className="w-full py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors bg-white dark:bg-transparent"
                                            placeholder="Enter street address"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">City</label>
                                            <input
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                className="w-full py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors bg-white dark:bg-transparent"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                                            <input
                                                value={phoneNumber}
                                                onChange={e => setPhoneNumber(e.target.value)}
                                                className="w-full py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors bg-white dark:bg-transparent"
                                                placeholder="+233 XX XXX XXXX"
                                                type="tel"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Email</label>
                                        <input
                                            value={invoiceEmail}
                                            onChange={e => setInvoiceEmail(e.target.value)}
                                            className="w-full py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors bg-white dark:bg-transparent"
                                            placeholder="email@example.com"
                                            type="email"
                                        />
                                    </div>

                                    <button
                                        onClick={nextStep}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded shadow-md mt-4 transition-colors uppercase tracking-widest text-sm"
                                    >
                                        Continue to Delivery
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Delivery Method */}
                        {step === 2 && (
                            <div className="mb-12 animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-display text-xl text-gray-900 dark:text-white">2. Delivery Method</h2>
                                    <span className="text-xs text-primary uppercase tracking-wider font-semibold">Step 2 of 3</span>
                                </div>
                                <div className="bg-white dark:bg-[#1a160c] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528]">
                                    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-[#3a3528] mb-6">
                                        <MapContainer center={[mapPosition.lat, mapPosition.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                            <LocationMarker
                                                position={mapPosition}
                                                setPosition={setMapPosition}
                                                onLocationSelect={(loc) => {
                                                    setDeliveryLocation(loc);
                                                    setAddressDisplay(loc.address);
                                                }}
                                            />
                                        </MapContainer>
                                    </div>
                                    {addressDisplay && (
                                        <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded border border-gray-100 dark:border-white/10">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-bold text-gray-900 dark:text-white block mb-1">Selected Location:</span>
                                                {addressDisplay}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={prevStep}
                                            className="px-6 py-4 border border-gray-200 dark:border-[#3a3528] text-gray-600 dark:text-gray-300 font-semibold rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-widest text-sm"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!deliveryLocation) {
                                                    toast.warn('Please select a delivery location');
                                                    return;
                                                }
                                                nextStep();
                                            }}
                                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded shadow-md transition-colors uppercase tracking-widest text-sm"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div className="mb-12 animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-display text-xl text-gray-900 dark:text-white">3. Payment Details</h2>
                                    <div className="flex space-x-2 text-gray-400">
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        <span className="text-xs uppercase tracking-wide">Secure</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a160c] p-8 rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528]">
                                    <div className="flex space-x-4 mb-8">
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex-1 py-3 border rounded flex items-center justify-center space-x-2 transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-[#3a3528] text-gray-500 hover:border-primary/50 hover:text-primary'}`}
                                        >
                                            <span className="material-symbols-outlined">credit_card</span>
                                            <span className="text-xs font-bold uppercase tracking-wide">Paystack / Card</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`flex-1 py-3 border rounded flex items-center justify-center space-x-2 transition-colors ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-[#3a3528] text-gray-500 hover:border-primary/50 hover:text-primary'}`}
                                        >
                                            <span className="material-symbols-outlined">payments</span>
                                            <span className="text-xs font-bold uppercase tracking-wide">Cash on Delivery</span>
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Mock Fields based on Design - Functionality Handled by Paystack Modal or COD */}
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded border border-gray-100 dark:border-white/10 text-center">
                                            {paymentMethod === 'card' ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-300">You will be redirected to Paystack to securely complete your payment.</p>
                                            ) : (
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Pay cash upon delivery of your order.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={prevStep}
                                            className="px-6 py-4 border border-gray-200 dark:border-[#3a3528] text-gray-600 dark:text-gray-300 font-semibold rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-widest text-sm"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={processing}
                                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded shadow-md transition-colors uppercase tracking-widest text-sm flex items-center justify-center"
                                        >
                                            {processing ? 'Processing...' : `Pay GH₵${finalTotal.toLocaleString()}`}
                                            <span className="material-symbols-outlined ml-2 text-sm">lock</span>
                                        </button>
                                    </div>
                                    <p className="text-center text-xs text-gray-400 mt-4">
                                        Secure SSL Encryption. 100% Safe Transaction.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:w-96 relative">
                        <div className="sticky top-32">
                            <h2 className="font-display text-xl text-gray-900 dark:text-white mb-6">Order Summary</h2>
                            <div className="bg-white dark:bg-[#1a160c] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528]">
                                <div className="space-y-6 mb-6 pb-6 border-b border-gray-100 dark:border-[#3a3528] max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-[#2a2518] rounded border border-gray-100 dark:border-[#3a3528] p-2 flex-shrink-0 flex items-center justify-center">
                                                <img alt={item.name} className="w-full h-full object-contain" src={item.image} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-display text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">{item.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.selectedSize || 'Standard'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity || 1}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">GH₵{item.price * (item.quantity || 1)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-[#3a3528]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">GH₵{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                                        <span className="text-primary font-semibold">Free</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-GH₵{discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-end mb-8">
                                    <span className="font-display text-lg text-gray-900 dark:text-white">Total</span>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 mb-1 block">GHS</span>
                                        <span className="font-display text-2xl font-bold text-primary">{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-4">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    <span>Secure Checkout</span>
                                </div>
                            </div>
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
                        <a href="#" className="text-gray-400 hover:text-primary">
                            <span className="material-symbols-outlined">public</span>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary">
                            <span className="material-symbols-outlined">photo_camera</span>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary">
                            <span className="material-symbols-outlined">alternate_email</span>
                        </a>
                    </div>
                    <p className="text-gray-400 dark:text-gray-600 text-xs mt-8">© 2023 Parfum D'Elite. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Checkout;
