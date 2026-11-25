import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Receipt, CheckCircle, AlertCircle, ShoppingBag, XCircle } from 'lucide-react';

export const MyOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyOrders = async (silent = false) => {
    try {
      const res = await fetch('/api/orders/my', {
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
    fetchMyOrders(false);
    const interval = setInterval(() => {
      fetchMyOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMyOrders(true);
      } else {
        const data = await res.json();
        alert(data.message || 'Cannot cancel order');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] px-2 py-0.5 rounded font-medium">Received in Kitchen</span>;
      case 'Preparing':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-medium">Preparing in Kitchen</span>;
      case 'Ready for Pickup':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] px-2 py-0.5 rounded font-medium">Ready for Pickup</span>;
      case 'Completed':
        return <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[11px] px-2 py-0.5 rounded font-medium">Completed</span>;
      case 'Cancelled':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] px-2 py-0.5 rounded font-medium">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Order History</h1>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live sync active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time kitchen status and pickup windows for all advance orders.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-slate-800">No orders placed yet</h2>
          <p className="text-xs text-slate-400 mt-1">Pre-order dishes from the menu to track orders here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{order.orderNumber}</h3>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Pickup slot</span>
                    <strong className="text-xs text-slate-900 font-semibold">
                      {order.pickupSlot}
                    </strong>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* Order Items */}
              <div className="py-3.5 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover bg-slate-100 border border-slate-200"
                        />
                      )}
                      <span>
                        {item.name} <strong className="text-slate-900">× {item.quantity}</strong>
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer Summary & Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  Payment: <strong className="text-slate-800">{order.paymentMethod}</strong> ({order.paymentStatus})
                </div>

                <div className="flex items-center gap-4">
                  {order.orderStatus === 'Received' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingId === order._id}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-xs bg-rose-50 border border-rose-200 px-2 py-1 rounded cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === order._id ? 'Cancelling...' : 'Cancel order'}
                    </button>
                  )}
                  <div>
                    <span className="text-slate-500 mr-2">Total:</span>
                    <span className="text-sm font-bold text-slate-900">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
