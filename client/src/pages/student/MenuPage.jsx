import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Search, Plus, Minus, Check, Clock } from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Meals & Thali', 'Snacks', 'Beverages', 'Dessert'];

export const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [addedToast, setAddedToast] = useState(null);
  const { addToCart, updateQuantity, cart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/menu');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleAdd = (item) => {
    addToCart(item);
    setAddedToast(`${item.name} added to cart`);
    setTimeout(() => setAddedToast(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          {addedToast}
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Today's Menu</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select items, adjust quantities, and proceed to scheduled counter pickup.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food items..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-xs"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading menu catalog...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-xs font-medium">No dishes found matching your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const inCart = cart.find((c) => c._id === item._id);
            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  {/* Real Food Photography */}
                  <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.image || '/dishes/sandwich.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/dishes/sandwich.jpg';
                      }}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200/80 shadow-xs uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.name}</h3>
                      <span className="text-sm font-bold text-slate-900 whitespace-nowrap">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Prep time: ~{item.prepTimeMinutes || 10} mins</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {inCart ? (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-7 h-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-5 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-7 h-7 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 pr-1.5">
                        ₹{item.price * inCart.quantity}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(item)}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
