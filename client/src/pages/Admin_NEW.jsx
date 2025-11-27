import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { toast } from 'react-toastify';
import './Admin.css';

import Dashboard from '../components/Dashboard';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [enrichStatus, setEnrichStatus] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);

    // Featured State
    const [featuredForm, setFeaturedForm] = useState({
        name: '', tagline: '', description: '', image: '', videoUrl: '', link: '/shop'
    });

    // Product Form State
    const [form, setForm] = useState({
        name: '', price: '', category: '', description: '', image: '', notes: '',
        perfumer: '', rating: '', gender: '', season: '', stockQuantity: 10
    });
    const [editingId, setEditingId] = useState(null);

    // Stock Update State
    const [stockUpdate, setStockUpdate] = useState({ productId: '', size: '', quantity: 0, price: '' });

    // Scraper State for Climate Tests
    const [climateScrapeUrl, setClimateScrapeUrl] = useState('');
    const [isClimateScraping, setIsClimateScraping] = useState(false);

    const [climateTests, setClimateTests] = useState([]);
    const [testers, setTesters] = useState([]);
    const [climateTestForm, setClimateTestForm] = useState({
        perfumeName: '', perfumeImage: '', testerId: '', climate: 'Room Temperature', endDate: '', brand: ''
    });

    // User Management State
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (activeTab === 'inventory' || activeTab === 'stock') fetchProducts();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'featured') fetchFeatured();
        if (activeTab === 'climate-tests') { fetchClimateTests(); fetchTesters(); }
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/products`);
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/orders`);
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchFeatured = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/featured`);
            if (res.data && res.data.name) {
                setFeaturedForm(res.data);
            }
        } catch (err) { console.error(err); }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFeaturedChange = (e) => {
        setFeaturedForm({ ...featuredForm, [e.target.name]: e.target.value });
    };

    const handleFeaturedSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/featured`, featuredForm);
            toast.success("Featured Perfume Updated!");
        } catch (error) { toast.error("Failed to update."); }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);

        setUploadingVideo(true);
        try {
            const res = await axios.post(`${API_URL}/api/admin/upload-hero-video`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Video Uploaded & Processed!");
            setFeaturedForm(prev => ({ ...prev, videoUrl: res.data.videoUrl }));
        } catch (error) {
            console.error(error);
            toast.error("Video upload failed.");
        }
        setUploadingVideo(false);
    };

    const handleScrape = async () => {
        if (!scrapeUrl) return toast.error("Paste a Fragrantica link first!");
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/scrape`, { url: scrapeUrl });
            const data = res.data;
            setForm({
                ...form,
                name: data.name || "",
                category: data.category || "Niche",
                description: data.description || "",
                image: data.image || "",
                notes: data.notes || "",
                perfumer: data.perfumer || "Master Perfumer",
                rating: data.rating || 4.5,
                gender: data.gender || "Unisex",
                season: "All Year",
                stockQuantity: 10
            });
            toast.success("Data Extracted Successfully!");
        } catch (error) {
            toast.error("Could not scrape. Try another link.");
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/api/products/${editingId}`, form);
                toast.success("Product Updated!");
            } else {
                const newProduct = { ...form, id: Math.floor(Math.random() * 100000) };
                await axios.post(`${API_URL}/api/products`, newProduct);
                toast.success("Product Added!");
            }

            setForm({ name: '', price: '', category: '', description: '', image: '', notes: '', perfumer: '', rating: '', gender: '', season: '', stockQuantity: 10 });
            setScrapeUrl('');
            setEditingId(null);
            fetchProducts();
        } catch (error) { toast.error("Failed to save."); }
    };

    const handleEdit = (product) => {
        setEditingId(product.id || product._id);
        setForm({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            image: product.image,
            notes: Array.isArray(product.notes) ? product.notes.join(', ') : product.notes,
            perfumer: product.perfumer || '',
            rating: product.rating || '',
            gender: product.gender || '',
            season: product.season || '',
            stockQuantity: product.stockQuantity
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', price: '', category: '', description: '', image: '', notes: '', perfumer: '', rating: '', gender: '', season: '', stockQuantity: 10 });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        await axios.delete(`${API_URL}/api/products/${id}`);
        fetchProducts();
    };

    const handleBatchEnrich = async () => {
        if (!window.confirm("This will use AI to enrich all products. Continue?")) return;
        setEnrichStatus('Enriching... This may take a minute.');
        try {
            const res = await axios.post(`${API_URL}/api/ai/enrich-all-products`);
            console.log("Enrichment Response:", res.data);
            if (res.data && res.data.results) {
                setEnrichStatus(`Success! ${res.data.results.length} products enriched.`);
            } else {
                setEnrichStatus('Enrichment completed, but no results returned.');
            }
            fetchProducts();
        } catch (error) {
            console.error("Enrichment Failed:", error);
            setEnrichStatus('Failed to enrich products. Check console for details.');
        }
    };

    // Climate Testing Functions
    const fetchClimateTests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/climate-tests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClimateTests(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTesters = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/testers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTesters(res.data);
        } catch (err) { console.error(err); }
    };

    const handleClimateTestSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/climate-tests`, climateTestForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Climate test created successfully!');
            setClimateTestForm({ perfumeName: '', perfumeImage: '', testerId: '', climate: 'Room Temperature', endDate: '', brand: '' });
            fetchClimateTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create climate test');
        }
    };

    const handleDeleteClimateTest = async (testId) => {
        if (!window.confirm('Delete this climate test?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/climate-tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Climate test deleted');
            fetchClimateTests();
        } catch (error) {
            toast.error('Failed to delete climate test');
        }
    };

    const handleMarkInReview = async (testId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}/review`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test marked as in-review');
            fetchClimateTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to mark as in-review');
        }
    };

    const handleApproveTest = async (testId) => {
        if (!window.confirm('Approve this climate test?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test approved successfully');
            fetchClimateTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to approve test');
        }
    };

    const handleRejectTest = async (testId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/climate-tests/${testId}/reject`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Test rejected');
            fetchClimateTests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reject test');
        }
    };

    // User Management Functions
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleToggleTester = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/admin/users/${userId}/tester`,
                { isTester: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Tester role ${!currentStatus ? 'granted' : 'revoked'}`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user role');
        }
    };

    const handleClimateScrape = async () => {
        if (!climateScrapeUrl || !climateScrapeUrl.includes('fragrantica.com')) {
            toast.error('Please enter a valid Fragrantica URL');
            return;
        }
        setIsClimateScraping(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/scrape`,
                { url: climateScrapeUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setClimateTestForm({
                ...climateTestForm,
                perfumeName: res.data.name || '',
                perfumeImage: res.data.image || '',
                brand: res.data.brand || ''
            });
            toast.success('Auto-filled from Fragrantica!');
            setClimateScrapeUrl('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to scrape data');
        } finally {
            setIsClimateScraping(false);
        }
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/update-stock`, stockUpdate);
            toast.success("Stock Updated!");
            setStockUpdate({ productId: '', size: '', quantity: 0, price: '' });
            fetchProducts();
        } catch (error) {
            toast.error("Failed to update stock.");
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'status-pending',
            'in-progress': 'status-progress',
            'submitted': 'status-submitted',
            'in-review': 'status-review',
            'success': 'status-success',
            'failed': 'status-failed',
            'expired': 'status-expired'
        };
        return badges[status] || 'status-pending';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'PENDING',
            'in-progress': 'IN PROGRESS',
            'submitted': 'SUBMITTED',
            'in-review': 'IN REVIEW',
            'success': 'APPROVED',
            'failed': 'REJECTED',
            'expired': 'EXPIRED'
        };
        return labels[status] || status.toUpperCase();
    };

    return (
        <div className="container admin-page">
            <div className="admin-header">
                <h2 className="section-title" style={{ color: '#C5A059', marginBottom: '0' }}>Admin Dashboard</h2>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                    <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
                    <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
                    <button className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>Stock</button>
                    <button className={`tab-btn ${activeTab === 'scent-intel' ? 'active' : ''}`} onClick={() => setActiveTab('scent-intel')}>Scent Intel AI</button>
                    <button className={`tab-btn ${activeTab === 'featured' ? 'active' : ''}`} onClick={() => setActiveTab('featured')}>Featured</button>
                    <button className={`tab-btn ${activeTab === 'climate-tests' ? 'active' : ''}`} onClick={() => setActiveTab('climate-tests')}>Climate Tests</button>
                    <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                </div>
            </div>

            {activeTab === 'dashboard' && <Dashboard />}

            {activeTab === 'inventory' && (
                <div className="admin-grid">
                    <div className="glass-card form-section">
                        <div className="scraper-box" style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#C5A059' }}>Auto-Fill from Fragrantica</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    placeholder="Paste https://www.fragrantica.com/perfume/..."
                                    value={scrapeUrl}
                                    onChange={(e) => setScrapeUrl(e.target.value)}
                                    style={{ marginBottom: 0 }}
                                />
                                <button className="btn-secondary" onClick={handleScrape} disabled={isLoading}>
                                    {isLoading ? "Fetching..." : "Auto-Fill"}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input name="name" value={form.name} placeholder="Name" onChange={handleChange} required />
                                <input name="price" value={form.price} type="number" placeholder="Price (GH₵)" onChange={handleChange} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input name="category" value={form.category} placeholder="Category (e.g. Woody)" onChange={handleChange} required />
                                <input name="gender" value={form.gender} placeholder="Gender (e.g. Unisex)" onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input name="perfumer" value={form.perfumer} placeholder="Perfumer Name" onChange={handleChange} />
                                <input name="rating" value={form.rating} placeholder="Rating (e.g. 4.5)" onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input name="stockQuantity" value={form.stockQuantity} type="number" placeholder="Initial Stock" onChange={handleChange} />
                                <input name="season" value={form.season} placeholder="Season" onChange={handleChange} />
                            </div>
                            {form.image && <img src={form.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '10px' }} />}
                            <input name="image" value={form.image} placeholder="Image URL" onChange={handleChange} required />
                            <input name="notes" value={form.notes} placeholder="Accords (Comma separated)" onChange={handleChange} required />
                            <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} rows="4" required />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                    {editingId ? "Update Product" : "Save to Inventory"}
                                </button>
                                {editingId && (
                                    <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="glass-card list-section">
                        <h3 style={{ marginBottom: '15px' }}>Inventory</h3>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {products.map(p => (
                                <div key={p.id || p._id} className="admin-item">
                                    <img src={p.image} alt={p.name} />
                                    <div style={{ flex: 1 }}>
                                        <h4>{p.name}</h4>
                                        <p style={{ color: '#C5A059' }}>GH₵{p.price}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Stock: {p.stockQuantity}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleEdit(p)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(p.id || p._id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="glass-card orders-section">
                    <h3 style={{ marginBottom: '20px' }}>Recent Orders</h3>
                    {orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <div className="orders-table-wrapper">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <tr key={i}>
                                            <td>{new Date(order.date).toLocaleDateString()}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <span className="c-name">{order.username}</span>
                                                    <span className="c-email">{order.email}</span>
                                                </div>
                                            </td>
                                            <td>{order.productName}</td>
                                            <td>GH₵{order.finalPrice}</td>
                                            <td><span className="status-badge paid">{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'stock' && (
                <div className="glass-card form-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Stock Management</h3>
                    <div className="stock-update-box" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                        <h4>Update Stock Level</h4>
                        <form onSubmit={handleStockUpdate} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                            <div>
                                <label>Product</label>
                                <select
                                    value={stockUpdate.productId}
                                    onChange={(e) => setStockUpdate({ ...stockUpdate, productId: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Size (Optional)</label>
                                <input
                                    placeholder="e.g. 50ml"
                                    value={stockUpdate.size}
                                    onChange={(e) => setStockUpdate({ ...stockUpdate, size: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Price (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="Override Price"
                                    value={stockUpdate.price || ''}
                                    onChange={(e) => setStockUpdate({ ...stockUpdate, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>New Quantity</label>
                                <input
                                    type="number"
                                    value={stockUpdate.quantity}
                                    onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">Update</button>
                        </form>
                    </div>

                    <h4>Current Inventory Status</h4>
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Main Stock</th>
                                    <th>Variants</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.stockQuantity}</td>
                                        <td>
                                            {p.sizes && p.sizes.length > 0 ? (
                                                <div style={{ fontSize: '0.8rem' }}>
                                                    {p.sizes.map(s => (
                                                        <div key={s.size}>{s.size}: {s.stockQuantity} (GH₵{s.price})</div>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {p.isAvailable ? (
                                                <span className="status-badge paid">In Stock</span>
                                            ) : (
                                                <span className="status-badge pending">Out of Stock</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'scent-intel' && (
                <div className="glass-card form-section" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Scent Intel AI Enrichment</h3>
                    <p style={{ marginBottom: '30px', color: '#666' }}>
                        Use our AI to automatically analyze all products in the inventory and populate missing metadata:
                        <br /><strong>Brand, Concentration, Gender, Origin, Season, and more.</strong>
                    </p>
                    <div style={{ padding: '30px', background: '#f5f5f5', borderRadius: '12px', border: '1px dashed #C5A059' }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠 ✨</h1>
                        <button
                            className="btn-primary"
                            onClick={handleBatchEnrich}
                            disabled={enrichStatus.includes('Enriching')}
                            style={{ fontSize: '1.2rem', padding: '15px 40px' }}
                        >
                            {enrichStatus.includes('Enriching') ? 'AI is Working...' : 'Run Batch Enrichment'}
                        </button>
                        {enrichStatus && (
                            <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '8px', borderLeft: '4px solid #C5A059' }}>
                                <strong>Status:</strong> {enrichStatus}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'featured' && (
                <div className="glass-card form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Manage Featured Perfume</h3>
                    <p style={{ marginBottom: '20px', color: '#888' }}>This is the perfume that appears at the end of the Home page scroll.</p>
                    <form onSubmit={handleFeaturedSubmit}>
                        <input name="name" value={featuredForm.name} placeholder="Perfume Name" onChange={handleFeaturedChange} required />
                        <input name="tagline" value={featuredForm.tagline} placeholder="Tagline (e.g. A journey through...)" onChange={handleFeaturedChange} required />
                        <input name="image" value={featuredForm.image} placeholder="Image URL" onChange={handleFeaturedChange} required />
                        {featuredForm.image && <img src={featuredForm.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}

                        <div style={{ marginBottom: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hero Video (Auto-processed)</label>
                            <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} />
                            {uploadingVideo && <p style={{ color: '#C5A059' }}>Processing video... please wait.</p>}
                            {featuredForm.videoUrl && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '5px' }}>Current Video: {featuredForm.videoUrl}</p>}
                        </div>

                        <textarea name="description" value={featuredForm.description} placeholder="Short Description" onChange={handleFeaturedChange} rows="3" required />
                        <input name="link" value={featuredForm.link} placeholder="Link (e.g. /shop)" onChange={handleFeaturedChange} />
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update Featured Perfume</button>
                    </form>
                </div>
            )}

            {activeTab === 'climate-tests' && (
                <div className="glass-card form-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Climate Testing Management</h3>

                    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                        <h4>Create New Climate Test</h4>

                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                            <h5 style={{ marginBottom: '10px', color: '#C5A059', fontSize: '0.95rem' }}>🔗 Auto-Fill from Fragrantica</h5>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    placeholder="Paste Fragrantica URL here..."
                                    value={climateScrapeUrl}
                                    onChange={(e) => setClimateScrapeUrl(e.target.value)}
                                    style={{ flex: 1, marginBottom: 0 }}
                                />
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleClimateScrape}
                                    disabled={isClimateScraping}
                                    style={{ whiteSpace: 'nowrap', padding: '10px 20px' }}
                                >
                                    {isClimateScraping ? "Fetching..." : "Auto-Fill"}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleClimateTestSubmit} style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input
                                    placeholder="Perfume Name"
                                    value={climateTestForm.perfumeName}
                                    onChange={(e) => setClimateTestForm({ ...climateTestForm, perfumeName: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Brand"
                                    value={climateTestForm.brand}
                                    onChange={(e) => setClimateTestForm({ ...climateTestForm, brand: e.target.value })}
                                />
                            </div>
                            <input
                                placeholder="Perfume Image URL"
                                value={climateTestForm.perfumeImage}
                                onChange={(e) => setClimateTestForm({ ...climateTestForm, perfumeImage: e.target.value })}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <select
                                    value={climateTestForm.testerId}
                                    onChange={(e) => setClimateTestForm({ ...climateTestForm, testerId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Tester</option>
                                    {testers.map(t => (
                                        <option key={t._id} value={t._id}>{t.username} ({t.email})</option>
                                    ))}
                                </select>
                                <input
                                    placeholder="Climate Conditions"
                                    value={climateTestForm.climate}
                                    onChange={(e) => setClimateTestForm({ ...climateTestForm, climate: e.target.value })}
                                />
                            </div>
                            <input
                                type="date"
                                placeholder="Target End Date"
                                value={climateTestForm.endDate}
                                onChange={(e) => setClimateTestForm({ ...climateTestForm, endDate: e.target.value })}
                            />
                            <button type="submit" className="btn-primary">Create Climate Test</button>
                        </form>
                    </div>

                    <h4>All Climate Tests</h4>
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Perfume</th>
                                    <th>Brand</th>
                                    <th>Tester</th>
                                    <th>Climate</th>
                                    <th>Status</th>
                                    <th>Rating</th>
                                    <th>Recommendation</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {climateTests.map(test => (
                                    <tr key={test._id}>
                                        <td>{test.perfumeName}</td>
                                        <td>{test.brand || '-'}</td>
                                        <td>{test.testerName}</td>
                                        <td>{test.climate}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(test.status)}`}>
                                                {getStatusLabel(test.status)}
                                            </span>
                                        </td>
                                        <td>{test.finalRating ? `${test.finalRating}/10` : '-'}</td>
                                        <td>
                                            {test.recommendation ? (
                                                <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                                    {test.recommendation.replace(/-/g, ' ')}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                {test.status === 'submitted' && (
                                                    <>
                                                        <button
                                                            className="btn-secondary"
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                            onClick={() => handleMarkInReview(test._id)}
                                                        >
                                                            Mark In Review
                                                        </button>
                                                        <button
                                                            className="btn-primary"
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                            onClick={() => handleApproveTest(test._id)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                            onClick={() => handleRejectTest(test._id)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {test.status === 'in-review' && (
                                                    <>
                                                        <button
                                                            className="btn-primary"
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                            onClick={() => handleApproveTest(test._id)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                            onClick={() => handleRejectTest(test._id)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="delete-btn"
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                                    onClick={() => handleDeleteClimateTest(test._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="glass-card form-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>User Management</h3>

                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Tier</th>
                                    <th>Admin</th>
                                    <th>Tester</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.tier}</td>
                                        <td>{user.isAdmin ? '✓' : '-'}</td>
                                        <td>{user.isTester ? '✓' : '-'}</td>
                                        <td>
                                            <button
                                                className={user.isTester ? "delete-btn" : "btn-secondary"}
                                                onClick={() => handleToggleTester(user._id, user.isTester)}
                                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                            >
                                                {user.isTester ? 'Remove Tester' : 'Make Tester'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
