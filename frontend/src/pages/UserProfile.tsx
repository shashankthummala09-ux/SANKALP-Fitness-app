import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User as UserIcon, Mail, MapPin, Calendar, Target, Ruler, Scale, 
  Activity, Dumbbell, Award, Flame, Sparkles, LogOut, ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface GoalData {
  id: string;
  currentWeight: number;
  goalWeight: number;
  height: number;
  activityLevel: string;
  primaryGoal: string;
  targetDate: string | null;
  createdAt: string;
  sankalpText: string | null;
}

interface SetRecord {
  weight: number;
  reps: number;
}

interface ExerciseMetadata {
  name: string;
}

interface SessionExerciseRecord {
  exercise: ExerciseMetadata;
  sets: SetRecord[];
}

interface WorkoutSessionRecord {
  exercises: SessionExerciseRecord[];
}

export default function UserProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<GoalData | null>(null);

  // Sankalp Wall editing states
  const [isEditingSankalp, setIsEditingSankalp] = useState(false);
  const [tempSankalpText, setTempSankalpText] = useState('');
  const [sankalpError, setSankalpError] = useState('');
  const [sankalpSubmitting, setSankalpSubmitting] = useState(false);

  // Stats calculations
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [cumulativeVolume, setCumulativeVolume] = useState(0);
  const [heavyRecord, setHeavyRecord] = useState({ weight: 0, exercise: '' });
  const [favoriteExercise, setFavoriteExercise] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch active goal / dashboard details
        const goalRes = await api.get('/api/goals/dashboard');
        if (!goalRes.data.onboardingRequired) {
          setGoal(goalRes.data.goal);
          setTempSankalpText(goalRes.data.goal.sankalpText || '');
        }

        // Fetch workout history for stats computations
        const historyRes = await api.get('/api/workouts');
        const workoutHistory = historyRes.data.history as WorkoutSessionRecord[];
        setTotalWorkouts(workoutHistory.length);

        // Run computations
        let totalVol = 0;
        let maxWeight = 0;
        let maxWeightExName = '';
        const exerciseCounts: Record<string, number> = {};

        workoutHistory.forEach((session) => {
          session.exercises.forEach((se) => {
            const exName = se.exercise?.name || 'Unknown';
            exerciseCounts[exName] = (exerciseCounts[exName] || 0) + 1;

            se.sets.forEach((set) => {
              totalVol += set.weight * set.reps;
              if (set.weight > maxWeight) {
                maxWeight = set.weight;
                maxWeightExName = exName;
              }
            });
          });
        });

        setCumulativeVolume(totalVol);
        if (maxWeight > 0) {
          setHeavyRecord({ weight: maxWeight, exercise: maxWeightExName });
        }

        // Find favorite exercise
        let favEx = 'None yet';
        let maxCount = 0;
        Object.entries(exerciseCounts).forEach(([name, count]) => {
          if (count > maxCount) {
            maxCount = count;
            favEx = name;
          }
        });
        setFavoriteExercise(favEx);

      } catch (err: any) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveSankalp = async () => {
    setSankalpError('');
    if (tempSankalpText.trim() && tempSankalpText.length > 150) {
      setSankalpError(t('onboarding.sankalpTooLong', 'Sankalp vow text cannot exceed 150 characters.'));
      return;
    }

    setSankalpSubmitting(true);
    try {
      const res = await api.put('/api/goals/sankalp', { sankalpText: tempSankalpText.trim() || null });
      if (goal) {
        setGoal({ ...goal, sankalpText: res.data.goal.sankalpText });
      }
      setIsEditingSankalp(false);
    } catch (err: any) {
      console.error('Error saving sankalp vow:', err);
      setSankalpError(err.response?.data?.error || t('common.error', 'Error saving vow. Please try again.'));
    } finally {
      setSankalpSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper mappings for stored text fields
  const getActivityLevelLabel = (level: string) => {
    if (level.includes('Sedentary')) return t('onboarding.sedentary');
    if (level.includes('Lightly')) return t('onboarding.lightlyActive');
    if (level.includes('Moderately')) return t('onboarding.moderatelyActive');
    if (level.includes('Very')) return t('onboarding.veryActive');
    return level;
  };

  const getPrimaryGoalLabel = (goal: string) => {
    if (goal.includes('Lose')) return t('onboarding.loseWeight');
    if (goal.includes('Gain')) return t('onboarding.gainMuscle');
    if (goal.includes('Endurance')) return t('onboarding.improveEndurance');
    if (goal.includes('Stay')) return t('onboarding.stayFit');
    return goal;
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-brand-dark">
        <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  // Calculate join date
  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : t('userProfile.recently', 'Recently');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header */}
      <div className="glass-panel p-6 sm:p-8 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-extrabold text-2xl sm:text-3xl shadow-[0_0_20px_rgba(255,107,0,0.25)]">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-brand-muted">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-brand-primary" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-accent" />
                {user?.city}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full md:w-auto btn-secondary border-red-500/10 text-red-400 hover:bg-red-500/15 py-2.5 px-5 flex items-center justify-center gap-2 cursor-pointer font-bold shrink-0"
        >
          <LogOut className="h-4.5 w-4.5" />
          {t('navbar.signOut')}
        </button>
      </div>

      {/* Two column grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Account Details & Goals */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Account Overview */}
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-muted flex items-center gap-2">
              <UserIcon className="h-4.5 w-4.5 text-brand-primary" />
              {t('userProfile.accountDetails', 'Account Details')}
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand-muted flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {t('userProfile.registeredLabel', 'Registered')}</span>
                <span className="font-semibold text-white">{joinDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand-muted flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {t('userProfile.currentCityLabel', 'Current City')}</span>
                <span className="font-semibold text-white">{user?.city}</span>
              </div>
            </div>
          </div>

          {/* Goal Targets */}
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-muted flex items-center gap-2">
              <Target className="h-4.5 w-4.5 text-brand-secondary" />
              {t('userProfile.activeGoalTitle')}
            </h3>

            {goal ? (
              <div className="space-y-4 text-sm">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                  <span className="text-xs text-brand-muted font-bold block uppercase tracking-wider">{t('userProfile.primaryGoal')}</span>
                  <span className="text-lg font-extrabold text-brand-secondary mt-1 block">
                    {getPrimaryGoalLabel(goal.primaryGoal)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-dark/50 border border-white/5 rounded-xl p-3 text-center">
                    <span className="text-[10px] text-brand-muted uppercase font-bold block">{t('userProfile.currentWeight').split(' ')[0]}</span>
                    <span className="text-sm font-bold text-white mt-1 block">{goal.currentWeight} {t('common.kg')}</span>
                  </div>
                  <div className="bg-brand-dark/50 border border-white/5 rounded-xl p-3 text-center">
                    <span className="text-[10px] text-brand-muted uppercase font-bold block">{t('userProfile.targetWeight').split(' ')[0]}</span>
                    <span className="text-sm font-bold text-brand-primary mt-1 block">{goal.goalWeight} {t('common.kg')}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-brand-muted flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {t('userProfile.height')}:</span>
                    <span className="text-brand-text font-semibold">{goal.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> {t('userProfile.activityLevel')}:</span>
                    <span className="text-brand-text font-semibold text-right">{getActivityLevelLabel(goal.activityLevel)}</span>
                  </div>
                  {goal.targetDate && (
                    <div className="flex justify-between">
                      <span className="text-brand-muted flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {t('userProfile.targetDate')}:</span>
                      <span className="text-brand-text font-semibold">{new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    to="/onboarding"
                    className="w-full btn-secondary py-2 text-center text-xs block font-bold border border-white/10 hover:border-brand-primary/40 text-brand-primary"
                  >
                    {t('userProfile.adjustGoal', 'Adjust Goal Metrics')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3.5">
                <ShieldAlert className="h-10 w-10 text-brand-muted/40 mx-auto" />
                <p className="text-xs text-brand-muted leading-relaxed">
                  {t('userProfile.noGoal')}
                </p>
                <Link
                  to="/onboarding"
                  className="w-full btn-primary py-2 text-xs text-center block font-bold"
                >
                  {t('userProfile.configureGoals', 'Configure Fitness Goals')}
                </Link>
              </div>
            )}
          </div>

          {/* Body Measurements Shortcut Card */}
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-muted flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-brand-primary" />
              {t('measurements.profileCardTitle', 'Body Measurements')}
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed text-left">
              Track your chest, waist, arms, thighs, and private progress photos to view transformation trend graphs.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/measurements/log"
                className="btn-primary py-2 text-center text-xs block font-bold text-sm cursor-pointer"
              >
                {t('measurements.logNewBtn', 'Log Stats')}
              </Link>
              <Link
                to="/measurements/history"
                className="btn-secondary py-2 text-center text-xs block font-bold border border-white/10 hover:border-brand-primary/40 text-brand-primary text-sm"
              >
                {t('measurements.viewHistoryBtn', 'History')}
              </Link>
            </div>
          </div>

          {/* Sankalp Vow Card */}
          {goal && (
            <div className="glass-panel p-6 border border-white/5 space-y-4 relative overflow-hidden">
              <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-muted flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-brand-primary" />
                {t('userProfile.sankalpTitle', 'My Sankalp')}
              </h3>

              {isEditingSankalp ? (
                <div className="space-y-3">
                  {sankalpError && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                      {sankalpError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-end text-[10px] text-brand-muted">
                      {tempSankalpText.length} / 150
                    </div>
                    <textarea
                      rows={3}
                      maxLength={150}
                      value={tempSankalpText}
                      onChange={(e) => setTempSankalpText(e.target.value)}
                      placeholder={t('onboarding.sankalpPlaceholder', 'e.g. My sankalp is to run 5K without stopping by Diwali')}
                      className="glass-input w-full text-xs resize-none placeholder-brand-muted"
                      disabled={sankalpSubmitting}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setIsEditingSankalp(false);
                        setTempSankalpText(goal.sankalpText || '');
                        setSankalpError('');
                      }}
                      className="btn-secondary py-1.5 px-3 text-xs"
                      disabled={sankalpSubmitting}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={handleSaveSankalp}
                      className="btn-primary py-1.5 px-4 text-xs font-bold"
                      disabled={sankalpSubmitting}
                    >
                      {sankalpSubmitting ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {goal.sankalpText ? (
                    <blockquote className="text-sm italic text-brand-text leading-relaxed border-l-2 border-brand-primary pl-3 bg-white/[0.01] py-2 rounded-r-lg">
                      "{goal.sankalpText}"
                    </blockquote>
                  ) : (
                    <p className="text-xs text-brand-muted italic">
                      No sankalp vow set yet. Set a commitment to keep you motivated.
                    </p>
                  )}
                  <button
                    onClick={() => setIsEditingSankalp(true)}
                    className="w-full btn-secondary py-2 text-center text-xs block font-bold border border-white/10 hover:border-brand-primary/40 text-brand-primary"
                  >
                    {goal.sankalpText ? t('userProfile.editSankalp', 'Edit Vow') : t('userProfile.createSankalp', 'Create Vow')}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Training Statistics */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Detailed stats grids */}
          <div className="glass-panel p-6 sm:p-8 border border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-primary" />
              {t('userProfile.statsTitle')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Stat card 1 */}
              <div className="bg-brand-dark/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Dumbbell className="h-16 w-16 text-brand-primary" />
                </div>
                <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('userProfile.totalWorkouts')}</span>
                <span className="block text-4xl font-extrabold text-white mt-2 tracking-tight">
                  {totalWorkouts}
                </span>
                <span className="block text-xs text-brand-muted mt-2">
                  {t('userProfile.workoutsDesc', 'Logged workouts completed in database')}
                </span>
              </div>

              {/* Stat card 2 */}
              <div className="bg-brand-dark/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Scale className="h-16 w-16 text-brand-secondary" />
                </div>
                <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('userProfile.totalVolume')}</span>
                <span className="block text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mt-2 tracking-tight">
                  {cumulativeVolume.toLocaleString()} <span className="text-sm font-semibold text-brand-muted">{t('common.kg')}</span>
                </span>
                <span className="block text-xs text-brand-muted mt-2.5">
                  {t('userProfile.volumeDesc', 'Total weight load lifted across all logged sets')}
                </span>
              </div>

              {/* Stat card 3 */}
              <div className="bg-brand-dark/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Award className="h-16 w-16 text-brand-accent" />
                </div>
                <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('userProfile.peakRecord')}</span>
                {heavyRecord.weight > 0 ? (
                  <div className="mt-2 space-y-1">
                    <span className="block text-3xl font-extrabold text-white tracking-tight">
                      {heavyRecord.weight} <span className="text-sm font-semibold text-brand-muted">{t('common.kg')}</span>
                    </span>
                    <span className="block text-xs text-brand-accent font-bold truncate">
                      {heavyRecord.exercise}
                    </span>
                  </div>
                ) : (
                  <span className="block text-xl font-bold text-brand-muted mt-3">
                    {t('userProfile.noSetsLogged', 'No sets logged yet')}
                  </span>
                )}
                <span className="block text-xs text-brand-muted mt-2">
                  {t('userProfile.heavyDesc', 'Absolute heaviest weight record recorded in session sets')}
                </span>
              </div>

              {/* Stat card 4 */}
              <div className="bg-brand-dark/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Activity className="h-16 w-16 text-brand-primary" />
                </div>
                <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('userProfile.favoriteMovement', 'Favorite Movement')}</span>
                <span className="block text-2xl font-extrabold text-white mt-2 tracking-tight truncate">
                  {favoriteExercise}
                </span>
                <span className="block text-xs text-brand-muted mt-3">
                  {t('userProfile.favDesc', 'Movement pattern logged most frequently in history')}
                </span>
              </div>

            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-brand-muted">
              <span>{t('userProfile.engine', 'Sankalp Portfolio Profile Stats Engine')}</span>
              <div className="flex gap-4">
                <Link to="/dashboard" className="text-brand-primary hover:underline font-bold">{t('navbar.dashboard')}</Link>
                <Link to="/history" className="text-brand-primary hover:underline font-bold">{t('navbar.history')}</Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
