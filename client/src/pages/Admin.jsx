import React, { useState } from 'react';
import './Admin.css';

import Dashboard from '../components/Dashboard';
import InventoryTab from '../components/admin/InventoryTab';
import OrdersTab from '../components/admin/OrdersTab';
import StockTab from '../components/admin/StockTab';
import ScentIntelTab from '../components/admin/ScentIntelTab';
import FeaturedShowcaseTab from '../components/admin/FeaturedShowcaseTab';
import ClimateTestsTab from '../components/admin/ClimateTestsTab';
import UsersTab from '../components/admin/UsersTab';
import SiteContentTab from '../components/admin/SiteContentTab';
import RequestsTab from '../components/admin/RequestsTab';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'inventory': return <InventoryTab />;
            case 'orders': return <OrdersTab />;
            case 'requests': return <RequestsTab />;
            case 'stock': return <StockTab />;
            case 'scent-intel': return <ScentIntelTab />;
            case 'featured-showcase': return <FeaturedShowcaseTab />;
            case 'site-content': return <SiteContentTab />;
            case 'climate-tests': return <ClimateTestsTab />;
            case 'users': return <UsersTab />;
            default: return <Dashboard />;
        }
    };

    const NavItem = ({ id, label, icon }) => (
        <button
            className={`sidebar-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
        >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            {label}
        </button>
    );

    return (
        <div className="admin-page">
            {/* SIDEBAR */}
            <div className="admin-sidebar">
                <div className="sidebar-title">Admin Panel</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <NavItem id="dashboard" label="Dashboard" icon="" />
                    <NavItem id="site-content" label="Site Content" icon="" />
                    <NavItem id="inventory" label="Inventory" icon="" />
                    <NavItem id="orders" label="Orders" icon="" />
                    <NavItem id="requests" label="Requests" icon="" />
                    <NavItem id="stock" label="Stock Management" icon="" />
                    <NavItem id="scent-intel" label="Scent Intel AI" icon="" />
                    <NavItem id="featured-showcase" label="Showcase" icon="" />
                    <NavItem id="climate-tests" label="Climate Tests" icon="" />
                    <NavItem id="users" label="Users" icon="" />
                </nav>
            </div>

            {/* MAIN CONTENT */}
            <div className="admin-content">
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '2rem', color: '#333' }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Welcome back, Admin
                    </div>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;
