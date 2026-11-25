import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';

export const CanteenReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState('5.0');
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/feedback');
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setAvgRating(data.avgRating || '5.0');
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Reviews & Ratings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Student and faculty feedback submitted on fulfilled meal pre-orders.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Average Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-bold text-slate-900">{avgRating}</span>
              <span className="text-xs text-slate-400">/ 5.0 rating</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Reviews Received
            </span>
            <div className="text-3xl font-bold text-slate-900 mt-0.5">{totalReviews}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                  {rev.userName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{rev.userName}</h3>
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

            <p className="text-xs text-slate-700 leading-relaxed">
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
  );
};
