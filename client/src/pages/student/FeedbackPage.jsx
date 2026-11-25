import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquare, CheckCircle, Send } from 'lucide-react';

const CATEGORIES = ['Food Quality', 'Service Speed', 'Cleanliness', 'Portion Size', 'Value for Money', 'Other'];

export const FeedbackPage = () => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState('5.0');
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Food Quality');
  const [itemReviewed, setItemReviewed] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || '5.0');
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
    fetch('/api/menu')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMenuItems(data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          category,
          itemReviewed: itemReviewed || 'General Canteen Service',
          orderNumber,
          comment
        })
      });

      if (res.ok) {
        setSuccessMsg('Your feedback has been submitted successfully.');
        setComment('');
        setItemReviewed('');
        setOrderNumber('');
        fetchFeedback();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Feedback</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit dish reviews and service ratings to help canteen management improve.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Feedback Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-slate-700" />
              Submit Feedback
            </h2>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-0.5 cursor-pointer hover:scale-105 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Food item (optional)
                </label>
                <select
                  value={itemReviewed}
                  onChange={(e) => setItemReviewed(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">-- Select a dish from menu (optional) --</option>
                  {menuItems.map((dish) => (
                    <option key={dish._id} value={dish.name}>
                      {dish.name} ({dish.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Order number (optional)
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. #SC1001"
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Comments & suggestions *
                </label>
                <textarea
                  required
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on food taste, packaging, or counter speed..."
                  className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-3 rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                {submitting ? 'Submitting...' : 'Post feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Reviews List & Average Score */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Average Rating
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
                <span className="text-xs text-slate-400">/ 5.0 score</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Reviews
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalReviews}</p>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                      {rev.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.userName}</h4>
                      <span className="text-[10px] text-slate-400">
                        {rev.itemReviewed} {rev.orderNumber ? `· ${rev.orderNumber}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <span className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-medium text-slate-600">
                    {rev.category}
                  </span>
                  <span>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
