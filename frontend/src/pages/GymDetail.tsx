import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, Dumbbell, Shield, Phone, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Trainer {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  fee: number;
  experience: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface GymDetailData {
  id: string;
  name: string;
  city: string;
  address: string;
  fee: number;
  rating: number;
  amenities: string[];
  trainers: Trainer[];
  reviews: Review[];
  loginRequiredForContact: boolean;
}

export default function GymDetail() {
  const { t } = useTranslation();
  const { gymId, city } = useParams<{ gymId: string; city: string }>();
  const { isAuthenticated } = useAuthStore();
  const [gym, setGym] = useState<GymDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Input States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();

  const fetchGymDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/gyms/${gymId}`);
      if (res.data && res.data.gym) {
        setGym(res.data.gym);
      }
    } catch (err: any) {
      console.error('Error fetching gym details:', err);
      setError('Failed to load gym details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gymId) {
      fetchGymDetail();
    }
  }, [gymId, isAuthenticated]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      setReviewError(t('gymDetail.commentRequired', 'Please write a comment for your review.'));
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/api/gyms/${gymId}/reviews`, {
        rating: newRating,
        comment: newComment,
      });

      if (res.data) {
        // Clear inputs
        setNewComment('');
        setNewRating(5);
        // Refresh detail view to pull newly created review and updated average rating
        fetchGymDetail();
      }
    } catch (err: any) {
      console.error('Submit review error:', err);
      const errMsg = err.response?.data?.error || 'Failed to submit review.';
      setReviewError(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-brand-dark">
        <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="glass-panel p-12 max-w-xl mx-auto border border-white/10">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-white mb-2">{t('gymDetail.errorLoad', 'Error Loading Gym')}</h2>
          <p className="text-brand-muted mb-6">{error || t('gymDetail.noDetails', 'Gym details could not be found.')}</p>
          <Link to={`/gyms/${city}`} className="btn-primary py-2 px-6">{t('gymDetail.backToList')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link to={`/gyms/${city}`} className="text-brand-muted hover:text-white transition-colors duration-200 text-sm font-semibold mb-6 inline-flex items-center gap-1">
        &larr; {t('gymDetail.backToList')}
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Amenities & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gym Header Card */}
          <div className="glass-panel border border-white/10 overflow-hidden">
            <div className="bg-brand-primary/10 h-56 flex items-center justify-center border-b border-white/5 relative">
              <Dumbbell className="h-20 w-20 text-brand-primary/20" />
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white mb-1.5">{gym.name}</h1>
                  <p className="text-brand-muted flex items-start gap-1">
                    <MapPin className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                    <span>{gym.address}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-dark/60 border border-white/5 px-3 py-1.5 rounded-lg text-white font-bold text-lg">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  {gym.rating || t('gymDetail.noRatings', 'No ratings')}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-brand-muted block uppercase tracking-wider">{t('gymDetail.fee')}</span>
                  <span className="text-2xl font-black text-white">₹{gym.fee}<span className="text-xs font-normal text-brand-muted">{t('gymDetail.perMonth', '/month')}</span></span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted block uppercase tracking-wider">{t('gymDetail.trainers')}</span>
                  <span className="text-lg font-bold text-white mt-1 block">{t('gymListing.trainersAvailable', '{{count}} Available', { count: gym.trainers.length })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Tag Panel */}
          <div className="glass-panel p-8 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-primary" />
              {t('gymDetail.amenities')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['AC', 'Pool', 'Parking', 'Sauna'].map((amenity) => {
                const hasAmenity = gym.amenities.includes(amenity);
                return (
                  <div 
                    key={amenity} 
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                      hasAmenity 
                        ? 'border-brand-primary/20 bg-brand-primary/5 text-white' 
                        : 'border-white/5 bg-brand-dark/20 text-brand-muted/50'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                      hasAmenity ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/5 text-brand-muted/30'
                    }`}>
                      ✓
                    </div>
                    <span className="font-semibold text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Area */}
          <div className="glass-panel p-8 border border-white/10 space-y-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-primary" />
              {t('gymDetail.reviews')} ({gym.reviews.length})
            </h2>

            {/* Leave a review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-brand-dark/30 border border-white/5 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('gymDetail.addReviewTitle')}</h3>
              
              {reviewError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Star selector */}
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">{t('gymDetail.ratingLabel')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewRating(val)}
                      className="focus:outline-none transition-transform duration-100 active:scale-95"
                    >
                      <Star className={`h-6 w-6 ${
                        val <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-brand-muted/50'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label htmlFor="comment" className="block text-xs font-semibold text-brand-muted mb-1.5">{t('gymDetail.commentLabel', 'Comment')}</label>
                <textarea
                  id="comment"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isAuthenticated ? t('gymDetail.commentPlaceholder', 'Write about your experience at this gym...') : t('gymDetail.loginRequiredPlaceholder', 'Please log in to submit a review')}
                  className="glass-input w-full text-sm placeholder-brand-muted"
                  disabled={submittingReview || !isAuthenticated}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                {isAuthenticated ? (
                  <button type="submit" disabled={submittingReview} className="btn-primary py-2 px-5 text-sm">
                    {submittingReview ? t('gymDetail.submittingReview') : t('gymDetail.submitReview')}
                  </button>
                ) : (
                  <Link to="/login" className="btn-primary py-2 px-5 text-sm text-center">
                    {t('gymDetail.loginToReview', 'Login to Review')}
                  </Link>
                )}
              </div>
            </form>

            {/* List */}
            {gym.reviews.length === 0 ? (
              <p className="text-center text-brand-muted text-sm py-6">{t('gymDetail.noReviews')}</p>
            ) : (
              <div className="divide-y divide-white/5 space-y-6">
                {gym.reviews.map((review) => (
                  <div key={review.id} className="pt-6 first:pt-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-white text-sm">{review.user.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                        <Star className="h-3 w-3 fill-yellow-400" />
                        {review.rating}
                      </div>
                    </div>
                    <p className="text-sm text-brand-muted leading-relaxed mb-2">{review.comment}</p>
                    <span className="text-[11px] text-brand-muted/70 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: certified trainers list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Dumbbell className="h-5 w-5 text-brand-primary" />
              {t('gymDetail.trainers')}
            </h2>

            {gym.trainers.length === 0 ? (
              <p className="text-brand-muted text-sm text-center py-6">{t('gymDetail.noTrainers', 'No certified trainers registered with this gym.')}</p>
            ) : (
              <div className="space-y-4">
                {gym.trainers.map((trainer) => (
                  <div key={trainer.id} className="bg-brand-dark/30 border border-white/5 rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-white text-base">{trainer.name}</h3>
                    
                    <div className="space-y-1.5 text-xs text-brand-muted">
                      <p><span className="text-white font-medium">{t('gymDetail.specializationLabel', 'Specialization:')}</span> {trainer.specialization}</p>
                      <p><span className="text-white font-medium">{t('gymDetail.experienceLabel', 'Experience:')}</span> {t('gymDetail.experience', { years: trainer.experience })}</p>
                      <p><span className="text-white font-medium">{t('gymDetail.sessionFee', 'Session Fee:')}</span> {t('gymDetail.trainerFee', { fee: trainer.fee })}</p>
                    </div>

                    {/* Phone masking lookup */}
                    <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-brand-primary shrink-0" />
                      {gym.loginRequiredForContact ? (
                        <Link to="/login" className="text-xs font-semibold text-brand-primary hover:text-brand-secondary underline transition-all">
                          {t('gymDetail.phoneMasked')}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-white select-all">{trainer.phone}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
