import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Trash2,
  Plus,
  Minus,
  Clock,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

const SLOTS = [
  '12:00–12:15 PM',
  '12:15–12:30 PM',
  '12:30–12:45 PM',
  '12:45–01:00 PM',
  '01:00–01:15 PM',
  '01:15–01:30 PM'
];

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, selectedSlot, setSelectedSlot } = useCart();
  const { user, token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [slotAvailability, setSlotAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch real-time slot capacities
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders/slots/availability');
        if (res.ok) {
          const data = await res.json();
          setSlotAvailability(data);
        }
      } catch (err) {
        console.error('Failed to fetch slot availability:', err);
      }
    };
    fetchSlots();
    const interval = setInterval(fetchSlots, 10000);
    return () => clearInterval(interval);
  }, []);

  // NPCI Standard UPI Intent Deep Link URI
  const canteenVPA = 'campusbites@upi';
  const merchantName = 'Campus Bites Canteen';
  const transactionNote = encodeURIComponent(`Order for ${user?.name || 'Student'}`);
  const upiIntentUri = `upi://pay?pa=${canteenVPA}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=${transactionNote}`;

  const triggerUpiApp = () => {
    window.location.href = upiIntentUri;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || ''
        })),
        pickupSlot: selectedSlot,
        paymentMethod
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');

      clearCart();
      navigate('/student/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-slate-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Your pre-order cart is empty</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Add meals from today's menu to place an order with your preferred pickup time slot.
        </p>
        <Link
          to="/student/menu"
          className="inline-flex items-center gap-1.5 mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Checkout & Pre-Order</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your items, select a pickup slot, and complete payment.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items in Cart & Slot Selection */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Order Items ({cart.length})
              </h2>
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Item Photo Thumbnail */}
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                      <span className="text-[11px] text-slate-500">₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md p-1">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-900 w-16 text-right">
                      ₹{item.price * item.quantity}
                    </span>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Slot Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Pickup Slot
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-3.5">
              Choose your allocated 15-minute window for food collection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(slotAvailability.length > 0 ? slotAvailability : SLOTS.map(s => ({ slot: s, remaining: 10, isFull: false }))).map((sObj) => {
                const slot = sObj.slot;
                const isFull = sObj.isFull;
                const remaining = sObj.remaining !== undefined ? sObj.remaining : 10;
                const isSelected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition text-left flex flex-col justify-between gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      isFull
                        ? 'border-slate-200 bg-slate-50 text-slate-400'
                        : isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold">{slot}</span>
                    <span className={`text-[10px] ${
                      isSelected
                        ? 'text-slate-300'
                        : isFull
                        ? 'text-rose-600 font-semibold'
                        : remaining <= 3
                        ? 'text-amber-600 font-semibold'
                        : 'text-slate-500'
                    }`}>
                      {isFull ? 'Slot full (10/10)' : remaining <= 3 ? `Only ${remaining} left` : `${remaining} spots open`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Payment Method & Dynamic UPI QR */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Payment Details</span>
              <span className="text-[11px] text-slate-500 font-normal flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NPCI UPI
              </span>
            </h2>

            {/* Account Info */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Account Holder:</span>
                <strong className="text-slate-900">{user?.name}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Campus ID:</span>
                <strong className="text-slate-900">{user?.campusId || 'N/A'}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Pickup Window:</span>
                <strong className="text-slate-900">{selectedSlot}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Payment mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 rounded-md text-xs font-medium border transition text-center cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  UPI QR & Apps
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Pay at pickup')}
                  className={`py-2 px-3 rounded-md text-xs font-medium border transition text-center cursor-pointer ${
                    paymentMethod === 'Pay at pickup'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Pay at Pickup
                </button>
              </div>
            </div>

            {/* Dynamic UPI Section */}
            {paymentMethod === 'UPI' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="text-center">
                  <div className="inline-block bg-white p-2.5 rounded-lg border border-slate-200">
                    <QRCodeSVG
                      value={upiIntentUri}
                      size={140}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-[11px] text-slate-500 block">
                      Scan with any UPI application
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-800">
                      VPA: {canteenVPA}
                    </span>
                  </div>
                </div>

                {/* Direct App Launch Links (For Mobile / Tablet) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
                    Direct app triggers
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={triggerUpiApp}
                      className="bg-white hover:bg-slate-100 text-slate-800 font-medium py-1.5 px-1 rounded-md border border-slate-200 text-center transition cursor-pointer"
                    >
                      <span className="text-[11px]">Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerUpiApp}
                      className="bg-white hover:bg-slate-100 text-slate-800 font-medium py-1.5 px-1 rounded-md border border-slate-200 text-center transition cursor-pointer"
                    >
                      <span className="text-[11px]">PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerUpiApp}
                      className="bg-white hover:bg-slate-100 text-slate-800 font-medium py-1.5 px-1 rounded-md border border-slate-200 text-center transition cursor-pointer"
                    >
                      <span className="text-[11px]">Paytm</span>
                    </button>
                  </div>
                </div>

                {/* Optional UTR / Reference Input */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      12-digit UPI Ref / UTR
                    </label>
                    <button
                      type="button"
                      onClick={() => setUpiRefNumber('UPI-' + Math.floor(100000000000 + Math.random() * 900000000000))}
                      className="text-[10px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Auto-fill demo UTR
                    </button>
                  </div>
                  <input
                    type="text"
                    value={upiRefNumber}
                    onChange={(e) => setUpiRefNumber(e.target.value)}
                    placeholder="432189012345"
                    className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Total Payable */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total payable:</span>
              <span className="text-xl font-bold text-slate-900">₹{totalAmount}</span>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
            >
              {loading ? (
                'Processing order...'
              ) : paymentMethod === 'UPI' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm and place order
                </>
              ) : (
                <>
                  Place order (Pay at pickup)
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
