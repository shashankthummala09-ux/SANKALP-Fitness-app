import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Camera, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function LogMeasurements() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Slider state values in cm
  const [chest, setChest] = useState<number>(95);
  const [waist, setWaist] = useState<number>(85);
  const [arms, setArms] = useState<number>(32);
  const [thighs, setThighs] = useState<number>(55);
  
  // Progress photo states
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle Photo selection and conversion to Base64
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError(t('measurements.invalidFileType', 'Please select a valid image file.'));
      return;
    }

    // Validate size (limit to ~10MB on client side)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('measurements.fileTooLarge', 'Image size must be smaller than 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoBase64(base64String);
      setPhotoPreview(base64String);
    };
    reader.onerror = () => {
      setError(t('measurements.readError', 'Failed to read image file.'));
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoBase64('');
    setPhotoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/api/measurements', {
        chest,
        waist,
        arms,
        thighs,
        photo: photoBase64 || undefined,
      });
      navigate('/measurements/history');
    } catch (err: any) {
      console.error('Error logging measurements:', err);
      setError(err.response?.data?.error || t('measurements.logFailed', 'Failed to save body measurements. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-brand-muted hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('measurements.logTitle', 'Log Body Measurements')}
          </h1>
          <p className="text-brand-muted text-xs">
            {t('measurements.logSubtitle', 'Track updates to your chest, waist, arms, thighs, and log progress photos.')}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sliders panel */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="h-5 w-5 text-brand-primary" />
            {t('measurements.dimensions', 'Body Dimensions (cm)')}
          </h2>

          {/* Chest Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-sm font-semibold">
              <span className="text-brand-text">{t('measurements.chest', 'Chest')}</span>
              <span className="text-brand-primary font-bold text-base">{chest} cm</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="200"
                step="0.5"
                value={chest}
                onChange={(e) => setChest(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/10 accent-brand-primary cursor-pointer"
              />
              <input
                type="number"
                min="50"
                max="200"
                step="0.5"
                value={chest}
                onChange={(e) => setChest(Math.max(50, Math.min(200, parseFloat(e.target.value) || 50)))}
                className="w-20 bg-brand-dark/80 border border-white/10 rounded-lg px-2 py-1 text-center text-sm font-bold text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Waist Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-sm font-semibold">
              <span className="text-brand-text">{t('measurements.waist', 'Waist')}</span>
              <span className="text-brand-primary font-bold text-base">{waist} cm</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="40"
                max="180"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/10 accent-brand-primary cursor-pointer"
              />
              <input
                type="number"
                min="40"
                max="180"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(Math.max(40, Math.min(180, parseFloat(e.target.value) || 40)))}
                className="w-20 bg-brand-dark/80 border border-white/10 rounded-lg px-2 py-1 text-center text-sm font-bold text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Arms Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-sm font-semibold">
              <span className="text-brand-text">{t('measurements.arms', 'Arms (Biceps/Triceps)')}</span>
              <span className="text-brand-primary font-bold text-base">{arms} cm</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="70"
                step="0.5"
                value={arms}
                onChange={(e) => setArms(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/10 accent-brand-primary cursor-pointer"
              />
              <input
                type="number"
                min="15"
                max="70"
                step="0.5"
                value={arms}
                onChange={(e) => setArms(Math.max(15, Math.min(70, parseFloat(e.target.value) || 15)))}
                className="w-20 bg-brand-dark/80 border border-white/10 rounded-lg px-2 py-1 text-center text-sm font-bold text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Thighs Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-sm font-semibold">
              <span className="text-brand-text">{t('measurements.thighs', 'Thighs')}</span>
              <span className="text-brand-primary font-bold text-base">{thighs} cm</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20"
                max="100"
                step="0.5"
                value={thighs}
                onChange={(e) => setThighs(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/10 accent-brand-primary cursor-pointer"
              />
              <input
                type="number"
                min="20"
                max="100"
                step="0.5"
                value={thighs}
                onChange={(e) => setThighs(Math.max(20, Math.min(100, parseFloat(e.target.value) || 20)))}
                className="w-20 bg-brand-dark/80 border border-white/10 rounded-lg px-2 py-1 text-center text-sm font-bold text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload panel */}
        <div className="glass-panel p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Camera className="h-5 w-5 text-brand-primary" />
            {t('measurements.progressPhoto', 'Private Progress Photo')}
          </h2>

          <p className="text-xs text-brand-muted leading-relaxed">
            {t('measurements.photoDisclaimer', 'Upload a progress photo to visual-track your physical changes. Photos are encrypted/saved locally and strictly private to your account.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {photoPreview ? (
              <div className="relative h-44 w-44 rounded-xl border border-white/10 overflow-hidden bg-brand-dark flex items-center justify-center group">
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="absolute inset-0 bg-brand-dark/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-red-400 cursor-pointer"
                >
                  {t('measurements.removePhoto', 'Remove Image')}
                </button>
              </div>
            ) : (
              <label className="h-44 w-44 rounded-xl border-2 border-dashed border-white/10 hover:border-brand-primary/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/[0.01]">
                <Camera className="h-8 w-8 text-brand-muted" />
                <span className="text-xs font-bold text-brand-muted select-none">{t('measurements.selectPhoto', 'Select Image')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}

            <div className="text-left space-y-1">
              <span className="text-xs font-bold text-white block">
                {photoPreview ? t('measurements.photoReady', 'Photo Ready for Upload') : t('measurements.noPhotoSelected', 'No photo selected')}
              </span>
              <span className="text-[10px] text-brand-muted block">
                {t('measurements.photoRequirements', 'Supports JPEG, PNG (max 10MB)')}
              </span>
            </div>
          </div>
        </div>

        {/* Submit actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-1/3 btn-secondary py-3 font-bold cursor-pointer"
            disabled={submitting}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            className="w-2/3 btn-primary py-3 font-bold text-white tracking-wide cursor-pointer flex justify-center items-center gap-2"
            disabled={submitting}
          >
            <Save className="h-5 w-5" />
            {submitting ? t('measurements.logging', 'Saving...') : t('measurements.save', 'Save Measurements')}
          </button>
        </div>
      </form>
    </div>
  );
}
