import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Plus, AlertTriangle, Trash2 } from 'lucide-react';

export const InventoryPage = () => {
  const { token } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Add Ingredient Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    currentStock: '',
    unit: 'kg',
    reorderThreshold: 10,
    expiryDate: ''
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.items || []);
        setLowStockCount(data.lowStockCount || 0);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newIngredient)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewIngredient({
          name: '',
          currentStock: '',
          unit: 'kg',
          reorderThreshold: 10,
          expiryDate: ''
        });
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (id, currentStock, delta) => {
    const updatedStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentStock: updatedStock })
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ingredient from inventory records?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Stock Controls</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor raw material levels, track batch expiration dates, and adjust restock orders.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition self-start cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Close form' : 'Add ingredient'}
        </button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <div>
            <strong className="font-semibold">Threshold alert:</strong> {lowStockCount} ingredient(s) are near or below minimum reserve limit. Restock before starting morning prep.
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Register Raw Material
          </h2>
          <form onSubmit={handleAddIngredient} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ingredient name *</label>
              <input
                type="text"
                required
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                placeholder="e.g. Potatoes, Onions"
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current stock *</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={newIngredient.currentStock}
                onChange={(e) => setNewIngredient({ ...newIngredient, currentStock: e.target.value })}
                placeholder="25"
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="packs">packs (Bread/Buns)</option>
                <option value="liters">liters (Milk/Oil)</option>
                <option value="units">units (Eggs/Puffs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Reorder threshold</label>
              <input
                type="number"
                value={newIngredient.reorderThreshold}
                onChange={(e) => setNewIngredient({ ...newIngredient, reorderThreshold: e.target.value })}
                placeholder="10"
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Expiration date *</label>
              <input
                type="date"
                required
                value={newIngredient.expiryDate}
                onChange={(e) => setNewIngredient({ ...newIngredient, expiryDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2 flex items-end justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-md text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
              >
                Save ingredient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Raw material</th>
                <th className="py-3 px-4">Available stock</th>
                <th className="py-3 px-4">Reorder limit</th>
                <th className="py-3 px-4">Expiry date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Quick adjust</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.reorderThreshold} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        item.status === 'Stable'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : item.status === 'Reorder soon'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStock(item._id, item.currentStock, -1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                        title="Deduct 1"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateStock(item._id, item.currentStock, 1)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                        title="Add 1"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleUpdateStock(item._id, item.currentStock, 5)}
                        className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer"
                        title="Restock 5"
                      >
                        +5
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
