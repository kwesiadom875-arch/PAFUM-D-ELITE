import React, { useState } from 'react';
import {
    FaChartLine, FaBox, FaClipboardList, FaUsers, FaQuestionCircle,
    FaGem, FaStar, FaGlobe, FaEdit, FaFlask, FaTemperatureHigh
} from 'react-icons/fa';
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
import ReviewsTab from '../components/admin/ReviewsTab';

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
            case 'reviews': return <ReviewsTab />;
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
                    <NavItem id="dashboard" label="Dashboard" icon={<FaChartLine />} />
                    <NavItem id="site-content" label="Site Content" icon={<FaGlobe />} />
                    <NavItem id="inventory" label="Inventory" icon={<FaBox />} />
                    <NavItem id="orders" label="Orders" icon={<FaClipboardList />} />
                    <NavItem id="requests" label="Requests" icon={<FaQuestionCircle />} />
                    <NavItem id="stock" label="Stock Management" icon={<FaGem />} />
                    <NavItem id="scent-intel" label="Scent Intel AI" icon={<FaFlask />} />
                    <NavItem id="featured-showcase" label="Showcase" icon={<FaEdit />} />
                    <NavItem id="climate-tests" label="Climate Tests" icon={<FaTemperatureHigh />} />
                    <NavItem id="reviews" label="Reviews" icon={<FaStar />} />
                    <NavItem id="users" label="Users" icon={<FaUsers />} />
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
