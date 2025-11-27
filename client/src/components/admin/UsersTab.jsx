import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { TableRowSkeleton } from '../LoadingSkeleton';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(res.data);
            });
        } catch (err) {
            handleError(err, 'Failed to load users');
        } finally {
            setIsFetching(false);
        }
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
            handleError(error, 'Failed to update user role');
        }
    };

    return (
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
                        {isFetching ? (
                            <TableRowSkeleton rows={5} columns={6} />
                        ) : (
                            users.map(user => (
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTab;
