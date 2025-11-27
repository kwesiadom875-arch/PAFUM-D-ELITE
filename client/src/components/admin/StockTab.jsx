import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { isRequired, isValidStock, isValidPrice } from '../../utils/validation';
import { TableRowSkeleton } from '../LoadingSkeleton';

const StockTab = () => {
    const [products, setProducts] = useState([]);
    const [stockUpdate, setStockUpdate] = useState({ productId: '', size: '', quantity: 0, price: '' });
    const [isFetching, setIsFetching] = useState(true);

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


    const handleStockUpdate = async (e) => {
        e.preventDefault();

        // Validation
        if (!isRequired(stockUpdate.productId)) {
            return toast.error("Please select a product");
        }
        if (!isValidStock(stockUpdate.quantity)) {
            return toast.error("Please enter a valid quantity");
        }
        if (stockUpdate.price && !isValidPrice(stockUpdate.price)) {
            return toast.error("Please enter a valid price");
        }

        try {
            await axios.post(`${API_URL}/api/admin/update-stock`, stockUpdate);
            toast.success("Stock Updated!");
            setStockUpdate({ productId: '', size: '', quantity: 0, price: '' });
            fetchProducts();
        } catch (error) {
            handleError(error, "Failed to update stock");
        }
    };


    return (
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
                        {isFetching ? (
                            <TableRowSkeleton rows={5} columns={4} />
                        ) : (
                            products.map(p => (
                                <tr key={p.id || p._id}>
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTab;
