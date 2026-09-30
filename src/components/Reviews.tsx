import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  MessageSquarePlus,
  CheckCircle2,
  X,
  Send,
  Quote,
  Sparkles,
  Trash2,
  LogOut,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase.ts';

interface ReviewItem {
  id: string;
  name: string;
  role?: string;
  business?: string;
  photoURL?: string;
  email?: string;
  isGoogleUser?: boolean;
  rating: number;
  text: string;
  date: string;
  timestamp?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
}

const STORAGE_KEY = 'tornedox_client_reviews';

// Google multi-color SVG icon
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// Fallback avatar helper
const getFallbackAvatar = (name: string): string => {
  const seed = encodeURIComponent(name.trim() || 'Client');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=df9920,d97706,b45309`;
};

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [role, setRole] = useState('');
  const [business, setBusiness] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const reviewsSectionRef = useRef<HTMLElement | null>(null);

  // Monitor Google Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
        setPhotoURL(user.photoURL || '');
        setIsGoogleUser(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle 1-Click Google Sign In to retrieve real name & photo
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoURL(user.photoURL || '');
      setIsGoogleUser(true);
    } catch (err) {
      console.warn('Google Sign-In canceled or failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await signOut(auth);
      setName('');
      setEmail('');
      setPhotoURL('');
      setIsGoogleUser(false);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  // Helper to extract timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getReviewTime = (r: { timestamp?: number; createdAt?: any; date?: string }): number => {
    if (r.timestamp && typeof r.timestamp === 'number') return r.timestamp;
    if (r.createdAt) {
      if (typeof r.createdAt.toMillis === 'function') return r.createdAt.toMillis();
      if (typeof r.createdAt.seconds === 'number') return r.createdAt.seconds * 1000;
    }
    if (r.date) {
      const parsed = Date.parse(r.date);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  // Real-time Firestore sync: updates live on page across all users
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const reviewsCol = collection(db, 'reviews');

      unsubscribe = onSnapshot(
        reviewsCol,
        (snapshot) => {
          const remoteReviews: ReviewItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || 'Anonymous Client',
              role: data.role || undefined,
              business: data.business || undefined,
              photoURL: data.photoURL || undefined,
              email: data.email || undefined,
              isGoogleUser: Boolean(data.isGoogleUser),
              rating: typeof data.rating === 'number' ? data.rating : 5,
              text: data.text || '',
              date: data.date || 'Recently',
              timestamp: typeof data.timestamp === 'number' ? data.timestamp : undefined,
              createdAt: data.createdAt || null,
            };
          });

          setReviews((prev) => {
            const map = new Map<string, ReviewItem>();
            remoteReviews.forEach((r) => map.set(r.id, r));

            // Keep optimistic local review while sync settles
            prev.forEach((p) => {
              if (p.id.startsWith('rev-')) {
                const alreadySynced = remoteReviews.some(
                  (r) => r.name === p.name && r.text === p.text
                );
                if (!alreadySynced) {
                  map.set(p.id, p);
                }
              }
            });

            const combined = Array.from(map.values()).sort(
              (a, b) => getReviewTime(b) - getReviewTime(a)
            );

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
            } catch {
              // ignore
            }

            return combined;
          });
        },
        (error) => {
          console.warn('Firestore sync warning:', error.message);
        }
      );
    } catch (err) {
      console.warn('Could not initialize Firestore listener:', err);
    }

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const now = Date.now();
    const tempId = `rev-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const finalPhoto =
      photoURL.trim() ||
      (email.includes('@')
        ? `https://unavatar.io/${encodeURIComponent(email.trim().toLowerCase())}?fallback=${encodeURIComponent(getFallbackAvatar(name))}`
        : getFallbackAvatar(name));

    const newReviewData = {
      name: name.trim(),
      email: email.trim(),
      photoURL: finalPhoto,
      isGoogleUser: Boolean(isGoogleUser),
      role: role.trim() || '',
      business: business.trim() || '',
      rating: rating,
      text: text.trim(),
      date: formattedDate,
      timestamp: now,
    };

    // 1. Instantly display on this page with 0ms delay
    const optimisticReview: ReviewItem = {
      id: tempId,
      ...newReviewData,
      role: newReviewData.role || undefined,
      business: newReviewData.business || undefined,
      photoURL: newReviewData.photoURL || undefined,
      email: newReviewData.email || undefined,
    };

    setReviews((prev) => [optimisticReview, ...prev.filter((r) => r.id !== tempId)]);

    // Clear form inputs
    if (!currentUser) {
      setName('');
      setEmail('');
      setPhotoURL('');
      setIsGoogleUser(false);
    }
    setRole('');
    setBusiness('');
    setText('');
    setRating(5);
    setIsModalOpen(false);

    // Visual feedback
    setNewlyAddedId(tempId);
    setShowToast(true);

    setTimeout(() => {
      const el = document.getElementById(tempId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);

    setTimeout(() => {
      setShowToast(false);
      setNewlyAddedId(null);
    }, 4500);

    // 2. Persist to Cloud Database (Firestore)
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReviewData,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error saving review to Firestore:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to remove the review by "${clientName}"?`)) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (!id.startsWith('rev-')) {
        try {
          await deleteDoc(doc(db, 'reviews', id));
        } catch (err) {
          console.warn('Could not delete from Firestore:', err);
        }
      }
    }
  };

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
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={18} className="shrink-0 text-white" />
          <div>
            <p className="text-xs sm:text-sm font-bold">Review Published Live!</p>
            <p className="text-[11px] text-emerald-100">
              Visible automatically on this page for all visitors.
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
                Live Sync ({reviews.length})
              </span>
            </div>
            <p className="text-sm text-[#64748B]">
              Verified feedback and ratings from our valued clients and partners.
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

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Sparkles size={13} />
                  <span>Verified Reviews</span>
                </div>
              </div>
            </div>

            {/* Reviews List: Displays all reviews directly on the page */}
            <div className="space-y-3">
              {reviews.map((rev) => {
                const isNew = rev.id === newlyAddedId;
                const avatar = rev.photoURL || getFallbackAvatar(rev.name);

                return (
                  <div
                    key={rev.id}
                    id={rev.id}
                    className={`rounded-xl p-4 sm:p-5 transition-all duration-500 relative group ${
                      isNew
                        ? 'bg-amber-50/90 border-2 border-amber-400 shadow-md ring-4 ring-amber-300/30'
                        : 'bg-white border border-slate-200/80 shadow-xs hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      {/* Client Info with Real Google / Email Profile Photo */}
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={rev.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs ring-2 ring-amber-400/40 bg-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{rev.name}</h4>
                            {rev.isGoogleUser ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                                <GoogleIcon size={11} />
                                Google User
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Verified Client
                              </span>
                            )}
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

                    {/* Delete option */}
                    <button
                      onClick={() => handleDelete(rev.id, rev.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Remove review"
                      aria-label="Remove review"
                    >
                      <Trash2 size={13} />
                    </button>
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
              Worked with TornedoX? Share your experience with us and it will automatically appear here!
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

        {/* Modal for Writing a Review directly on the Page */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#DF9920] mb-1">
                  Write a Client Review
                </h3>
                <p className="text-xs text-slate-500">
                  Share your experience. Sign in with Google to use your verified Google name & photo!
                </p>
              </div>

              {/* Google Authentication Box */}
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {isGoogleUser && name ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt={name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                          <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {email || 'Google Account verified'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignOutGoogle}
                      className="text-[11px] text-slate-500 hover:text-red-500 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                      title="Switch account"
                    >
                      <LogOut size={12} />
                      <span>Switch</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700 mb-2">
                      Auto-fill your Google Name & Profile Photo:
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
                    >
                      <GoogleIcon size={18} />
                      <span>
                        {isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <form onSubmit={handleSubmit}>
                {/* Rating Selector */}
                <div className="mb-3.5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rating *
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <UserIcon size={12} className="text-slate-500" />
                    <span>Your Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bibek Barman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920]"
                  />
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail size={12} className="text-slate-500" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920]"
                  />
                </div>

                {/* Role & Business */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role (Optional)
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
                      Company (Optional)
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
                    placeholder="Share your experience working with TornedoX..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                    <span>Publish Review</span>
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
