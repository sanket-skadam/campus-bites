import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Utensils, Clock, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [recentOrder, setRecentOrder] = useState(null);
  const [menuHighlights, setMenuHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await fetch('http://localhost:5000/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (orderRes.ok) {
          const orders = await orderRes.json();
          if (orders.length > 0) setRecentOrder(orders[0]);
        }

        const menuRes = await fetch('http://localhost:5000/api/menu');
        if (menuRes.ok) {
          const items = await menuRes.json();
          setMenuHighlights(items.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
              {user?.department || 'Student'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Browse today's canteen offerings, book your pickup window, and avoid counter waiting times.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/student/menu"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            Order Food
          </Link>
          <Link
            to="/student/orders"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition border border-slate-200 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            Track Orders
          </Link>
        </div>
      </div>

      {/* Active Order Live Tracker */}
      {recentOrder && recentOrder.orderStatus !== 'Completed' && recentOrder.orderStatus !== 'Cancelled' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-900">
                Active Order: {recentOrder.orderNumber}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                Slot: <strong className="text-slate-900">{recentOrder.pickupSlot}</strong>
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500">
              ₹{recentOrder.totalAmount} · {recentOrder.paymentMethod} ({recentOrder.paymentStatus})
            </span>
          </div>

          <div className="pt-4">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
              <span>Status: <strong className="text-slate-900">{recentOrder.orderStatus}</strong></span>
              <span>{recentOrder.orderStatus === 'Ready for Pickup' ? 'Counter Ready!' : 'Estimated: on time'}</span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{
                  width:
                    recentOrder.orderStatus === 'Received'
                      ? '33%'
                      : recentOrder.orderStatus === 'Preparing'
                        ? '66%'
                        : '100%'
                }}
              ></div>
            </div>

            <p className="text-xs text-slate-500 mt-2.5">
              Items: {recentOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Menu Highlights with Real Food Images */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Featured Today
            </h2>
            <p className="text-xs text-slate-500">Fresh daily canteen specials</p>
          </div>
          <Link
            to="/student/menu"
            className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
          >
            View full menu <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuHighlights.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                {/* Real Food Image */}
                <div className="w-full h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.image || '/dishes/thali.jpg'}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/dishes/thali.jpg';
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200/80 shadow-xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <span className="text-sm font-semibold text-slate-900">₹{item.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to="/student/menu"
                  className="w-full inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium py-2 rounded-lg transition"
                >
                  Order item
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
