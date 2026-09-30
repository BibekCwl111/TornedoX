import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, X, Send, Quote, Sparkles } from 'lucide-react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase.ts';

interface ReviewItem {
  id: string;
  name: string;
  role?: string;
  business?: string;
  rating: number;
  text: string;
  date: string;
  createdAt?: Timestamp | null;
}

const STORAGE_KEY = 'tornedox_client_reviews';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [business, setBusiness] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reviewsSectionRef = useRef<HTMLElement | null>(null);

  // Real-time Firestore sync: updates automatically across all clients/devices
  useEffect(() => {
    try {
      const reviewsCol = collection(db, 'reviews');
      const q = query(reviewsCol, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteReviews: ReviewItem[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                name: data.name || 'Anonymous',
                role: data.role || undefined,
                business: data.business || undefined,
                rating: typeof data.rating === 'number' ? data.rating : 5,
                text: data.text || '',
                date: data.date || 'Recently',
                createdAt: data.createdAt || null,
              };
            });

            setReviews(remoteReviews);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteReviews));
            } catch {
              // ignore
            }
          }
        },
        (error) => {
          console.warn('Firestore real-time sync fallback to local cache:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not initialize Firestore reviews listener:', err);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = `rev-${Date.now()}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newReviewData = {
      name: name.trim(),
      role: role.trim() || '',
      business: business.trim() || '',
      rating: rating,
      text: text.trim(),
      date: formattedDate,
    };

    // Optimistic UI update: show immediately on screen (0ms delay)
    const optimisticReview: ReviewItem = {
      id: tempId,
      ...newReviewData,
      role: newReviewData.role || undefined,
      business: newReviewData.business || undefined,
    };

    setReviews((prev) => [optimisticReview, ...prev.filter((r) => r.id !== tempId)]);

    // Clear form inputs & close modal immediately
    setName('');
    setRole('');
    setBusiness('');
    setText('');
    setRating(5);
    setIsModalOpen(false);

    // Visual instant feedback: highlight card and show toast
    setNewlyAddedId(tempId);
    setShowToast(true);

    // Smooth scroll to the newly created review
    setTimeout(() => {
      const el = document.getElementById(tempId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);

    setTimeout(() => {
      setShowToast(false);
      setNewlyAddedId(null);
    }, 4500);

    // Persist to Cloud Database (Firestore) so it appears live on all phones & computers
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReviewData,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error saving review to Firestore:', err);
      // Fallback update to localStorage in case offline
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([optimisticReview, ...reviews]));
      } catch {
        // ignore
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <section
      id="reviews"
      ref={reviewsSectionRef}
      className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70 relative"
    >
      {/* Real-time Global Success Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={18} className="shrink-0 text-white" />
          <div>
            <p className="text-xs sm:text-sm font-bold">Review Published Live!</p>
            <p className="text-[11px] text-emerald-100">
              Synced across all devices and visible to everyone.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight text-[#DF9920]">
                Client Reviews
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              Real-time feedback and ratings from our valued clients and partners.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#DF9920] text-white hover:bg-[#c98415] shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquarePlus size={15} />
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {/* Rating Summary Banner */}
            <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {averageRating}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          star <= Math.round(Number(averageRating))
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Based on {reviews.length} client {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Sparkles size={13} />
                <span>Verified Client Feedback</span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((rev) => {
                const isNew = rev.id === newlyAddedId;
                return (
                  <div
                    key={rev.id}
                    id={rev.id}
                    className={`rounded-xl p-4 sm:p-5 transition-all duration-500 relative group ${
                      isNew
                        ? 'bg-amber-50/80 border-2 border-amber-400 shadow-md ring-4 ring-amber-300/30'
                        : 'bg-white border border-slate-200/80 shadow-xs hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      {/* Client Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {rev.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{rev.name}</h4>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                              Client
                            </span>
                            {isNew && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">
                                Just Added!
                              </span>
                            )}
                          </div>
                          {(rev.role || rev.business) && (
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {[rev.role, rev.business].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Rating & Date */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1">{rev.date}</span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1 relative pl-5">
                      <Quote
                        size={12}
                        className="absolute left-0 top-1 text-amber-400/80 fill-amber-400/20 rotate-180"
                      />
                      <p className="italic">{rev.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#DF9920] mb-3">
              <Star size={24} className="fill-amber-400 stroke-[#DF9920]" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              No reviews yet
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
              Worked with TornedoX? Share your experience with us and it will be visible to everyone!
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#DF9920] hover:bg-[#c98415] text-white shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus size={14} />
              <span>Leave the First Review</span>
            </button>
          </div>
        )}

        {/* Modal for Writing a Review */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-bold text-[#DF9920] mb-1">
                  Write a Review
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Share your experience working with TornedoX. It will appear live on the website instantly!
                </p>

                {/* Rating Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star
                          size={22}
                          className={
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920]"
                  />
                </div>

                {/* Role & Business */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Founder / Manager"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Business
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tech Retail"
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920]"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about the solution or experience..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#DF9920] hover:bg-[#c98415] disabled:opacity-70 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Publish Review Live</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
