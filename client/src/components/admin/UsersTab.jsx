import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { TableRowSkeleton } from '../LoadingSkeleton';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', isAdmin: true, isTester: false });

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

    const handleUpdateRole = async (userId, updates) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/admin/users/${userId}/role`,
                updates,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('User updated successfully');
            fetchUsers();
        } catch (error) {
            handleError(error, 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            handleError(error, 'Failed to delete user');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/users`, newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User created successfully');
            setShowCreateModal(false);
            setNewUser({ username: '', email: '', password: '', isAdmin: true, isTester: false });
            fetchUsers();
        } catch (error) {
            handleError(error, 'Failed to create user');
        }
    };

    return (
        <div className="glass-card form-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#C5A059', margin: 0 }}>User Management</h3>
                <button className="btn-gold" onClick={() => setShowCreateModal(true)}>
                    + Create New Admin
                </button>
            </div>

            <div className="orders-table-wrapper">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Stats</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <TableRowSkeleton rows={5} columns={5} />
                        ) : (
                            users.map(user => {
                                const isSuperAdmin = user.email === 'agyakwesiadom@gmail.com' || user.isSuperAdmin;
                                return (
                                    <tr key={user._id} style={isSuperAdmin ? { background: 'rgba(197, 160, 89, 0.1)' } : {}}>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                                            {isSuperAdmin && <span className="status-badge status-success" style={{ fontSize: '0.7rem', marginTop: '5px' }}>SUPER ADMIN</span>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                {user.isAdmin && <span className="status-badge status-review">Admin</span>}
                                                {user.isTester && <span className="status-badge status-progress">Tester</span>}
                                                <span className="status-badge status-pending">{user.tier}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <span className={`status-badge ${user.isVerified ? 'status-success' : 'status-failed'}`}>
                                                    {user.isVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                                {user.isSuspended && <span className="status-badge status-failed">SUSPENDED</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <div>Spent: ${user.spending?.toFixed(2)}</div>
                                                <div>Points: {user.points}</div>
                                            </div>
                                        </td>
                                        <td>
                                            {!isSuperAdmin && (
                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                                        onClick={() => handleUpdateRole(user._id, { isAdmin: !user.isAdmin })}
                                                    >
                                                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                                        onClick={() => handleUpdateRole(user._id, { isTester: !user.isTester })}
                                                    >
                                                        {user.isTester ? 'Remove Tester' : 'Make Tester'}
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                                        onClick={() => handleUpdateRole(user._id, { isVerified: !user.isVerified })}
                                                    >
                                                        {user.isVerified ? 'Unverify' : 'Verify'}
                                                    </button>
                                                    <button
                                                        className={user.isSuspended ? "btn-primary" : "delete-btn"}
                                                        style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                                        onClick={() => handleUpdateRole(user._id, { isSuspended: !user.isSuspended })}
                                                    >
                                                        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                                        onClick={() => handleDeleteUser(user._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* CREATE USER MODAL */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="glass-card" style={{ width: '400px', padding: '30px', position: 'relative', background: 'white' }}>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <h3 style={{ color: '#C5A059', marginBottom: '20px' }}>Create New Admin</h3>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    placeholder="Username"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#333' }}>
                                    <input
                                        type="checkbox"
                                        checked={newUser.isAdmin}
                                        onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                                        style={{ width: 'auto' }}
                                    />
                                    Admin
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#333' }}>
                                    <input
                                        type="checkbox"
                                        checked={newUser.isTester}
                                        onChange={(e) => setNewUser({ ...newUser, isTester: e.target.checked })}
                                        style={{ width: 'auto' }}
                                    />
                                    Tester
                                </label>
                            </div>
                            <button type="submit" className="btn-gold" style={{ width: '100%' }}>Create Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTab;
