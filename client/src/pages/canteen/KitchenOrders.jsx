import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Check, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

const STATUS_TABS = ['All', 'Received', 'Preparing', 'Ready for Pickup', 'Completed'];

export const KitchenOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async (silent = false) => {
    try {
      const url = activeTab === 'All'
        ? '/api/orders'
        : `/api/orders?status=${encodeURIComponent(activeTab)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus, stockDeducted: updated.stockDeducted } : o))
        );
        if (newStatus === 'Completed') {
          setToastMsg(`Order marked completed & ingredients deducted from inventory`);
          setTimeout(() => setToastMsg(''), 3000);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kitchen Order Board (KDS)</h1>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live auto-sync (4s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage preparation workflow and handovers per scheduled pickup window.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(false)}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading kitchen tickets...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <ChefHat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No tickets in this status</h3>
          <p className="text-xs text-slate-400 mt-1">Pre-orders will stream in as students place them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-slate-200 p-4.5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{order.orderNumber}</h3>
                    <span className="text-[11px] text-slate-500">{order.userName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pickup</span>
                    <span className="text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {order.pickupSlot}
                    </span>
                  </div>
                </div>

                <div className="py-3 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-6 h-6 rounded object-cover bg-slate-100 border border-slate-200"
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <strong className="text-slate-900">× {item.quantity}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total: ₹{order.totalAmount}</span>
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px]">
                    {order.orderStatus}
                  </span>
                </div>

                {order.stockDeducted && (
                  <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded font-medium flex items-center gap-1">
                    ✓ Stock deducted from inventory
                  </div>
                )}

                {/* Status Action Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  {order.orderStatus === 'Received' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Preparing')}
                      className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-3 rounded-lg transition cursor-pointer"
                    >
                      Start preparation
                    </button>
                  )}

                  {order.orderStatus === 'Preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Ready for Pickup')}
                      className="col-span-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-3 rounded-lg transition cursor-pointer"
                    >
                      Mark ready for pickup
                    </button>
                  )}

                  {order.orderStatus === 'Ready for Pickup' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Completed')}
                      className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition cursor-pointer"
                    >
                      Complete & deduct stock
                    </button>
                  )}

                  {order.orderStatus === 'Completed' && (
                    <div className="col-span-2 text-center text-xs font-medium text-slate-400 py-1">
                      Order fulfilled
                    </div>
                  )}

                  {order.orderStatus === 'Cancelled' && (
                    <div className="col-span-2 text-center text-xs font-medium text-rose-600 py-1">
                      Cancelled by student
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
