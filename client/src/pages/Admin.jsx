import React, { useState } from 'react';
import './Admin.css';

import Dashboard from '../components/Dashboard';
import InventoryTab from '../components/admin/InventoryTab';
import OrdersTab from '../components/admin/OrdersTab';
import StockTab from '../components/admin/StockTab';
import ScentIntelTab from '../components/admin/ScentIntelTab';
import FeaturedTab from '../components/admin/FeaturedTab';
import FeaturedShowcaseTab from '../components/admin/FeaturedShowcaseTab';
import ClimateTestsTab from '../components/admin/ClimateTestsTab';
import UsersTab from '../components/admin/UsersTab';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

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
                    <button className={`tab-btn ${activeTab === 'featured-showcase' ? 'active' : ''}`} onClick={() => setActiveTab('featured-showcase')}>Showcase</button>
                    <button className={`tab-btn ${activeTab === 'climate-tests' ? 'active' : ''}`} onClick={() => setActiveTab('climate-tests')}>Climate Tests</button>
                    <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                </div>
            </div>

            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'inventory' && <InventoryTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'stock' && <StockTab />}
            {activeTab === 'scent-intel' && <ScentIntelTab />}
            {activeTab === 'featured' && <FeaturedTab />}
            {activeTab === 'featured-showcase' && <FeaturedShowcaseTab />}
            {activeTab === 'climate-tests' && <ClimateTestsTab />}
            {activeTab === 'users' && <UsersTab />}
        </div>
    );
};

export default Admin;
