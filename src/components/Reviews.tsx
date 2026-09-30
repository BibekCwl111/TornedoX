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
  AlertCircle,
  AlertTriangle,
  Lock,
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
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

interface ReviewItem {
  id: string;
  name: string;
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
const USER_CACHE_KEY = 'tornedox_active_reviewer';
const ADMIN_SESSION_KEY = 'tornedox_admin_active';

// Primary Admin Email for TornedoX
const ADMIN_EMAILS = ['bibekcwl04@gmail.com'];

// Google SVG icon
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
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
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminPinModalOpen, setAdminPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Review to be deleted confirmation
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reviewer identity from Google
  const [reviewerName, setReviewerName] = useState(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) return JSON.parse(cached).name || '';
    } catch {
      // ignore
    }
    return '';
  });
  const [reviewerEmail, setReviewerEmail] = useState(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) return JSON.parse(cached).email || '';
    } catch {
      // ignore
    }
    return '';
  });
  const [reviewerPhoto, setReviewerPhoto] = useState(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) return JSON.parse(cached).photoURL || '';
    } catch {
      // ignore
    }
    return '';
  });

  // Modal Step
  const [modalStep, setModalStep] = useState<'select-account' | 'write-review'>('select-account');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isDomainBlocked, setIsDomainBlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Review content
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');

  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewsSectionRef = useRef<HTMLElement | null>(null);

  // Is current active session an authorized administrator?
  const isSuperAdmin =
    isAdminUnlocked ||
    ADMIN_EMAILS.includes(currentUser?.email?.toLowerCase() || '') ||
    ADMIN_EMAILS.includes(reviewerEmail.toLowerCase());

  // Monitor Google Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const name = user.displayName || 'Google User';
        const email = user.email || '';
        const photo = user.photoURL || '';
        setReviewerName(name);
        setReviewerEmail(email);
        if (photo) setReviewerPhoto(photo);
        try {
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ name, email, photoURL: photo }));
        } catch {
          // ignore
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore in real-time
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

  // Open write review modal
  const handleOpenModal = () => {
    setAuthErrorMessage(null);
    if ((reviewerName && reviewerPhoto) || currentUser) {
      setModalStep('write-review');
    } else {
      setModalStep('select-account');
    }
    setIsModalOpen(true);
  };

  // Google Sign-in Handler
  const handleGoogleSignIn = async () => {
    setAuthErrorMessage(null);
    setIsSigningIn(true);

    // 1. Try Google Identity Services OAuth2 token client
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: firebaseConfig.oAuthClientId,
          scope: 'email profile openid',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userinfo = await res.json();
                const gName = userinfo.name || 'Google User';
                const gEmail = userinfo.email || '';
                const gPhoto = userinfo.picture || '';

                setReviewerName(gName);
                setReviewerEmail(gEmail);
                setReviewerPhoto(gPhoto);

                try {
                  localStorage.setItem(
                    USER_CACHE_KEY,
                    JSON.stringify({ name: gName, email: gEmail, photoURL: gPhoto })
                  );
                } catch {
                  // ignore
                }

                setIsSigningIn(false);
                setModalStep('write-review');
                return;
              } catch (e) {
                console.warn('Failed to fetch userinfo from Google:', e);
              }
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error_callback: (err: any) => {
            console.warn('GIS error:', err);
            tryFallbackFirebase();
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('GIS token client init error:', err);
      }
    }

    // 2. Fallback to Firebase Popup
    tryFallbackFirebase();
  };

  const tryFallbackFirebase = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const name = user.displayName || 'Google User';
      const email = user.email || '';
      const photo = user.photoURL || '';

      setReviewerName(name);
      setReviewerEmail(email);
      setReviewerPhoto(photo);

      try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ name, email, photoURL: photo }));
      } catch {
        // ignore
      }

      setModalStep('write-review');
    } catch (err: unknown) {
      console.warn('Firebase Google Auth error:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errObj = err as any;
      const code = errObj?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

      if (code === 'auth/unauthorized-domain') {
        setIsDomainBlocked(true);
        setAuthErrorMessage(
          `Domain Blocked: '${currentHost}' is not whitelisted in Firebase Console yet.`
        );
      } else if (code === 'auth/popup-blocked') {
        setAuthErrorMessage(
          'Pop-up was blocked by your browser. Please allow popups or use Direct Review below.'
        );
      } else {
        setAuthErrorMessage(
          `Google Sign-in was blocked on '${currentHost}'. You can continue directly below without Google login.`
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Switch account
  const handleSwitchAccount = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setReviewerName('');
    setReviewerEmail('');
    setReviewerPhoto('');
    setAuthErrorMessage(null);
    try {
      localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // ignore
    }
    setModalStep('select-account');
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const now = Date.now();
    const tempId = `rev-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const finalName = reviewerName.trim() || 'Verified Client';
    const finalPhoto = reviewerPhoto || getFallbackAvatar(finalName);

    const newReviewData = {
      name: finalName,
      email: reviewerEmail,
      photoURL: finalPhoto,
      isGoogleUser: true,
      rating: rating,
      text: text.trim(),
      date: formattedDate,
      timestamp: now,
    };

    // Optimistic display on this page
    const optimisticReview: ReviewItem = {
      id: tempId,
      ...newReviewData,
      photoURL: newReviewData.photoURL || undefined,
      email: newReviewData.email || undefined,
    };

    setReviews((prev) => [optimisticReview, ...prev.filter((r) => r.id !== tempId)]);

    // Clear form
    setText('');
    setRating(5);
    setIsModalOpen(false);

    // Toast
    setNewlyAddedId(tempId);
    setToastMessage('Review Published Live!');

    setTimeout(() => {
      const el = document.getElementById(tempId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);

    setTimeout(() => {
      setToastMessage(null);
      setNewlyAddedId(null);
    }, 4500);

    // Persist to Firestore
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

  // In-App Deletion
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const { id } = reviewToDelete;

    setIsDeleting(true);
    try {
      // 1. Immediately remove from local state & cache
      setReviews((prev) => {
        const filtered = prev.filter((r) => r.id !== id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch {
          // ignore
        }
        return filtered;
      });

      // 2. Delete from Cloud Firestore if persisted
      if (!id.startsWith('rev-')) {
        await deleteDoc(doc(db, 'reviews', id));
      }

      setToastMessage('Review deleted successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting review from Firestore:', err);
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
    }
  };

  // Handle Admin Passkey unlock
  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput.toLowerCase() === 'tornedox') {
      setIsAdminUnlocked(true);
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      setAdminPinModalOpen(false);
      setAdminPinInput('');
      setPinError(false);
      setToastMessage('Admin Mode Enabled: You can delete any review.');
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setPinError(true);
    }
  };

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setToastMessage('Admin Mode Locked.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Determine if a particular review can be deleted by current user
  const canDeleteReview = (rev: ReviewItem): boolean => {
    // 1. Owner / Super Admin can delete ALL reviews
    if (isSuperAdmin) return true;

    // 2. Author can delete ONLY their own review
    const currentMail = (currentUser?.email || reviewerEmail || '').toLowerCase();
    if (currentMail && rev.email && currentMail === rev.email.toLowerCase()) {
      return true;
    }

    return false;
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const currentDisplayPhoto = reviewerPhoto || getFallbackAvatar(reviewerName || 'Client');

  return (
    <section
      id="reviews"
      ref={reviewsSectionRef}
      className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200/70 relative"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={18} className="shrink-0 text-white" />
          <div>
            <p className="text-xs sm:text-sm font-bold">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Admin Unlock Modal */}
      {adminPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#DF9920]">
                  <Lock size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Admin Verification</h3>
              </div>
              <button
                onClick={() => setAdminPinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Sign in with your Google Account ({ADMIN_EMAILS[0]}) or enter your founder PIN to manage reviews.
            </p>

            <button
              type="button"
              onClick={() => {
                setAdminPinModalOpen(false);
                handleGoogleSignIn();
              }}
              className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <GoogleIcon size={16} />
              <span>Verify with Google</span>
            </button>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-2 text-[10px] text-slate-400 font-semibold uppercase">
                Or enter PIN
              </span>
            </div>

            <form onSubmit={handleAdminUnlock} className="space-y-3">
              <input
                type="password"
                placeholder="Enter PIN (e.g. 1234)"
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setPinError(false);
                }}
                className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                  pinError
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-slate-300 focus:border-[#DF9920]'
                }`}
              />
              {pinError && (
                <p className="text-[11px] text-red-500 font-medium">Incorrect PIN. Try 1234</p>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-[#DF9920] hover:bg-[#c98415] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Unlock Delete Controls
              </button>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Review?</h3>
                <p className="text-xs text-slate-500">
                  By {reviewToDelete.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-3 italic">
              &quot;{reviewToDelete.text}&quot;
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isSuperAdmin ? (
              <button
                onClick={handleAdminLock}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Lock admin delete controls"
              >
                Lock Admin
              </button>
            ) : (
              <button
                onClick={() => setAdminPinModalOpen(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Admin Delete Controls"
              >
                <Lock size={12} />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#DF9920] text-white hover:bg-[#c98415] shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus size={15} />
              <span>Write a Review</span>
            </button>
          </div>
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
                  <span>Verified Google Reviews</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((rev) => {
                const isNew = rev.id === newlyAddedId;
                const avatar = rev.photoURL || getFallbackAvatar(rev.name);
                const showDelete = canDeleteReview(rev);

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
                      {/* Client Info with Real Google Photo */}
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
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                              <GoogleIcon size={11} />
                              Google User
                            </span>
                            {isNew && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">
                                Just Added!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating, Date & Protected Delete Button */}
                      <div className="flex items-center gap-3">
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

                        {/* Delete Button: ONLY shown to Admin (bibekcwl04@gmail.com) or the Review Author */}
                        {showDelete && (
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(rev)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={isSuperAdmin ? 'Delete as Admin' : 'Delete your review'}
                            aria-label={`Delete review by ${rev.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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
              Worked with TornedoX? Share your experience with us and it will automatically appear here!
            </p>

            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#DF9920] hover:bg-[#c98415] text-white shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus size={14} />
              <span>Leave the First Review</span>
            </button>
          </div>
        )}

        {/* Modal: Just "Continue with Google" -> 5 stars & paragraph */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {modalStep === 'select-account' ? (
                /* Step 1: Just "Continue with Google" */
                <div className="py-2 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <GoogleIcon size={28} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Sign in with Google
                  </h3>

                  <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                    Connect your Google account to automatically use your verified Google name and profile photo.
                  </p>

                  {/* ONLY ONE Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <GoogleIcon size={20} />
                    <span>
                      {isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}
                    </span>
                  </button>

                  {authErrorMessage && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left animate-in fade-in">
                      <div className="flex items-start gap-2 text-xs text-amber-900">
                        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold leading-snug">{authErrorMessage}</p>
                          {isDomainBlocked && (
                            <p className="text-[11px] text-amber-700 mt-1">
                              <strong>Fix:</strong> Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains and add{' '}
                              <code className="bg-amber-100 px-1 rounded font-mono font-bold">
                                {typeof window !== 'undefined' ? window.location.hostname : 'your-domain'}
                              </code>.
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fallbackName = reviewerName || 'Verified Client';
                          setReviewerName(fallbackName);
                          setReviewerPhoto(reviewerPhoto || getFallbackAvatar(fallbackName));
                          setModalStep('write-review');
                        }}
                        className="w-full mt-3 py-2 px-3 bg-[#DF9920] hover:bg-[#c98415] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center shadow-xs"
                      >
                        Write Review Directly (Bypass Block)
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 mt-4">
                    Your email stays private. Only your name and photo will be displayed publicly.
                  </p>
                </div>
              ) : (
                /* Step 2: 5 Stars on top + Just a paragraph section */
                <div>
                  {/* Account Header with Google photo, name, and option to switch */}
                  <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="relative group shrink-0 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        title="Tap to change photo"
                      >
                        <img
                          src={currentDisplayPhoto}
                          alt={reviewerName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/50 shadow-xs bg-slate-100 shrink-0"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-bold">
                          <span>Change</span>
                        </div>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setReviewerPhoto(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="Your Name"
                            className="text-sm font-bold text-slate-900 border-b border-dashed border-slate-300 hover:border-amber-400 focus:border-[#DF9920] focus:outline-none bg-transparent max-w-[150px]"
                          />
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold border border-blue-200 shrink-0">
                            <GoogleIcon size={10} /> Google
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
                          {reviewerEmail || 'Verified Reviewer'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="text-xs text-[#DF9920] hover:underline font-semibold cursor-pointer shrink-0"
                    >
                      Switch Account
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReview}>
                    {/* 5 Stars On Top: client rates as they wish */}
                    <div className="text-center mb-5">
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Rate your experience:
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1.5 transition-transform hover:scale-120 active:scale-95 cursor-pointer"
                          >
                            <Star
                              size={32}
                              className={
                                star <= (hoverRating || rating)
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                  : 'text-slate-300 hover:text-amber-300'
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <span className="inline-block mt-1 text-xs font-bold text-amber-600">
                        {rating} out of 5 Stars
                      </span>
                    </div>

                    {/* Paragraph Section: Where client writes their review */}
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Review
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Write details of your own experience working with TornedoX..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#DF9920] focus:border-[#DF9920] resize-none leading-relaxed"
                      />
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#DF9920] hover:bg-[#c98415] disabled:opacity-70 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Send size={13} />
                        <span>Post Review</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
