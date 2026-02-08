
import React, { useState, useContext, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
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

    // Accordion State
    const [openSection, setOpenSection] = useState(1); // 1: Shipping, 2: Delivery, 3: Payment

    const toggleSection = (section) => {
        if (openSection === section) setOpenSection(null);
        else setOpenSection(section);
    };

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
            setOpenSection(2);
            return;
        }
        if (!phoneNumber || !invoiceEmail || !firstName) {
            toast.warn('Please fill in your contact details');
            setOpenSection(1);
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                <h2 className="font-display text-2xl mb-4 text-[#181611] dark:text-gray-100">Your Cart is Empty</h2>
                <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-primary text-white font-bold rounded hover:bg-primary-dark transition-colors">
                    Return to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-text-light dark:text-text-dark font-body transition-colors duration-300 pb-20">
            {/* Dedicated Minimal Header for Checkout */}
            <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#1a160c]/95 backdrop-blur border-b border-gray-100 dark:border-[#3a3528] mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-20">
                        <div className="flex-shrink-0 flex items-center">
                            <a href="/" className="font-display text-2xl font-bold tracking-wider text-[#181611] dark:text-white">
                                Parfum <span className="text-primary italic">D'Elite</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6">
                <h1 className="font-display text-3xl text-center mb-8 text-[#181611] dark:text-white">Checkout</h1>

                {/* Order Summary Accordion */}
                <div className="mb-6 bg-white dark:bg-[#1a160c] rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528] overflow-hidden">
                    <details className="group" open>
                        <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                                <span>Order Summary ({cart.length} items)</span>
                            </div>
                            <span className="font-display font-bold text-lg text-primary">GH₵{finalTotal.toLocaleString()}</span>
                            <span className="material-symbols-outlined transform group-open:rotate-180 transition-transform duration-300 text-gray-400">expand_more</span>
                        </summary>
                        <div className="border-t border-gray-100 dark:border-[#3a3528] p-4 bg-gray-50 dark:bg-[#1a160c]/50">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-4 mb-4">
                                    <div className="w-16 h-16 bg-white dark:bg-[#2a2518] rounded border border-gray-200 dark:border-[#3a3528] flex items-center justify-center relative">
                                        <img alt={item.name} className="w-12 h-12 object-contain" src={item.image} />
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white rounded-full text-xs flex items-center justify-center">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display font-semibold text-[#181611] dark:text-white">{item.name}</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.selectedSize || 'Standard'}</p>
                                    </div>
                                    <span className="font-semibold text-[#181611] dark:text-white">GH₵{item.price * (item.quantity || 1)}</span>
                                </div>
                            ))}

                            <div className="border-t border-gray-200 dark:border-[#3a3528] pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>GH₵{subtotal.toLocaleString()}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({discountRate * 100}%)</span>
                                        <span>- GH₵{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span>Included</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-[#3a3528] mt-4 pt-4 flex justify-between items-center">
                                <span className="font-bold text-[#181611] dark:text-white">Total</span>
                                <span className="font-display font-bold text-xl text-primary">GH₵{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="space-y-4">
                    {/* Section 1: Shipping Address */}
                    <div className="bg-white dark:bg-[#1a160c] rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528] overflow-hidden">
                        <div
                            className="p-4 border-b border-gray-100 dark:border-[#3a3528] flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection(1)}
                        >
                            <h2 className="font-display text-lg font-semibold text-[#181611] dark:text-white flex items-center">
                                <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center mr-3 font-body ${firstName && phoneNumber ? 'bg-primary' : 'bg-gray-300 text-gray-500'}`}>1</span>
                                Contact Details
                            </h2>
                            {firstName && phoneNumber && <span className="material-symbols-outlined text-primary">check_circle</span>}
                        </div>

                        {openSection === 1 && (
                            <div className="p-6 animate-fade-in">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                                            <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white dark:bg-[#2a2518] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3a3528] rounded p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="First Name" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                                            <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white dark:bg-[#2a2518] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3a3528] rounded p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Last Name" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                        <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} className="w-full bg-white dark:bg-[#2a2518] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3a3528] rounded p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Email Address" type="email" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                                        <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-white dark:bg-[#2a2518] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3a3528] rounded p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Phone Number" type="tel" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setOpenSection(2)}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded shadow-md mt-4 transition-colors uppercase tracking-widest text-sm"
                                    >
                                        Continue to Delivery
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Delivery Method (Map) */}
                    <div className="bg-white dark:bg-[#1a160c] rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528] overflow-hidden">
                        <div
                            className="p-4 border-b border-gray-100 dark:border-[#3a3528] flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection(2)}
                        >
                            <h2 className="font-display text-lg font-semibold text-[#181611] dark:text-white flex items-center">
                                <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center mr-3 font-body ${deliveryLocation ? 'bg-primary' : 'bg-gray-300 text-gray-500'}`}>2</span>
                                Delivery Location
                            </h2>
                            {deliveryLocation && <span className="material-symbols-outlined text-primary">check_circle</span>}
                        </div>

                        {openSection === 2 && (
                            <div className="p-6 animate-fade-in">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Detailed Address (Optional)</p>
                                    <input value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className="w-full bg-white dark:bg-[#2a2518] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3a3528] rounded p-2 text-sm mb-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Street Address, Apartment, etc." />
                                    <input value={city} onChange={e => setCity(e.target.value)} className="w-full bg-white dark:bg-[#2a2518] text-gray-900 dark:text-white border border-gray-300 dark:border-[#3a3528] rounded p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="City" />
                                </div>
                                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-[#3a3528]">
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
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Selected: <strong>{addressDisplay}</strong>
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setOpenSection(3)}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded shadow-md mt-4 transition-colors uppercase tracking-widest text-sm"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Payment */}
                    <div className="bg-white dark:bg-[#1a160c] rounded-lg shadow-sm border border-gray-100 dark:border-[#3a3528] overflow-hidden">
                        <div
                            className="p-4 border-b border-gray-100 dark:border-[#3a3528] flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection(3)}
                        >
                            <h2 className="font-display text-lg font-semibold text-[#181611] dark:text-white flex items-center">
                                <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center mr-3 font-body ${'bg-gray-300 text-gray-500'}`}>3</span>
                                Payment
                            </h2>
                        </div>

                        {openSection === 3 && (
                            <div className="p-6 animate-fade-in">
                                <div className="space-y-3">
                                    <label className="relative block cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="peer sr-only"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <div className="p-4 rounded border border-gray-200 dark:border-[#3a3528] flex items-center justify-between peer-checked:border-primary peer-checked:bg-primary/5 transition-colors">
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                                                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Paystack (Card/Mobile Money)</span>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400">credit_card</span>
                                        </div>
                                    </label>

                                    <label className="relative block cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="peer sr-only"
                                            checked={paymentMethod === 'cash'}
                                            onChange={() => setPaymentMethod('cash')}
                                        />
                                        <div className="p-4 rounded border border-gray-200 dark:border-[#3a3528] flex items-center justify-between peer-checked:border-primary peer-checked:bg-primary/5 transition-colors">
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'}`}>
                                                    {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Cash on Delivery</span>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400">payments</span>
                                        </div>
                                    </label>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-gold-hover text-white font-semibold py-4 rounded shadow-md mt-6 transition-colors uppercase tracking-widest text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : `Pay GH₵${finalTotal.toLocaleString()}`}
                                    <span className="material-symbols-outlined ml-2 text-sm">lock</span>
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Secure SSL Encryption. 100% Safe Transaction.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
