import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const summaryRes = await axios.get(`${API_URL}/api/admin/analytics/summary`, config);
        setSummary(summaryRes.data);

        // const salesRes = await axios.get(`${API_URL}/api/admin/analytics/sales-over-time`, config);
        // setSales(salesRes.data);

        const usersRes = await axios.get(`${API_URL}/api/admin/users`, config);
        setUsers(usersRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Users</h4>
          <p>{summary?.totalUsers}</p>
        </div>
        <div className="summary-card">
          <h4>Total Products</h4>
          <p>{summary?.totalProducts}</p>
        </div>
        <div className="summary-card">
          <h4>Total Orders</h4>
          <p>{summary?.totalOrders}</p>
        </div>
      </div>

      {/*
      <div className="chart-container">
        <h3>Sales Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      */}

      <div className="users-table-container">
        <h3>Users</h3>
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Spending</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.tier}</td>
                <td>GH₵{user.spending}</td>
                <td>{user.isAdmin ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
