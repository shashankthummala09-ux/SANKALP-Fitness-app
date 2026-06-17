import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Ruler, Scale, Flame, Target, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [primaryGoal, setPrimaryGoal] = useState('Lose Weight');
  const [targetDate, setTargetDate] = useState('');
  const [sankalpText, setSankalpText] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const w = parseFloat(currentWeight);
    const gw = parseFloat(goalWeight);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 0) {
      setError(t('onboarding.invalidCurrentWeight', 'Please enter a valid positive current weight.'));
      return;
    }
    if (isNaN(gw) || gw <= 0) {
      setError(t('onboarding.invalidTargetWeight', 'Please enter a valid positive target weight.'));
      return;
    }
    if (isNaN(h) || h <= 0) {
      setError(t('onboarding.invalidHeight', 'Please enter a valid positive height.'));
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (sankalpText.trim() && sankalpText.length > 150) {
      setError(t('onboarding.sankalpTooLong', 'Sankalp vow text cannot exceed 150 characters.'));
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/goals/onboarding', {
        currentWeight: parseFloat(currentWeight),
        goalWeight: parseFloat(goalWeight),
        height: parseFloat(height),
        activityLevel,
        primaryGoal,
        targetDate: targetDate || undefined,
        sankalpText: sankalpText.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding submit error:', err);
      const errMsg = err.response?.data?.error || t('onboarding.saveFailed', 'Failed to save onboarding goals.');
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-secondary/10 blur-3xl"></div>

      <div className="w-full max-w-2xl glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <Award className="h-7 w-7 animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {step === 1 
              ? t('onboarding.title', 'Setup Fitness Goals')
              : t('onboarding.sankalpTitle', 'Write Your Sankalp')
            }
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            {step === 1
              ? t('onboarding.subtitle', "Let's customize your profile stats to unlock metrics tracking and dashboards")
              : t('onboarding.sankalpSubtitle', 'Sankalp is your sacred commitment. Set a powerful vow/resolution to guide your daily training.')
            }
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Height Field */}
              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                  <Ruler className="h-4 w-4 text-brand-primary" />
                  {t('onboarding.height', 'Height (cm)')}
                </label>
                <input
                  id="height"
                  type="number"
                  step="0.1"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="glass-input w-full"
                  disabled={submitting}
                />
              </div>

              {/* Current Weight Field */}
              <div>
                <label htmlFor="currentWeight" className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                  <Scale className="h-4 w-4 text-brand-primary" />
                  {t('onboarding.currentWeight', 'Current Weight (kg)')}
                </label>
                <input
                  id="currentWeight"
                  type="number"
                  step="0.1"
                  required
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="e.g. 82.5"
                  className="glass-input w-full"
                  disabled={submitting}
                />
              </div>

              {/* Goal Weight Field */}
              <div>
                <label htmlFor="goalWeight" className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                  <Scale className="h-4 w-4 text-brand-primary" />
                  {t('onboarding.targetWeight', 'Goal Weight (kg)')}
                </label>
                <input
                  id="goalWeight"
                  type="number"
                  step="0.1"
                  required
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder="e.g. 75"
                  className="glass-input w-full"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Activity Level Selector */}
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                  <Flame className="h-4 w-4 text-brand-primary" />
                  {t('onboarding.activityLevel', 'Activity Level')}
                </label>
                <select
                  id="activityLevel"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="glass-input w-full cursor-pointer bg-brand-dark text-white"
                  disabled={submitting}
                >
                  <option value="Sedentary">{t('onboarding.sedentary', 'Sedentary (Little to no exercise)')}</option>
                  <option value="Lightly Active">{t('onboarding.lightlyActive', 'Lightly Active (Light exercise 1-3 days/wk)')}</option>
                  <option value="Moderately Active">{t('onboarding.moderatelyActive', 'Moderately Active (Moderate exercise 3-5 days/wk)')}</option>
                  <option value="Very Active">{t('onboarding.veryActive', 'Very Active (Hard exercise 6-7 days/wk)')}</option>
                </select>
              </div>

              {/* Primary Goal Selector */}
              <div>
                <label htmlFor="primaryGoal" className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                  <Target className="h-4 w-4 text-brand-primary" />
                  {t('onboarding.primaryGoal', 'Primary Fitness Goal')}
                </label>
                <select
                  id="primaryGoal"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="glass-input w-full cursor-pointer bg-brand-dark text-white"
                  disabled={submitting}
                >
                  <option value="Lose Weight">{t('onboarding.loseWeight', 'Lose Weight')}</option>
                  <option value="Gain Muscle">{t('onboarding.gainMuscle', 'Gain Muscle')}</option>
                  <option value="Improve Endurance">{t('onboarding.improveEndurance', 'Improve Endurance')}</option>
                  <option value="Stay Fit">{t('onboarding.stayFit', 'Stay Fit / General Conditioning')}</option>
                </select>
              </div>
            </div>

            {/* Optional Target Date */}
            <div>
              <label htmlFor="targetDate" className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-brand-primary" />
                {t('onboarding.targetDate', 'Target Date')} <span className="text-brand-muted text-xs">({t('common.optional', 'optional')})</span>
              </label>
              <input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="glass-input w-full cursor-pointer"
                disabled={submitting}
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-between gap-4">
              <button
                type="submit"
                className="w-full btn-primary py-3 font-bold text-white text-base tracking-wide cursor-pointer"
              >
                {t('common.continue', 'Continue')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="sankalpText" className="block text-sm font-semibold text-brand-text flex items-center justify-between">
                <span>{t('onboarding.sankalpLabel', 'Your Personal Sankalp / Resolution')}</span>
                <span className={`text-xs ${sankalpText.length > 150 ? 'text-red-400 font-bold' : 'text-brand-muted'}`}>
                  {sankalpText.length} / 150
                </span>
              </label>
              <textarea
                id="sankalpText"
                rows={4}
                maxLength={150}
                required
                value={sankalpText}
                onChange={(e) => setSankalpText(e.target.value)}
                placeholder={t('onboarding.sankalpPlaceholder', 'e.g. My sankalp is to run 5K without stopping by Diwali')}
                className="glass-input w-full resize-none font-medium text-brand-text placeholder-brand-muted"
                disabled={submitting}
              />
              <p className="text-xs text-brand-muted leading-relaxed">
                {t('onboarding.sankalpHelp', 'Examples: "My sankalp is to deadlift 100kg by Diwali", "To practice yoga every morning at 6 AM", "Commit to drinking 3L water daily".')}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 btn-secondary py-3 font-bold text-base cursor-pointer"
                disabled={submitting}
              >
                {t('common.back', 'Back')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 btn-primary py-3 font-bold text-white text-base tracking-wide cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? t('onboarding.saving', 'Saving goals...') : t('onboarding.saveGoal', 'Complete Setup & Open Dashboard')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
