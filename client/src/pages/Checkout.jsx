import { useState, useContext, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { toast } from 'react-toastify';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import './Checkout.css';

// PAYSTACK PUBLIC KEY - REPLACE WITH YOUR OWN
const PAYSTACK_PUBLIC_KEY = 'pk_live_8a853c7fcc5a73d4f20ee52019d3ecb070acb83b';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 6.5244,
    lng: -3.3792
};

function DeliveryMap({ onLocationSelect }) {
    const [position, setPosition] = useState(defaultCenter); // Default: Lagos, Nigeria
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    });

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
    }, []);

    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setAddress(data.display_name);
            onLocationSelect({ lat, lng, address: data.display_name });
        } catch (error) {
            console.error('Geocoding error:', error);
            setAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            onLocationSelect({ lat, lng, address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        } finally {
            setLoading(false);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = { lat: latitude, lng: longitude };
                setPosition(newPos);
                if (map) {
                    map.panTo(newPos);
                }
                reverseGeocode(latitude, longitude);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                toast.error("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    return (
        <div className="delivery-map-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3>📍 Select Delivery Location</h3>
                <button
                    onClick={handleUseMyLocation}
                    className="btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    📍 Use My Location
                </button>
            </div>
            <p className="map-instruction">Click anywhere on the map to set your delivery location</p>

            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={position}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                >
                    <Marker position={position} />
                </GoogleMap>
            ) : (
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '12px' }}>
                    Loading Map...
                </div>
            )}

            <div className="selected-address">
                <strong>Delivery Address:</strong>
                {loading ? (
                    <p className="loading">Loading address...</p>
                ) : (
                    <p>{address || 'Click on map to select location'}</p>
                )}
            </div>
        </div>
    );
}

export default function Checkout() {
    const { cart, clearCart, user, refreshUser } = useContext(CartContext);
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [invoiceEmail, setInvoiceEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' (Paystack) or 'cash'
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.email) {
            setInvoiceEmail(user.email);
        }
    }, [user]);

    const calculateTotal = () => {
        return cart.reduce((sum, item) => {
            const itemPrice = item.selectedSize
                ? item.sizes?.find(s => s.size === item.selectedSize)?.price || item.price
                : item.price;
            return sum + (itemPrice * (item.quantity || 1));
        }, 0);
    };

    const getDiscountRate = (tier) => {
        switch (tier) {
            case 'Elite Diamond': return 0.25;
            case 'Diamond': return 0.20;
            case 'Platinum': return 0.15;
            case 'Gold': return 0.10;
            case 'Bronze': return 0.05;
            default: return 0;
        }
    };

    const calculateFinalTotal = () => {
        const subtotal = calculateTotal();
        const discount = user ? getDiscountRate(user.tier) : 0;
        return subtotal * (1 - discount);
    };

    // Paystack Configuration
    const config = {
        reference: (new Date()).getTime().toString(),
        email: invoiceEmail,
        amount: Math.round(calculateFinalTotal() * 100), // Amount in kobo/cents
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
                navigate('/auth');
                return;
            }

            // Prepare order data
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    productImage: item.image,
                    originalPrice: item.price,
                    finalPrice: item.selectedSize
                        ? item.sizes?.find(s => s.size === item.selectedSize)?.price || item.price
                        : item.price,
                    selectedSize: item.selectedSize || null,
                    quantity: item.quantity || 1,
                    negotiated: item.negotiated || false
                })),
                deliveryLocation,
                phoneNumber,
                invoiceEmail,
                paymentMethod,
                paymentReference: paymentReference ? paymentReference.reference : null
            };

            // Send to backend
            const response = await fetch(`${API_URL}/api/user/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Purchase failed');
            }

            // Success!
            toast.success(`Order placed successfully!`);

            // Refresh user data to get updated tier and spending
            await refreshUser();

            clearCart();
            navigate('/profile');

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to complete purchase. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckout = () => {
        if (!deliveryLocation) {
            toast.warn('Please select a delivery location on the map');
            return;
        }

        if (!phoneNumber) {
            toast.warn('Please enter a phone number for delivery');
            return;
        }

        if (!invoiceEmail) {
            toast.warn('Please enter an email address for the invoice');
            return;
        }

        if (cart.length === 0) {
            toast.warn('Your cart is empty');
            return;
        }

        setProcessing(true);

        if (paymentMethod === 'card') {
            // Trigger Paystack
            initializePayment(onSuccess, onClose);
        } else {
            // Cash on Delivery
            processOrder();
        }
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <h1>🛒 Your Cart is Empty</h1>
                    <p>Add some luxurious fragrances to your cart to checkout.</p>
                    <button className="shop-btn" onClick={() => navigate('/shop')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1>✨ Checkout</h1>

                {/* Order Summary */}
                <section className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="cart-items">
                        {cart.map((item, index) => {
                            const itemPrice = item.selectedSize
                                ? item.sizes?.find(s => s.size === item.selectedSize)?.price || item.price
                                : item.price;

                            return (
                                <div key={`${item.id}-${index}`} className="cart-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        {item.selectedSize && (
                                            <p className="size-badge">Size: {item.selectedSize}</p>
                                        )}
                                        <p className="quantity">Quantity: {item.quantity || 1}</p>
                                        <p className="price">GH₵{itemPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="item-total">
                                        GH₵{(itemPrice * (item.quantity || 1)).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="total-section">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>GH₵{calculateTotal().toFixed(2)}</span>
                        </div>

                        {/* Discount Display */}
                        {user && user.tier && (
                            <div className="total-row discount-row" style={{ color: '#4CAF50' }}>
                                <span>{user.tier} Discount ({getDiscountRate(user.tier) * 100}%):</span>
                                <span>-GH₵{(calculateTotal() * getDiscountRate(user.tier)).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="total-row">
                            <span>Shipping:</span>
                            <span>FREE</span>
                        </div>
                        <div className="total-row grand-total">
                            <strong>Total:</strong>
                            <strong>GH₵{calculateFinalTotal().toFixed(2)}</strong>
                        </div>
                    </div>
                </section>

                {/* Contact Details */}
                <section className="contact-section">
                    <h2>📞 Contact Details</h2>
                    <div className="form-group">
                        <label>Phone Number for Delivery</label>
                        <input
                            type="tel"
                            placeholder="e.g. +233 55 123 4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="checkout-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email for Invoice</label>
                        <input
                            type="email"
                            placeholder="e.g. your@email.com"
                            value={invoiceEmail}
                            onChange={(e) => setInvoiceEmail(e.target.value)}
                            className="checkout-input"
                        />
                    </div>
                </section>

                {/* Delivery Map */}
                <section className="delivery-section">
                    <DeliveryMap onLocationSelect={setDeliveryLocation} />
                </section>

                {/* Payment Method */}
                <section className="payment-section">
                    <h2>💳 Payment Method</h2>
                    <div className="payment-options">
                        <label className={paymentMethod === 'card' ? 'active' : ''}>
                            <input
                                type="radio"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="payment-icon"></span>
                            Pay with Paystack (Card/Mobile Money)
                        </label>
                        <label className={paymentMethod === 'cash' ? 'active' : ''}>
                            <input
                                type="radio"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="payment-icon"></span>
                            Cash on Delivery
                        </label>
                    </div>
                </section>

                {/* Checkout Button */}
                <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={processing || !deliveryLocation}
                >
                    {processing ? 'Processing...' : ` Place Order - GH₵${calculateFinalTotal().toFixed(2)}`}
                </button>

                {!deliveryLocation && (
                    <p className="warning-text">Please select a delivery location on the map above</p>
                )}
            </div>
        </div>
    );
}
