import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { TableRowSkeleton } from '../LoadingSkeleton';

const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const res = await axios.get(`${API_URL}/api/admin/orders`);
                setOrders(res.data);
            });
        } catch (err) {
            handleError(err, 'Failed to load orders');
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="glass-card orders-section">
            <h3 style={{ marginBottom: '20px' }}>Recent Orders</h3>
            {isFetching ? (
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
                            <TableRowSkeleton rows={5} columns={5} />
                        </tbody>
                    </table>
                </div>
            ) : orders.length === 0 ? (
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
                                    <td>
                                        <span className={`status-badge ${order.status === 'completed' || order.status === 'paid' ? 'paid' : 'pending'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
