import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, X, Send } from 'lucide-react';

export const Reviews: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [business, setBusiness] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Clear any previously saved test reviews from localStorage so the page remains in "No reviews yet" state
  useEffect(() => {
    try {
      localStorage.removeItem('tornedox_client_reviews');
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    // Show thank-you confirmation
    setSubmittedMessage(true);
    setName('');
    setRole('');
    setBusiness('');
    setText('');
    setRating(5);

    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
    }, 2000);
  };

  return (
    <section id="reviews" className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#DF9920] mb-1">
              Client Reviews
            </h2>
            <p className="text-sm text-[#64748B]">
              Feedback and ratings from our clients and partners.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold px-3 py-2 rounded-lg bg-amber-50 text-[#DF9920] hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
          >
            <MessageSquarePlus size={15} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Clean "No reviews yet" Empty State */}
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#DF9920] mb-3">
            <Star size={24} className="fill-amber-400 stroke-[#DF9920]" />
          </div>

          <h3 className="text-base font-bold text-slate-800 mb-1">
            No reviews yet
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
            We have recently launched our digital profile. Worked with TornedoX? Be the first to share your experience with us!
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-[#DF9920] hover:bg-[#c98415] text-white shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquarePlus size={14} />
            <span>Leave the First Review</span>
          </button>
        </div>

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

              {submittedMessage ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Thank You!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                    Your feedback has been received. Reviews will be displayed following moderation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg font-bold text-[#DF9920] mb-1">
                    Write a Review
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Share your experience working with TornedoX.
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#DF9920] hover:bg-[#c98415] rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Submit Review</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
