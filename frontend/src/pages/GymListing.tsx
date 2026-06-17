import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, SlidersHorizontal, Star, Dumbbell, ArrowUpDown, ShieldAlert } from 'lucide-react';
import api from '../services/api';

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string;
  fee: number;
  rating: number;
  amenities: string[];
  trainerCount: number;
}

export default function GymListing() {
  const { t } = useTranslation();
  const { city } = useParams<{ city: string }>();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [maxFee, setMaxFee] = useState<number>(5000);
  const [minRating, setMinRating] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [hasTrainers, setHasTrainers] = useState<string>('all'); // 'all' | 'true' | 'false'

  // Sort States
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Fetch gyms whenever filters or sort parameters change
  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (city) queryParams.append('city', city);
        queryParams.append('maxFee', maxFee.toString());
        if (minRating) queryParams.append('minRating', minRating);
        if (selectedAmenities.length > 0) queryParams.append('amenities', selectedAmenities.join(','));
        if (hasTrainers !== 'all') queryParams.append('hasTrainers', hasTrainers);
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);

        const res = await api.get(`/api/gyms?${queryParams.toString()}`);
        if (res.data && res.data.gyms) {
          setGyms(res.data.gyms);
        }
      } catch (err) {
        console.error('Error fetching gyms:', err);
        setError('Failed to fetch gyms list. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, [city, maxFee, minRating, selectedAmenities, hasTrainers, sortBy, sortOrder]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'fee-asc') {
      setSortBy('fee');
      setSortOrder('asc');
    } else if (val === 'fee-desc') {
      setSortBy('fee');
      setSortOrder('desc');
    } else if (val === 'rating-desc') {
      setSortBy('rating');
      setSortOrder('desc');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-brand-primary text-sm font-semibold tracking-wide uppercase">{t('gymListing.discovery', 'Gym Discovery')}</span>
          <h1 className="text-3xl font-extrabold text-white">{t('gymListing.title', { city })}</h1>
        </div>
        
        {/* Sort drop-down */}
        <div className="flex items-center gap-2 bg-brand-card/40 border border-white/10 px-3 py-2 rounded-lg">
          <ArrowUpDown className="h-4 w-4 text-brand-muted" />
          <select 
            onChange={handleSortChange} 
            value={`${sortBy}-${sortOrder}`}
            className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="rating-desc" className="bg-brand-card">{t('gymListing.sortByRating', 'Sort by: Rating (High to Low)')}</option>
            <option value="fee-asc" className="bg-brand-card">{t('gymListing.sortByPriceLow', 'Sort by: Price (Low to High)')}</option>
            <option value="fee-desc" className="bg-brand-card">{t('gymListing.sortByPriceHigh', 'Sort by: Price (High to Low)')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 glass-panel p-6 border border-white/10 self-start">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
            <SlidersHorizontal className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-bold text-white">{t('gymListing.filtersTitle', 'Filters')}</h2>
          </div>

          <div className="space-y-6">
            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-brand-text">{t('gymListing.feeRange')}</label>
                <span className="text-brand-primary text-sm font-bold">₹{maxFee}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxFee}
                onChange={(e) => setMaxFee(parseInt(e.target.value))}
                className="w-full h-1.5 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-xs text-brand-muted mt-1">
                <span>₹500</span>
                <span>₹5000</span>
              </div>
            </div>

            {/* Ratings Radio */}
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2.5">{t('gymListing.ratingFilter')}</label>
              <div className="space-y-2">
                {[
                  { label: t('gymListing.anyRating', 'Any Rating'), value: '' },
                  { label: t('gymListing.ratingAbove', '3.0 ★ & above', { rating: '3.0' }), value: '3' },
                  { label: t('gymListing.ratingAbove', '4.0 ★ & above', { rating: '4.0' }), value: '4' },
                  { label: t('gymListing.ratingAbove', '4.5 ★ & above', { rating: '4.5' }), value: '4.5' },
                ].map((item) => (
                  <label key={item.value} className="flex items-center text-sm text-brand-muted cursor-pointer hover:text-white">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === item.value}
                      onChange={() => setMinRating(item.value)}
                      className="h-4 w-4 border-white/10 bg-brand-dark/50 text-brand-primary focus:ring-brand-primary cursor-pointer mr-2.5"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities Checkbox */}
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2.5">{t('gymListing.amenitiesFilter')}</label>
              <div className="space-y-2">
                {['AC', 'Pool', 'Parking', 'Sauna'].map((amenity) => (
                  <label key={amenity} className="flex items-center text-sm text-brand-muted cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="h-4 w-4 rounded border-white/10 bg-brand-dark/50 text-brand-primary focus:ring-brand-primary cursor-pointer mr-2.5"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            {/* Trainer Option */}
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2.5">{t('gymListing.hasTrainers')}</label>
              <div className="space-y-2">
                {[
                  { label: t('gymListing.allGyms', 'All Gyms'), value: 'all' },
                  { label: t('gymListing.hasTrainersAvailable', 'Has Trainers Available'), value: 'true' },
                  { label: t('gymListing.noTrainersRequired', 'No Trainers Required'), value: 'false' },
                ].map((item) => (
                  <label key={item.value} className="flex items-center text-sm text-brand-muted cursor-pointer hover:text-white">
                    <input
                      type="radio"
                      name="trainers"
                      checked={hasTrainers === item.value}
                      onChange={() => setHasTrainers(item.value)}
                      className="h-4 w-4 border-white/10 bg-brand-dark/50 text-brand-primary focus:ring-brand-primary cursor-pointer mr-2.5"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mb-6">
              <ShieldAlert className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
              <p className="text-brand-muted text-sm font-medium">{t('gymListing.searching', 'Searching matching fitness centers...')}</p>
            </div>
          ) : gyms.length === 0 ? (
            <div className="glass-panel p-16 text-center border border-white/10">
              <Dumbbell className="h-12 w-12 text-brand-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t('gymListing.noGyms').split('.')[0]}</h3>
              <p className="text-brand-muted text-sm max-w-sm mx-auto">
                {t('gymListing.noGyms')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gyms.map((gym) => (
                <div key={gym.id} className="glass-panel border border-white/10 overflow-hidden hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between">
                  {/* Thumbnail / Header */}
                  <div className="bg-brand-primary/10 h-36 flex items-center justify-center border-b border-white/5 relative">
                    <Dumbbell className="h-12 w-12 text-brand-primary/30" />
                    <span className="absolute bottom-3 right-3 text-xs bg-brand-dark/85 px-2.5 py-1 rounded-md text-white font-semibold flex items-center gap-1 border border-white/5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {gym.rating || t('gymListing.na', 'N/A')}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between gap-5">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1.5">{gym.name}</h3>
                      <p className="text-sm text-brand-muted flex items-start gap-1 mb-4">
                        <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{gym.address}</span>
                      </p>

                      {/* Amenities Tag row */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {gym.amenities.map((a) => (
                          <span key={a} className="text-xs bg-white/5 text-brand-muted px-2 py-0.5 rounded border border-white/5 font-medium">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-brand-muted block">{t('gymListing.startingAt', 'Starting at')}</span>
                        <span className="text-sm font-bold text-white">{t('gymListing.startingFee', { fee: gym.fee })}</span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-brand-muted block">{t('gymListing.trainersLabel', 'Trainers')}</span>
                        <span className="text-sm font-semibold text-white">{gym.trainerCount > 0 ? t('gymListing.trainersAvailable', '{{count}} Available', { count: gym.trainerCount }) : t('gymListing.noTrainers', 'None')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    <Link to={`/gyms/${city}/${gym.id}`} className="w-full btn-secondary py-2 text-sm text-center block font-semibold border border-white/10 hover:border-brand-primary/40">
                      {t('gymListing.viewDetails')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
