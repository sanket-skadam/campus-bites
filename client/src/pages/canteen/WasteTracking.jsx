import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, CheckCircle2 } from 'lucide-react';

const REASONS = ['Over-preparation', 'Expired', 'Damaged / spoiled', 'Customer leftovers', 'Other'];
const DISPOSAL_METHODS = ['Composting', 'Biowaste collection', 'Other'];

export const WasteTracking = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [totalWaste, setTotalWaste] = useState(0);
  const [reasonBreakdown, setReasonBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  // Form State
  const [item, setItem] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [reason, setReason] = useState('Over-preparation');
  const [disposalMethod, setDisposalMethod] = useState('Composting');
  const [staffName, setStaffName] = useState(user?.name || 'Chef Ramesh');
  const [msg, setMsg] = useState('');
  const [menuList, setMenuList] = useState([]);

  const fetchWasteData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/waste', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalWaste(data.totalWasteKg || 0);
        setReasonBreakdown(data.reasonBreakdown || {});
      }
    } catch (err) {
      console.error('Failed to load waste data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuDishes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuList(data || []);
      }
    } catch (err) {
      console.error('Failed to load menu dishes:', err);
    }
  };

  useEffect(() => {
    fetchWasteData();
    fetchMenuDishes();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          item,
          quantityKg,
          reason,
          disposalMethod,
          staffName: staffName || user?.name
        })
      });

      if (res.ok) {
        setMsg('Food waste log entry saved successfully');
        setItem('');
        setQuantityKg('');
        fetchWasteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Food Waste Accounting</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record surplus, expired ingredients, and disposal pathways to guide daily meal procurement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Waste Logged
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalWaste} kg</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cumulative weight logged</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Waste Cap
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">7.5 kg / day</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full ${totalWaste > 7.5 ? 'bg-rose-500' : 'bg-slate-900'}`}
              style={{ width: `${Math.min(100, (totalWaste / 7.5) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Primary Cause of Surplus
          </span>
          <div className="text-base font-bold text-slate-900 mt-1">
            {Object.keys(reasonBreakdown).length > 0
              ? Object.entries(reasonBreakdown).sort((a, b) => b[1] - a[1])[0][0]
              : 'None recorded'}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Largest source of food waste</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Log Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-slate-700" />
              Log Waste Entry
            </h2>

            {msg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Food item / Dish *
                </label>
                <select
                  required
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="" disabled>-- Select a dish from menu --</option>
                  {menuList.length > 0 && (
                    <optgroup label="Dishes from Menu Setup">
                      {menuList.map((dish) => (
                        <option key={dish._id} value={dish.name}>
                          {dish.name} ({dish.category})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Kitchen Surplus & Preps">
                    <option value="Cooked Basmati Rice">Cooked Basmati Rice</option>
                    <option value="Tadka Dal / Sambar">Tadka Dal / Sambar</option>
                    <option value="Prepared Subzi / Gravy">Prepared Subzi / Gravy</option>
                    <option value="Sliced Bread Loaves">Sliced Bread Loaves</option>
                    <option value="Salad Veggies">Salad Veggies</option>
                    <option value="Other Kitchen Surplus">Other Kitchen Surplus</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quantity (in Kilograms) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="1.5"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason for disposal *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Disposal pathway
                </label>
                <select
                  value={disposalMethod}
                  onChange={(e) => setDisposalMethod(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {DISPOSAL_METHODS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Staff signature / Name
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Staff Name"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-3 rounded-md transition cursor-pointer"
              >
                Save entry
              </button>
            </form>
          </div>
        </div>

        {/* Right: Waste Log Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Logged Waste Audit
              </h2>
              <span className="text-[11px] text-slate-400">{logs.length} entries recorded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Disposal</th>
                    <th className="py-2.5 px-3">Staff</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{log.item}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{log.quantityKg} kg</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {log.reason}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{log.disposalMethod}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.staffName}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
