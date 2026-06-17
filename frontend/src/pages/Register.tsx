import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, MapPin, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time password validations
  const [hasMinLen, setHasMinLen] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);

  const { t } = useTranslation();
  const loginStore = useAuthStore((state) => state.login);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setHasMinLen(password.length >= 8);
    setHasNumber(/\d/.test(password));
  }, [password]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError(t('auth.fillAllFields', 'Please fill in all required fields.'));
      return;
    }

    if (!hasMinLen || !hasNumber) {
      setError(t('auth.passReqFailed', 'Password must meet all strength requirements.'));
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/api/auth/register', {
        name,
        email,
        password,
        city: city.trim() || undefined,
      });

      if (res.data && res.data.token) {
        loginStore(res.data.user, res.data.token);
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.error || t('auth.registerFailed', 'Registration failed. Please check your inputs.');
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-secondary/10 blur-3xl"></div>

      <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <svg viewBox="0 0 100 100" className="h-16 w-16 mb-2 drop-shadow-[0_4px_8px_rgba(255,107,0,0.25)]">
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
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-wider">
            SANKALP
          </h2>
          <p className="text-brand-primary text-xs tracking-widest uppercase mt-1 mb-6 font-semibold">
            {t('common.tagline', 'Where every transformation begins')}
          </p>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {t('auth.registerTitle', 'Create Account')}
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            {t('auth.registerSubtitle', 'Start your discovery and workout tracking journey today')}
          </p>
        </div>

        {/* Error box */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-1.5">
                {t('auth.fullNameLabel', 'Full Name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-muted" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder', 'Rohan Sharma')}
                  className="glass-input w-full !pl-12"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-1.5">
                {t('auth.emailLabel', 'Email Address')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                  className="glass-input w-full !pl-12"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* City Field */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-brand-text mb-1.5">
                {t('auth.optionalCity', 'City (optional)')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-muted" />
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('auth.optionalCityPlaceholder', 'e.g. Mumbai')}
                  className="glass-input w-full !pl-12"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-text mb-1.5">
                {t('auth.passwordLabel', 'Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-brand-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full !pl-12 !pr-12"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-brand-muted hover:text-white transition-colors duration-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-3 space-y-1.5 pl-1">
                <p className="text-xs text-brand-muted font-medium">
                  {t('auth.passValidationTitle', 'Password Requirements:')}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  {hasMinLen ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-muted" />
                  )}
                  <span className={hasMinLen ? 'text-emerald-400' : 'text-brand-muted'}>
                    {t('auth.passReqMinChar', 'Minimum 8 characters')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {hasNumber ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-brand-muted" />
                  )}
                  <span className={hasNumber ? 'text-emerald-400' : 'text-brand-muted'}>
                    {t('auth.passReqNum', 'Contains at least one number')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !hasMinLen || !hasNumber}
              className="w-full btn-primary flex justify-center py-3 cursor-pointer"
            >
              {submitting ? t('auth.registering', 'Registering...') : t('auth.registerButton', 'Register')}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-brand-muted mt-6">
          {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:text-brand-secondary transition-colors duration-200">
            {t('auth.signInLink', 'Sign in')}
          </Link>
        </div>
      </div>
    </div>
  );
}
