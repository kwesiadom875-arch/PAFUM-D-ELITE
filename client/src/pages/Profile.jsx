import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const userRes = await axios.get(`${API_URL}/api/user/profile`, config);
          setUser(userRes.data);
        } else {
           // If no token, maybe redirect or allow viewing static demo if that's the intent.
           // For now, we'll just stop loading so the default displayUser is shown (if we keep the fallback).
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
  };

  // Fallback data matching the design reference for visualization
  const displayUser = user || {
    name: "Isabella Montclair",
    email: "isabella@example.com",
    tier: "Elite Member",
    points: 5400,
    ordersCount: 12,
    scentsCount: 8,
    recentOrders: [
        { id: "ORD-7392", date: "Oct 24, 2023", items: "Midnight Rose (50ml)", status: "Shipped", total: 145.00 },
        { id: "ORD-7310", date: "Sep 12, 2023", items: "Discovery Set Vol. 1", status: "Delivered", total: 45.00 },
        { id: "ORD-7255", date: "Aug 05, 2023", items: "Amber Woods (100ml)", status: "Delivered", total: 210.00 }
    ]
  };

  const recentOrders = user?.orders || displayUser.recentOrders;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-text-light dark:text-text-dark flex flex-col font-sans">
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
              <h3 className="font-display font-medium text-lg dark:text-white">{displayUser.name.split(' ')[0]} M.</h3>
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
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-background-light dark:hover:bg-[#2a2518] hover:text-[#181611] dark:hover:text-white rounded-lg font-medium transition-colors mt-auto text-left w-full">
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
                <p className="font-display text-3xl font-bold dark:text-white">{displayUser.ordersCount || 12}</p>
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
                <p className="font-display text-3xl font-bold dark:text-white">{displayUser.scentsCount || 8}</p>
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
                      {recentOrders.map((order, idx) => (
                          <tr key={idx} className="group hover:bg-background-light/50 dark:hover:bg-[#221d10]/50 transition-colors">
                            <td className="px-6 py-4 font-medium dark:text-white">{order.id || order._id}</td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{order.date || new Date().toLocaleDateString()}</td>
                            <td className="px-6 py-4 dark:text-gray-300">{order.items || (order.orderItems?.length + " Items")}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Shipped' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {order.status || 'Processing'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium dark:text-white">GH₵{order.total || order.totalPrice}</td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommended Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold dark:text-white">Recommended for You</h2>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group bg-white dark:bg-[#1a160c] rounded-xl border border-[#e6e3db] dark:border-[#3a3528] overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[4/5] bg-gray-50 dark:bg-[#221d10] relative overflow-hidden">
                            <img alt="Golden perfume bottle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXLGZ_Gjo6VMA65eHHMDJYEoHo3nCKNLfToXwM3AJCNhPszJiiC52ZTtwL-jJfFGD1AvFMLQMUzpIXKjvsU6m4mXkSR0Ddt7PFi8t-r788D2nEh8hlJqnXWdrsQdRnt2oUn_D-bLAZmJCx_TTmkfbgZk6Ju8XnZUmypYCTos4YT67B_NMTU_TeLcJOvFDZtjnJY-AaRJTWFsZDysoKscqT0aSwVphvrPptftBS5-0GBMqfasZU055Who8jUcpcHQJ3JwUiH8K_oVo" />
                            <button className="absolute bottom-4 right-4 bg-white dark:bg-[#2a2518] text-[#181611] dark:text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-display font-bold text-lg text-[#181611] dark:text-white mb-1">Velvet Santal</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Woody • Spicy • Warm</p>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-[#181611] dark:text-white">$185.00</span>
                            </div>
                        </div>
                    </div>
                    <div className="group bg-white dark:bg-[#1a160c] rounded-xl border border-[#e6e3db] dark:border-[#3a3528] overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[4/5] bg-gray-50 dark:bg-[#221d10] relative overflow-hidden">
                            <img alt="Clear perfume bottle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe3dJU8p_ADKAuzudOR01v6RdXTVsXtu_tviexCCrdmOhCXapV1ERmhe1C-rZ3cmg_K7NQs7nkfLh-Zwwa3dQAC9PcvD7_uY_M3uuTTz97AnJpiFqYukZc2NE4v5cNfN75B6JddJBJ9xiMZTMdqgCvBMEpbYDsUxar6kpvGGeDj0OaqNKe2w3ACcaaCRkjLxeK68yf9nJKqjaCXVxDp7YhTsdJF6thW-PPDUxgR7_7F6WnZilMVG4mGg9nY8LtQbH7ncBTmrj7C98" />
                            <button className="absolute bottom-4 right-4 bg-white dark:bg-[#2a2518] text-[#181611] dark:text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-display font-bold text-lg text-[#181611] dark:text-white mb-1">Jasmine Noir</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Floral • Fresh • Light</p>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-[#181611] dark:text-white">$160.00</span>
                            </div>
                        </div>
                    </div>
                    <div className="group bg-white dark:bg-[#1a160c] rounded-xl border border-[#e6e3db] dark:border-[#3a3528] overflow-hidden hover:shadow-lg transition-all duration-300 hidden lg:block">
                        <div className="aspect-[4/5] bg-gray-50 dark:bg-[#221d10] relative overflow-hidden">
                            <img alt="Dark amber perfume bottle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2gspYfia3H7bcercYI9o6PiF-aTJjHwaDbyXY-1eAIVBAIlOmWsggkgRxUyqImrk4JGRJMSmvC2l_RYb58II9r1zJ5xf0R0tjfGrediuko7kF3-jimLD18W2Oe-zYm8iHS0Fa-SXl61qfwHmeUEnVz5-zRlzTwRyZffMv8f2dJpgl6hC6TxD-yjE6Pdy6hdjenI6F3UW5H4ntS5cxUI0Ib_SM_COev1427-PXX0kb8FSJap1DDorWafvQyo3w_EfMqYowraCw-0A" />
                            <button className="absolute bottom-4 right-4 bg-white dark:bg-[#2a2518] text-[#181611] dark:text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-display font-bold text-lg text-[#181611] dark:text-white mb-1">Oud Royal</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Oud • Intense • Smoky</p>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-[#181611] dark:text-white">$220.00</span>
                            </div>
                        </div>
                    </div>
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
                      <span className="px-3 py-1 bg-background-light dark:bg-[#221d10] text-[#181611] dark:text-white text-sm rounded-full border border-[#e6e3db] dark:border-[#3a3528]">Vetiver</span>
                      <span className="px-3 py-1 bg-background-light dark:bg-[#221d10] text-[#181611] dark:text-white text-sm rounded-full border border-[#e6e3db] dark:border-[#3a3528]">Jasmine</span>
                    </div>
                  </div>
                  <hr className="border-[#e6e3db] dark:border-[#3a3528]" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Olfactory Families</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-center p-3 rounded-lg bg-background-light dark:bg-[#221d10] border border-[#e6e3db] dark:border-[#3a3528]">
                        <span className="material-symbols-outlined text-primary mb-1">forest</span>
                        <p className="text-xs font-medium dark:text-white">Woody</p>
                      </div>
                      <div className="flex-1 text-center p-3 rounded-lg bg-background-light dark:bg-[#221d10] border border-[#e6e3db] dark:border-[#3a3528]">
                        <span className="material-symbols-outlined text-primary mb-1">local_florist</span>
                        <p className="text-xs font-medium dark:text-white">Floral</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#e6e3db] dark:border-[#3a3528]">
                  <button className="w-full py-3 bg-[#181611] dark:bg-white text-white dark:text-[#181611] font-medium rounded-lg hover:opacity-90 transition-opacity">
                    Take Scent Quiz Again
                  </button>
                </div>
              </div>

              {/* Shipping Address Widget */}
              <div className="bg-white dark:bg-[#1a160c] rounded-xl border border-[#e6e3db] dark:border-[#3a3528] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold dark:text-white">Default Shipping</h2>
                  <a href="#" className="text-xs font-bold text-primary uppercase tracking-wider">Manage</a>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-background-light dark:bg-[#221d10] rounded-full text-gray-500">
                    <span className="material-symbols-outlined text-xl">home_pin</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#181611] dark:text-white">{displayUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      428 Rue du Faubourg<br />
                      Paris, 75008<br />
                      France
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help? */}
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-6 flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-[#1a160c] rounded-full text-primary shadow-sm">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[#181611] dark:text-white">Need Assistance?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contact our Concierge.</p>
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
