import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Award, Sliders, Calendar } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function Homepage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch city suggestions from backend autocomplete
  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/api/gyms/cities?search=${encodeURIComponent(query)}`);
        if (res.data && res.data.cities) {
          setSuggestions(res.data.cities);
        }
      } catch (err) {
        console.error('Error fetching city autocomplete:', err);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/gyms/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectSuggestion = (city: string) => {
    setQuery(city);
    setSuggestions([]);
    setShowDropdown(false);
    navigate(`/gyms/${encodeURIComponent(city)}`);
  };

  return (
    <div className="flex flex-col min-height-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-32 max-w-5xl mx-auto">
        <div className="absolute top-0 -z-10 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl"></div>
        
        {/* Brand Lockup */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-tagline">
          <svg viewBox="0 0 100 100" className="h-20 w-20 mb-4 drop-shadow-[0_4px_12px_rgba(255,107,0,0.35)]">
            <rect width="100" height="100" rx="20" fill="#0A0A0A" />
            <g id="standing-hanuman">
              <path d="M45,54 C28,56 18,44 18,30 C18,14 34,8 43,12 C32,10 22,18 22,30 C22,40 30,49 45,49 Z" fill="#FF6B00" />
              <path d="M45,54 C41,64 38,74 38,85 L44,85 C46,75 48,65 50,54 Z" fill="#FF6B00" />
              <path d="M55,54 C59,64 62,74 62,85 L56,85 C54,75 52,65 50,54 Z" fill="#FF6B00" />
              <path d="M50,54 C54,64 56,75 56,85 L62,85 C62,74 59,64 55,54 Z" fill="#CC5500" />
              <path d="M43,53 L57,53 L55,62 L45,62 Z" fill="#FF6B00" />
              <path d="M50,53 L57,53 L55,62 L50,62 Z" fill="#CC5500" />
              <path d="M39,37 C39,37 50,39 61,37 C59,46 56,54 55,54 L45,54 C44,54 41,46 39,37 Z" fill="#FF6B00" />
              <path d="M50,38 C50,38 55.5,38.5 61,37 C59,46 56,54 55,54 L50,54 Z" fill="#CC5500" />
              <circle cx="50" cy="32" r="4.5" fill="#FF6B00" />
              <polygon points="47,28 50,22 53,28" fill="#FF6B00" />
              <polygon points="50,28 50,22 53,28" fill="#CC5500" />
              <path d="M39,35 C33,38 30,44 31,48 C32,51 37,51 38,47 C39,43 43,40 44,38 Z" fill="#FF6B00" />
              <path d="M61,35 C67,38 70,44 69,48 C68,50 64,48 62,44 C61,41 59,39 58,38 Z" fill="#FF6B00" />
              <path d="M65,37 C69,40 70,44 69,48 C68,50 66,49 64,45 Z" fill="#CC5500" />
              <g id="standing-gada">
                <rect x="61" y="10" width="3" height="32" rx="1" transform="rotate(22 62.5 26)" fill="#FF6B00" />
                <circle cx="72" cy="11" r="8" fill="#FF6B00" />
                <path d="M72,3 A8,8 0 0,1 72,19 Z" fill="#CC5500" />
                <polygon points="70,3 74,3 72,0" fill="#FF6B00" />
              </g>
            </g>
          </svg>
          <h2 className="text-4xl font-display font-extrabold text-white tracking-wider">SANKALP</h2>
          <span className="text-brand-primary text-xs sm:text-sm tracking-widest uppercase mt-2 font-semibold">
            {t('common.tagline', 'Where every transformation begins')}
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {t('homepage.heroTitleLine1', 'Find the Perfect Gym.')} <br />
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            {t('homepage.heroTitleLine2', 'Track Your Progress.')}
          </span>
        </h1>
        
        <p className="text-lg text-brand-muted max-w-2xl mb-12">
          {t('homepage.heroSubtitle', 'Discover local gyms by city, contact certified trainers, set target weight goals, and log your workouts using our interactive slider interface.')}
        </p>

        {/* City Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl z-20">
          <div className="flex flex-col sm:flex-row gap-3 w-full bg-brand-card/35 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-glass">
            <div className="relative flex-grow flex items-center">
              <MapPin className="absolute left-4 text-brand-primary h-5 w-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={t('homepage.searchGymsPlaceholder', 'Enter city (e.g. Mumbai, Delhi, Bangalore)...')}
                className="w-full bg-brand-dark/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-all duration-300 placeholder-brand-muted"
              />
              
              {/* Dropdown Suggestions */}
              {showDropdown && suggestions.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-brand-card border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5"
                >
                  {suggestions.map((city, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(city)}
                      className="w-full text-left px-5 py-3.5 text-white hover:bg-brand-primary/10 transition-colors duration-200 flex items-center gap-3"
                    >
                      <MapPin className="h-4 w-4 text-brand-muted" />
                      <span>{city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn-primary flex items-center justify-center gap-2 cursor-pointer font-bold py-3.5 sm:px-8"
            >
              <Search className="h-5 w-5" />
              {t('homepage.searchButton', 'Explore Gyms')}
            </button>
          </div>
        </form>
      </section>

      {/* Features Grid */}
      <section className="bg-brand-dark/40 border-t border-white/5 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('homepage.featuresTitle', 'Core Feature Modules')}
            </h2>
            <p className="text-brand-muted max-w-xl mx-auto">
              {t('homepage.featuresSubtitle', 'Everything you need to kickstart and maintain your fitness journey systematically.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-8 hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('homepage.featureGymsTitle', 'Gym Discovery')}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                {t('homepage.featureGymsDesc', 'Filter and sort local gyms by monthly fee, amenities, and user ratings. Unlock trainer contacts directly.')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('homepage.featureGoalsTitle', 'Goal Onboarding')}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                {t('homepage.featureGoalsDesc', 'Set height, target weights, activity levels, and track your BMI updates dynamically via a visual progress widget.')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-6">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('homepage.featureTrackTitle', 'Slider Logging')}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                {t('homepage.featureTrackDesc', 'Log exercises, sets, and reps quickly with touch-friendly sliders. Zero typing, finished in under 2 minutes.')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-8 hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('homepage.featureHistoryTitle', 'Workout History')}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                {t('homepage.featureHistoryDesc', 'Review your logs in a calendar view, check personal volume stats, and repeat previous sessions with a single click.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
