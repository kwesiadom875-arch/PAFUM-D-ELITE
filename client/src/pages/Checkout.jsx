import { useState, useContext, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './Checkout.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DeliveryMap({ onLocationSelect }) {
    const [position, setPosition] = useState([6.5244, -3.3792]); // Default: Lagos, Nigeria
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Map component to handle view changes
    function MapController({ center }) {
        const map = useMapEvents({});
        useEffect(() => {
            if (center) {
                map.flyTo(center, 13);
            }
        }, [center, map]);
        return null;
    }

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                reverseGeocode(e.latlng.lat, e.latlng.lng);
            },
        });
        return position ? <Marker position={position} /> : null;
    }

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
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                reverseGeocode(latitude, longitude);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                alert("Unable to retrieve your location");
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
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker />
                <MapController center={position} />
            </MapContainer>
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
    const [paymentMethod, setPaymentMethod] = useState('card');
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

    const handleCheckout = async () => {
        if (!deliveryLocation) {
            alert('⚠️ Please select a delivery location on the map');
            return;
        }

        if (!phoneNumber) {
            alert('⚠️ Please enter a phone number for delivery');
            return;
        }

        if (!invoiceEmail) {
            alert('⚠️ Please enter an email address for the invoice');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setProcessing(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to complete purchase');
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
                paymentMethod
            };

            // Send to backend
            const response = await fetch('http://localhost:5000/api/user/purchase', {
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
            alert(`✅ Order placed successfully!\n\nTotal: GH₵${calculateFinalTotal().toFixed(2)}\nItems: ${cart.length}\n\nDelivery to: ${deliveryLocation.address}`);

            // Refresh user data to get updated tier and spending
            await refreshUser();

            clearCart();
            navigate('/profile');

        } catch (error) {
            console.error('Checkout error:', error);
            alert(`❌ ${error.message || 'Failed to complete purchase. Please try again.'}`);
        } finally {
            setProcessing(false);
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
                            <span className="payment-icon">💳</span>
                            Credit/Debit Card
                        </label>
                        <label className={paymentMethod === 'paypal' ? 'active' : ''}>
                            <input
                                type="radio"
                                value="paypal"
                                checked={paymentMethod === 'paypal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="payment-icon">📱</span>
                            PayPal
                        </label>
                        <label className={paymentMethod === 'cash' ? 'active' : ''}>
                            <input
                                type="radio"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="payment-icon">💵</span>
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
                    {processing ? '⏳ Processing...' : `🛍️ Place Order - GH₵${calculateFinalTotal().toFixed(2)}`}
                </button>

                {!deliveryLocation && (
                    <p className="warning-text">⚠️ Please select a delivery location on the map above</p>
                )}
            </div>
        </div>
    );
}
