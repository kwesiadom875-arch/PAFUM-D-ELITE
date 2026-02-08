import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // For demo/dev purposes, if no token, we might want to show dummy data or redirect
        // specific logic can be adjusted based on user preference
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const userRes = await axios.get(`${API_URL}/api/user/profile`, config);
          setUser(userRes.data);
        } else {
          // Redirect or handle unauthenticated state
          // window.location.href = '/login';
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Placeholder data if user is null for visualization during dev (remove in prod)
  const displayUser = user || {
    name: "Isabella M.",
    email: "isabella@example.com",
    tier: "Elite Member",
    spending: 1250,
    points: 5400,
    orders: 12,
    scents: 8
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#181611] dark:text-gray-100 flex flex-col font-sans">
      {/* Main Layout */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-10 py-10 gap-10">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0">
          {/* User Short Profile */}
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#e6e3db] dark:border-[#3a3528]">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#e6e3db] dark:border-[#3a3528]">
              <img alt="Profile Picture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA86Si99SiVvKHd4VNeAC6ngyIZt_2cQq55To-vQxzejbKrxEWONr6631cD4oWRyKuffW8_n03gLWLDcKtbRC5Gp6U7SdNLLoSew9Q_XuxkBETQkVGy-AsPuWb5N0SZjGPqqa2ClaKtY96sMs10NkWagVCfjtY-_hOkD9v_KdjwxaEW8daZy1TUft9d32HFYrMy1sOLzKNz3nrWIhzcBjYCJA6WuZOhs4QA5kIgRVV5sDMtMzLhtZXTgQQMxnSLojzhBsN4TbFUlNc" />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg dark:text-white">{displayUser.name}</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Elite Member</span>
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium transition-colors">
              <span className="material-symbols-outlined fill-current">dashboard</span>
              Dashboard
            </Link>
            <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-background-light dark:hover:bg-[#2a2518] hover:text-[#181611] dark:hover:text-white rounded-lg font-medium transition-colors">
              <span className="material-symbols-outlined">shopping_bag</span>
              Orders
            </Link>
            <Link to="/scents" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-background-light dark:hover:bg-[#2a2518] hover:text-[#181611] dark:hover:text-white rounded-lg font-medium transition-colors">
              <span className="material-symbols-outlined">filter_vintage</span>
              My Scents
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-background-light dark:hover:bg-[#2a2518] hover:text-[#181611] dark:hover:text-white rounded-lg font-medium transition-colors">
              <span className="material-symbols-outlined">person</span>
              Profile
            </Link>
            <button className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-background-light dark:hover:bg-[#2a2518] hover:text-[#181611] dark:hover:text-white rounded-lg font-medium transition-colors mt-auto text-left w-full">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </nav>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-10">
          {/* Welcome Header */}
          <section>
            <h1 className="font-display text-4xl font-bold text-[#181611] dark:text-white mb-2">Welcome back, {displayUser.name.split(' ')[0]}</h1>
            <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your account today.</p>
          </section>
          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div className="bg-white dark:bg-[#1a160c] p-6 rounded-xl border border-[#e6e3db] dark:border-[#3a3528] shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">shopping_cart</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                <p className="font-display text-3xl font-bold dark:text-white">{displayUser.orders}</p>
              </div>
              <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Last order 2 days ago
              </div>
            </div>
            {/* Stat 2 */}
            <div className="bg-primary text-white p-6 rounded-xl shadow-md flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-20">
                <span className="material-symbols-outlined text-6xl">diamond</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Loyalty Points</p>
                <p className="font-display text-3xl font-bold">{displayUser.points.toLocaleString()}</p>
              </div>
              <div className="text-xs font-medium text-white/90 bg-white/20 w-fit px-2 py-1 rounded">
                +120 pts earned recently
              </div>
            </div>
            {/* Stat 3 */}
            <div className="bg-white dark:bg-[#1a160c] p-6 rounded-xl border border-[#e6e3db] dark:border-[#3a3528] shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">favorite</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">My Scents</p>
                <p className="font-display text-3xl font-bold dark:text-white">{displayUser.scents}</p>
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Floral & Woody notes preferred
              </div>
            </div>
          </section>
          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column (Tables & Info) */}
            <div className="xl:col-span-2 flex flex-col gap-8">
              {/* Recent Orders Table */}
              <div className="bg-white dark:bg-[#1a160c] rounded-xl border border-[#e6e3db] dark:border-[#3a3528] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#e6e3db] dark:border-[#3a3528]">
                  <h2 className="font-display text-xl font-bold dark:text-white">Recent Orders</h2>
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">View All</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background-light dark:bg-[#221d10] text-gray-500 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Items</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6e3db] dark:divide-[#3a3528]">
                      <tr className="group hover:bg-background-light/50 dark:hover:bg-[#221d10]/50 transition-colors">
                        <td className="px-6 py-4 font-medium dark:text-white">#ORD-7392</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Oct 24, 2023</td>
                        <td className="px-6 py-4 dark:text-gray-300">Midnight Rose (50ml)</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Shipped
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium dark:text-white">$145.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Right Column (Scent Profile & Address) */}
            <div className="flex flex-col gap-8">
              {/* My Scent Profile Widget */}
              <div className="bg-white dark:bg-[#1a160c] rounded-xl border border-[#e6e3db] dark:border-[#3a3528] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold dark:text-white">My Scent Profile</h2>
                  <button className="text-primary hover:text-primary/80">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Favorite Notes</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-background-light dark:bg-[#221d10] text-[#181611] dark:text-white text-sm rounded-full border border-[#e6e3db] dark:border-[#3a3528]">Sandalwood</span>
                      <span className="px-3 py-1 bg-background-light dark:bg-[#221d10] text-[#181611] dark:text-white text-sm rounded-full border border-[#e6e3db] dark:border-[#3a3528]">Bergamot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
