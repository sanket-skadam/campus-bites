import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  DollarSign,
  Trash2,
  Package,
  ChefHat,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const CanteenDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeKitchenOrders: 0,
    recentOrders: []
  });
  const [totalWaste, setTotalWaste] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const orderRes = await fetch('/api/orders/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setStats(orderData);
        }

        const wasteRes = await fetch('/api/waste', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (wasteRes.ok) {
          const wasteData = await wasteRes.json();
          setTotalWaste(wasteData.totalWasteKg || 0);
        }

        const invRes = await fetch('/api/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (invRes.ok) {
          const invData = await invRes.json();
          setLowStockCount(invData.lowStockCount || 0);
        }

        const intelRes = await fetch('/api/waste/analytics/intelligence', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (intelRes.ok) {
          const intelData = await intelRes.json();
          setIntelligence(intelData);
        }
      } catch (err) {
        console.error('Failed to load canteen dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Canteen Operations Overview
            </h1>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
              Live dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of order volumes, kitchen queue, inventory alerts, and food waste accounting.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/canteen/kitchen"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition"
          >
            <ChefHat className="w-3.5 h-3.5" />
            Kitchen Queue ({stats.activeKitchenOrders})
          </Link>
          <Link
            to="/canteen/waste"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs px-3.5 py-2 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
            Log Waste
          </Link>
        </div>
      </div>

      {/* KPI Cards (Flat SaaS metric cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Orders Today</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.totalOrders}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Pre-orders booked across slots</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Gross Sales</span>
            <span className="text-xs font-bold text-slate-400">₹</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹{stats.totalRevenue}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Daily canteen revenue</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Waste Logged</span>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalWaste} kg</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Unsold & surplus food</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Inventory Alerts</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{lowStockCount}</div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            {lowStockCount > 0 ? 'Ingredients near threshold' : 'All stock levels healthy'}
          </span>
        </div>
      </div>

      {/* Demand vs Waste Intelligence (Clean SaaS Data Table & Metric) */}
      {intelligence && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Demand vs Waste Efficiency Analytics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison between actual pre-orders fulfilled and logged food surplus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Preparation Accuracy:</span>
              <span className="text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {intelligence.efficiencyRate}%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Menu Dish</th>
                  <th className="py-2.5 px-3">Portions Sold</th>
                  <th className="py-2.5 px-3">Portions Wasted</th>
                  <th className="py-2.5 px-3">Efficiency Rate</th>
                  <th className="py-2.5 px-3">Operational Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {intelligence.itemInsights.map((insight, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{insight.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{insight.sold} units</td>
                    <td className="py-2.5 px-3 text-slate-700">{insight.wasted} units</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[11px]">
                        {insight.efficiency}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{insight.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders in Kitchen */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Pre-Orders
            </h2>
            <Link
              to="/canteen/kitchen"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              Open KDS board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 font-semibold block">{order.orderNumber}</strong>
                    <span className="text-slate-500">{order.userName} · Slot: {order.pickupSlot}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900 block">₹{order.totalAmount}</span>
                    <span className="bg-slate-100 text-slate-700 font-medium text-[10px] px-1.5 py-0.5 rounded">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet today.</p>
            )}
          </div>
        </div>

        {/* Operational Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Shift Operations & Batch Control
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-slate-600" />
              On-Demand Batch Preparation Principle
            </div>
            <p className="leading-relaxed text-slate-600">
              Check orders arriving in the next 15-minute slot before starting preparation. Preparing smaller batches on demand prevents cooling and avoids end-of-shift unsold waste.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Daily Checklist
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-700">Check raw material inventory thresholds</span>
                <Link to="/canteen/inventory" className="text-slate-900 font-semibold hover:underline">Review inventory</Link>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-700">Log unsold evening surplus and disposal</span>
                <Link to="/canteen/waste" className="text-slate-900 font-semibold hover:underline">Record waste</Link>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-700">Update dish availability & pricing</span>
                <Link to="/canteen/menu-management" className="text-slate-900 font-semibold hover:underline">Manage menu</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
