import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { isValidFragranticaUrl, isValidPrice, isValidStock, isRequired } from '../../utils/validation';
import { CardSkeleton } from '../LoadingSkeleton';

const InventoryTab = () => {
    const [products, setProducts] = useState([]);
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [form, setForm] = useState({
        name: '', price: '', category: '', description: '', image: '', notes: '',
        perfumer: '', rating: '', gender: '', season: '', stockQuantity: 10
    });
    const [editingId, setEditingId] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const res = await axios.get(`${API_URL}/api/products`);
                setProducts(res.data);
            });
        } catch (err) {
            handleError(err, 'Failed to load products');
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleScrape = async () => {
        // Validate Fragrantica URL
        if (!isRequired(scrapeUrl)) {
            return toast.error("Please paste a Fragrantica link first!");
        }
        if (!isValidFragranticaUrl(scrapeUrl)) {
            return toast.error("Please enter a valid Fragrantica URL");
        }

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
            handleError(error, "Failed to scrape data. Please check the URL and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!isRequired(form.name)) {
            errors.name = 'Product name is required';
        }
        if (!isValidPrice(form.price)) {
            errors.price = 'Valid price is required';
        }
        if (!isRequired(form.category)) {
            errors.category = 'Category is required';
        }
        if (!isRequired(form.description)) {
            errors.description = 'Description is required';
        }
        if (!isRequired(form.image)) {
            errors.image = 'Image URL is required';
        }
        if (!isValidStock(form.stockQuantity)) {
            errors.stockQuantity = 'Valid stock quantity is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            toast.error("Please fix the form errors");
            return;
        }

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
            setFormErrors({});
            fetchProducts();
        } catch (error) {
            handleError(error, "Failed to save product");
        }
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
        try {
            await axios.delete(`${API_URL}/api/products/${id}`);
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error) {
            handleError(error, "Failed to delete product");
        }
    };

    return (
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
                        <div>
                            <input name="name" value={form.name} placeholder="Name" onChange={handleChange} style={formErrors.name ? { borderColor: 'red' } : {}} />
                            {formErrors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{formErrors.name}</span>}
                        </div>
                        <div>
                            <input name="price" value={form.price} type="number" placeholder="Price (GH₵)" onChange={handleChange} style={formErrors.price ? { borderColor: 'red' } : {}} />
                            {formErrors.price && <span style={{ color: 'red', fontSize: '0.8rem' }}>{formErrors.price}</span>}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <input name="category" value={form.category} placeholder="Category (e.g. Woody)" onChange={handleChange} style={formErrors.category ? { borderColor: 'red' } : {}} />
                            {formErrors.category && <span style={{ color: 'red', fontSize: '0.8rem' }}>{formErrors.category}</span>}
                        </div>
                        <input name="gender" value={form.gender} placeholder="Gender (e.g. Unisex)" onChange={handleChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input name="perfumer" value={form.perfumer} placeholder="Perfumer Name" onChange={handleChange} />
                        <input name="rating" value={form.rating} placeholder="Rating (e.g. 4.5)" onChange={handleChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <input name="stockQuantity" value={form.stockQuantity} type="number" placeholder="Initial Stock" onChange={handleChange} style={formErrors.stockQuantity ? { borderColor: 'red' } : {}} />
                            {formErrors.stockQuantity && <span style={{ color: 'red', fontSize: '0.8rem' }}>{formErrors.stockQuantity}</span>}
                        </div>
                        <input name="season" value={form.season} placeholder="Season" onChange={handleChange} />
                    </div>
                    {form.image && <img src={form.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '10px' }} />}
                    <div>
                        <input name="image" value={form.image} placeholder="Image URL" onChange={handleChange} style={formErrors.image ? { borderColor: 'red' } : {}} />
                        {formErrors.image && <span style={{ color: 'red', fontSize: '0.8rem' }}>{formErrors.image}</span>}
                    </div>
                    <div>
                        <input name="notes" value={form.notes} placeholder="Accords (Comma separated)" onChange={handleChange} />
                    </div>
                    <div>
                        <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} rows="4" style={formErrors.description ? { borderColor: 'red' } : {}} />
                        {formErrors.description && <span style={{ color: 'red', fontSize: '0.8rem' }}>{formErrors.description}</span>}
                    </div>

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
                    {isFetching ? (
                        <div style={{ padding: '20px' }}>
                            <CardSkeleton count={3} />
                        </div>
                    ) : (
                        products.map(p => (
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryTab;
