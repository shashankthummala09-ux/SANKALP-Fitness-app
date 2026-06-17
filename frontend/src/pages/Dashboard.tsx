import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scale, Activity, TrendingUp, Plus, X, 
  AlertCircle, Calendar, Target, Award, ChevronRight, Dumbbell 
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import DiyaStreak from '../components/DiyaStreak';

interface WeightLog {
  id: string;
  weight: number;
  loggedAt: string;
}

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

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [bmi, setBmi] = useState<number>(0);
  const [daysSinceSet, setDaysSinceSet] = useState<number>(0);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);

  // Weight Logging Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  
  // Hovered data point for custom chart
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number; weight: number; date: string } | null>(null);

  // Streak state
  const [streak, setStreak] = useState({ currentStreak: 0, daysSinceLastWorkout: 999 });

  const fetchDashboardData = async () => {
    try {
      const dashboardRes = await api.get('/api/goals/dashboard');
      if (dashboardRes.data.onboardingRequired) {
        navigate('/onboarding');
        return;
      }

      setGoal(dashboardRes.data.goal);
      setBmi(dashboardRes.data.bmi);
      setDaysSinceSet(dashboardRes.data.daysSinceSet);

      const historyRes = await api.get('/api/goals/history');
      setWeightHistory(historyRes.data.history);

      // Fetch workout history for streak calculation
      const workoutsRes = await api.get('/api/workouts');
      const streakInfo = calculateStreak(workoutsRes.data.history);
      setStreak(streakInfo);

      setError('');
    } catch (err: any) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err.response?.data?.error || t('dashboard.loadFailed', 'Failed to load dashboard data. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) {
      setModalError(t('dashboard.invalidWeight', 'Please enter a valid positive weight.'));
      return;
    }

    setModalSubmitting(true);
    try {
      await api.post('/api/goals/weight', { weight: w });
      setNewWeight('');
      setIsModalOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error logging weight:', err);
      setModalError(err.response?.data?.error || t('dashboard.logWeightFailed', 'Failed to log weight. Please try again.'));
    } finally {
      setModalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-brand-dark">
        <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="glass-panel p-12 max-w-xl mx-auto border border-white/10 shadow-2xl">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-white mb-2">{t('common.error', 'Error')}</h2>
          <p className="text-brand-muted mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary cursor-pointer">
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!goal) return null;

  // Progress calculations
  const initialWeight = weightHistory.length > 0 ? weightHistory[0].weight : goal.currentWeight;
  const targetWeight = goal.goalWeight;
  const currentWeight = goal.currentWeight;

  let progressPercent = 0;
  if (initialWeight === targetWeight) {
    progressPercent = 100;
  } else {
    const totalToLoseOrGain = targetWeight - initialWeight;
    const currentlyLostOrGained = currentWeight - initialWeight;
    progressPercent = Math.min(100, Math.max(0, (currentlyLostOrGained / totalToLoseOrGain) * 100));
  }

  // BMI Rating info
  const getBmiDetails = (val: number) => {
    if (val < 18.5) return { category: t('dashboard.underweight', 'Underweight'), color: 'text-brand-accent border-brand-accent/20 bg-brand-accent/5' };
    if (val < 25) return { category: t('dashboard.normalWeight', 'Normal'), color: 'text-green-400 border-green-500/20 bg-green-500/5' };
    if (val < 30) return { category: t('dashboard.overweight', 'Overweight'), color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
    return { category: t('dashboard.obese', 'Obese'), color: 'text-red-400 border-red-500/20 bg-red-500/5' };
  };
  const bmiDetails = getBmiDetails(bmi);

  const getActivityLevelTranslation = (level: string) => {
    switch (level) {
      case 'Sedentary': return t('onboarding.sedentary', 'Sedentary');
      case 'Lightly Active': return t('onboarding.lightlyActive', 'Lightly Active');
      case 'Moderately Active': return t('onboarding.moderatelyActive', 'Moderately Active');
      case 'Very Active': return t('onboarding.veryActive', 'Very Active');
      default: return level;
    }
  };

  const getPrimaryGoalTranslation = (goalStr: string) => {
    switch (goalStr) {
      case 'Lose Weight': return t('onboarding.loseWeight', 'Lose Weight');
      case 'Gain Muscle': return t('onboarding.gainMuscle', 'Gain Muscle');
      case 'Improve Endurance': return t('onboarding.improveEndurance', 'Improve Endurance');
      case 'Stay Fit': return t('onboarding.stayFit', 'Stay Fit');
      default: return goalStr;
    }
  };

  // SVG Chart Dimensions
  const viewBoxWidth = 600;
  const viewBoxHeight = 250;
  const chartPadding = { top: 30, right: 30, bottom: 40, left: 50 };

  const generateChartPath = () => {
    if (weightHistory.length < 2) return '';

    const weights = weightHistory.map(w => w.weight);
    const maxW = Math.max(...weights) + 2;
    const minW = Math.max(0, Math.min(...weights) - 2);
    const rangeY = maxW - minW || 1;

    let path = '';
    const pointsCount = weightHistory.length;

    weightHistory.forEach((log, index) => {
      const x = chartPadding.left + (index / (pointsCount - 1)) * (viewBoxWidth - chartPadding.left - chartPadding.right);
      const y = viewBoxHeight - chartPadding.bottom - ((log.weight - minW) / rangeY) * (viewBoxHeight - chartPadding.top - chartPadding.bottom);

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  const generateChartAreaPath = () => {
    const strokePath = generateChartPath();
    if (!strokePath) return '';

    const firstX = chartPadding.left;
    const lastX = chartPadding.left + (viewBoxWidth - chartPadding.left - chartPadding.right);
    const bottomY = viewBoxHeight - chartPadding.bottom;

    return `${strokePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const renderChartPoints = () => {
    if (weightHistory.length === 0) return null;

    const weights = weightHistory.map(w => w.weight);
    const maxW = Math.max(...weights) + 2;
    const minW = Math.max(0, Math.min(...weights) - 2);
    const rangeY = maxW - minW || 1;
    const pointsCount = weightHistory.length;

    return weightHistory.map((log, index) => {
      const x = chartPadding.left + (index / (pointsCount - 1)) * (viewBoxWidth - chartPadding.left - chartPadding.right);
      const y = viewBoxHeight - chartPadding.bottom - ((log.weight - minW) / rangeY) * (viewBoxHeight - chartPadding.top - chartPadding.bottom);
      const formattedDate = new Date(log.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      return (
        <g key={log.id}>
          <circle
            cx={x}
            cy={y}
            r="12"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoveredPoint({ index, x, y, weight: log.weight, date: formattedDate })}
            onMouseLeave={() => setHoveredPoint(null)}
          />
          <circle
            cx={x}
            cy={y}
            r={hoveredPoint?.index === index ? '6' : '4'}
            fill={hoveredPoint?.index === index ? '#CC5500' : '#FF6B00'}
            className="transition-all duration-150 pointer-events-none filter drop-shadow-[0_0_4px_rgba(255,107,0,0.8)]"
          />
        </g>
      );
    });
  };

  const renderYAxis = () => {
    if (weightHistory.length === 0) return null;
    const weights = weightHistory.map(w => w.weight);
    const maxW = Math.max(...weights) + 2;
    const minW = Math.max(0, Math.min(...weights) - 2);
    const rangeY = maxW - minW || 1;

    const ticks = [];
    for (let i = 0; i <= 3; i++) {
      ticks.push(minW + (i / 3) * rangeY);
    }

    return ticks.map((val, idx) => {
      const y = viewBoxHeight - chartPadding.bottom - (idx / 3) * (viewBoxHeight - chartPadding.top - chartPadding.bottom);
      return (
        <g key={idx} className="text-[10px] fill-brand-muted/70">
          <text x={chartPadding.left - 10} y={y + 3} textAnchor="end">
            {val.toFixed(1)} kg
          </text>
          <line
            x1={chartPadding.left}
            y1={y}
            x2={viewBoxWidth - chartPadding.right}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        </g>
      );
    });
  };

  const renderXAxis = () => {
    if (weightHistory.length < 2) return null;
    const pointsCount = weightHistory.length;
    const labelSpacing = Math.max(1, Math.floor(pointsCount / 4));
    const labelIndices = [];
    
    for (let i = 0; i < pointsCount; i += labelSpacing) {
      labelIndices.push(i);
    }
    if (labelIndices[labelIndices.length - 1] !== pointsCount - 1) {
      labelIndices.push(pointsCount - 1);
    }

    return labelIndices.map((index) => {
      const log = weightHistory[index];
      if (!log) return null;

      const x = chartPadding.left + (index / (pointsCount - 1)) * (viewBoxWidth - chartPadding.left - chartPadding.right);
      const formattedDate = new Date(log.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      return (
        <text
          key={log.id}
          x={x}
          y={viewBoxHeight - 15}
          textAnchor="middle"
          className="text-[10px] fill-brand-muted/70"
        >
          {formattedDate}
        </text>
      );
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t('dashboard.welcome', 'Welcome, ')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{user?.name}</span>
          </h1>
          <p className="text-brand-muted mt-1.5 text-sm sm:text-base">
            {t('dashboard.welcomeSubtitle', 'Track your fitness goals, log daily weigh-ins, and monitor workout trends.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto btn-primary py-2.5 px-5 flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold"
          >
            <Plus className="h-5 w-5" />
            {t('dashboard.logWeightBtn', "Log Weight")}
          </button>
          <Link
            to="/log"
            className="w-full sm:w-auto btn-secondary py-2.5 px-5 flex items-center justify-center gap-2 text-center text-sm font-semibold"
          >
            <Dumbbell className="h-5 w-5 text-brand-primary" />
            {t('navbar.logWorkout', 'New Workout')}
          </Link>
          <Link
            to="/measurements/history"
            className="w-full sm:w-auto btn-secondary py-2.5 px-5 flex items-center justify-center gap-2 text-center text-sm font-semibold"
          >
            <Activity className="h-5 w-5 text-brand-primary" />
            {t('measurements.dashboardShortcut', 'Body Stats')}
          </Link>
        </div>
      </div>

      {/* Sankalp Quote Card */}
      {goal.sankalpText ? (
        <div className="glass-panel p-6 border border-brand-primary/20 relative overflow-hidden group bg-gradient-to-r from-brand-card/75 to-brand-primary/5 shadow-[0_4px_20px_rgba(255,107,0,0.08)]">
          {/* Quote decorative backdrop icon (Gada silhouette shape) */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.03] text-brand-primary pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <path d="M45,54 C28,56 18,44 18,30 C18,14 34,8 43,12 C32,10 22,18 22,30 C22,40 30,49 45,49 Z" fill="currentColor" />
              <circle cx="50" cy="32" r="4.5" fill="currentColor" />
              <rect x="61" y="10" width="3" height="32" rx="1" transform="rotate(22 62.5 26)" fill="currentColor" />
              <circle cx="72" cy="11" r="8" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-primary">My Sacred Vow</span>
              <blockquote className="text-lg md:text-xl font-display font-medium italic text-brand-text leading-relaxed">
                "{goal.sankalpText}"
              </blockquote>
            </div>
            <Link
              to="/profile"
              className="text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1 shrink-0 self-end sm:self-center bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer font-sans"
            >
              {t('dashboard.editSankalp', 'Refine Vow')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-5 border border-dashed border-white/10 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Define your Sankalp</h4>
            <p className="text-xs text-brand-muted">Set a vow/resolution to guide your daily training and display it prominently here.</p>
          </div>
          <Link
            to="/profile"
            className="btn-primary py-2 px-4 text-xs font-bold shrink-0"
          >
            Create Sankalp
          </Link>
        </div>
      )}

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Weight Log Card */}
        <div className="glass-panel p-6 border border-white/5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Scale className="h-20 w-20 text-brand-primary" />
          </div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {t('dashboard.currentWeight', 'Current Weight')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{currentWeight}</span>
            <span className="text-sm font-semibold text-brand-muted">{t('common.kg', 'kg')}</span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-brand-muted">{t('dashboard.targetWeight', 'Target Weight')}</span>
            <span className="text-sm font-semibold text-brand-primary">{targetWeight} {t('common.kg', 'kg')}</span>
          </div>
        </div>

        {/* BMI Card */}
        <div className="glass-panel p-6 border border-white/5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="h-20 w-20 text-brand-accent" />
          </div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {t('dashboard.bmiCalculator', 'BMI Index')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{bmi}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border text-center font-bold tracking-wide mt-1 inline-block text-[11px] align-middle ml-2 select-none ${bmiDetails.color}`}>
              {bmiDetails.category}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-brand-muted">{t('userProfile.height', 'Height')}</span>
            <span className="text-sm font-semibold text-brand-text">{goal.height} cm</span>
          </div>
        </div>

        {/* Goal Profile Card */}
        <div className="glass-panel p-6 border border-white/5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="h-20 w-20 text-brand-secondary" />
          </div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {t('userProfile.primaryGoal', 'Primary Goal')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-white leading-tight mt-1">
              {getPrimaryGoalTranslation(goal.primaryGoal)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
            <span className="text-xs text-brand-muted">{t('userProfile.activityLevel', 'Activity')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-brand-text">
              {getActivityLevelTranslation(goal.activityLevel)}
            </span>
          </div>
        </div>

        {/* Diya Streak Card */}
        <DiyaStreak 
          streakCount={streak.currentStreak} 
          daysSinceLastWorkout={streak.daysSinceLastWorkout} 
        />

        {/* Time Tracking Card */}
        <div className="glass-panel p-6 border border-white/5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar className="h-20 w-20 text-brand-primary" />
          </div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {t('dashboard.daysElapsed', 'Tracking Period')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{daysSinceSet}</span>
            <span className="text-sm font-semibold text-brand-muted">
              {daysSinceSet === 1 ? t('dashboard.day', 'day') : t('dashboard.days', 'days')}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-brand-muted">{t('userProfile.targetDate', 'Target Date')}</span>
            <span className="text-sm font-semibold text-brand-text">
              {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : t('dashboard.noTargetSet', 'No Target Set')}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Glowing Chart Panel */}
        <div className="lg:col-span-2 glass-panel p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-primary" />
                {t('dashboard.weightHistory', 'Weight History & Progress Trend')}
              </h3>
              <span className="text-xs text-brand-muted bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
                {t('dashboard.dataPointsCount', 'Total data points: {{count}}', { count: weightHistory.length })}
              </span>
            </div>
            
            {weightHistory.length >= 2 ? (
              <div className="relative mt-2">
                <svg
                  viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                  className="w-full h-auto"
                >
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FF6B00" />
                      <stop offset="100%" stopColor="#CC5500" />
                    </linearGradient>

                    <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 107, 0, 0.25)" />
                      <stop offset="100%" stopColor="rgba(255, 107, 0, 0.0)" />
                    </linearGradient>
                  </defs>

                  {renderYAxis()}

                  <path
                    d={generateChartAreaPath()}
                    fill="url(#chartAreaGradient)"
                  />

                  <path
                    d={generateChartPath()}
                    fill="none"
                    stroke="url(#chartLineGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />

                  {renderChartPoints()}
                  {renderXAxis()}
                </svg>

                {hoveredPoint && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(hoveredPoint.x / viewBoxWidth) * 100}%`,
                      top: `${(hoveredPoint.y / viewBoxHeight) * 100 - 45}%`,
                      transform: 'translateX(-50%)',
                    }}
                    className="glass-panel px-3 py-1.5 border border-brand-secondary/30 text-center pointer-events-none z-10 shadow-glass-sm animate-fade-in text-xs"
                  >
                    <p className="font-bold text-white">{hoveredPoint.weight} kg</p>
                    <p className="text-[10px] text-brand-muted">{hoveredPoint.date}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] my-4">
                <Scale className="h-10 w-10 text-brand-muted/40 mb-3 animate-pulse" />
                <p className="text-brand-text font-semibold">
                  {t('dashboard.notEnoughHistory', 'Not Enough Weight History')}
                </p>
                <p className="text-brand-muted text-xs max-w-sm mt-1">
                  {t('dashboard.notEnoughHistoryDesc', "Log at least 2 weigh-ins to generate your personal weight tracker chart. Let's record your weight today!")}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-[11px] text-brand-muted mt-3 flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-brand-primary" />
            {t('dashboard.hoverTip', 'Hover over nodes in the graph to check dates and precise weights.')}
          </div>
        </div>

        {/* Goal Progress Bar & History Logs */}
        <div className="glass-panel p-6 border border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-secondary" />
              {t('dashboard.weightProgress', 'Weight Goal Progress')}
            </h3>

            {/* Progress metrics */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-sm">
                <span className="text-brand-muted">
                  {t('dashboard.from', 'From')}{' '}
                  <span className="font-bold text-brand-text">{initialWeight}kg</span>
                </span>
                <span className="text-brand-primary font-bold text-base">
                  {progressPercent.toFixed(0)}%
                </span>
                <span className="text-brand-muted">
                  {t('dashboard.goal', 'Goal')}{' '}
                  <span className="font-bold text-brand-text">{targetWeight}kg</span>
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-3 w-full rounded-full bg-brand-dark border border-white/10 overflow-hidden relative">
                <div 
                  style={{ width: `${progressPercent}%` }} 
                  className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_10px_rgba(255,107,0,0.5)] transition-all duration-1000 ease-out"
                ></div>
              </div>
              <p className="text-xs text-brand-muted text-center pt-1.5">
                {currentWeight === targetWeight ? (
                  <span className="text-brand-secondary font-bold">
                    {t('dashboard.goalAchieved', '🎉 Congratulations! Goal Achieved!')}
                  </span>
                ) : (
                  <span>
                    {t('dashboard.weightAway', 'You are {{weight}} kg away from your goal.', { weight: Math.abs(currentWeight - targetWeight).toFixed(1) })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex-grow flex flex-col justify-between">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-primary" />
              {t('dashboard.recentWeighins', 'Recent Weigh-ins')}
            </h4>

            {weightHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {[...weightHistory].reverse().slice(0, 5).map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-lg p-2.5 hover:bg-white/[0.04] transition-all">
                    <span className="text-xs text-brand-muted">
                      {new Date(log.loggedAt).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </span>
                    <span className="text-sm font-bold text-white">{log.weight} kg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-muted text-center py-6">
                {t('dashboard.noHistory', 'No weight history logged yet.')}
              </p>
            )}
            
            <div className="pt-4 mt-2 border-t border-white/5">
              <Link to="/history" className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors duration-200 flex items-center justify-center gap-1">
                {t('dashboard.viewWorkoutHistory', 'View Workout History logs')} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Log Weight Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="absolute inset-0 bg-brand-dark/85 backdrop-blur-sm cursor-pointer"
          ></div>

          {/* Dialog Panel */}
          <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 z-10 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="h-5.5 w-5.5 text-brand-primary" />
                {t('dashboard.logWeightTitle', "Record Today's Weight")}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brand-muted hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <div>
                <label htmlFor="weightInput" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                  {t('dashboard.newWeightLabel', 'Weight (in kilograms)')}
                </label>
                <div className="relative">
                  <input
                    id="weightInput"
                    type="number"
                    step="0.1"
                    required
                    autoFocus
                    placeholder="e.g. 78.4"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="glass-input w-full pr-12 text-lg font-bold"
                    disabled={modalSubmitting}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-brand-muted font-bold text-sm">{t('common.kg', 'kg')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-brand-muted pt-1">
                <span>{t('dashboard.activeHeight', 'Active height:')} {goal.height} cm</span>
                <span>{t('dashboard.activeGoal', 'Active goal:')} {goal.goalWeight} kg</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 btn-secondary py-2.5 font-bold cursor-pointer"
                  disabled={modalSubmitting}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 btn-primary py-2.5 font-bold cursor-pointer"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? t('dashboard.loggingWeight', 'Logging...') : t('common.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate workout streak count in local timezone
const calculateStreak = (workouts: any[]) => {
  if (!workouts || workouts.length === 0) {
    return { currentStreak: 0, daysSinceLastWorkout: 999 };
  }

  // 1. Convert workout start times to local date strings (YYYY-MM-DD)
  const localDates = workouts.map((w: any) => {
    const d = new Date(w.startTime);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // 2. Get unique dates and sort them in descending order (most recent first)
  const uniqueSortedDates = Array.from(new Set(localDates)).sort((a: string, b: string) => b.localeCompare(a));

  // 3. Get today's and yesterday's date strings in local time
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayStr = getLocalDateString(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const mostRecentWorkoutDateStr = uniqueSortedDates[0];

  // Calculate days since last workout
  const lastWorkoutDate = new Date(workouts[0].startTime);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const lastWorkoutMidnight = new Date(lastWorkoutDate);
  lastWorkoutMidnight.setHours(0, 0, 0, 0);

  const diffTime = todayMidnight.getTime() - lastWorkoutMidnight.getTime();
  const daysSinceLastWorkout = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  // If the last workout was not today or yesterday, the streak is broken (0)
  if (mostRecentWorkoutDateStr !== todayStr && mostRecentWorkoutDateStr !== yesterdayStr) {
    return { currentStreak: 0, daysSinceLastWorkout };
  }

  // Count consecutive days going backward
  let currentStreak = 0;
  const checkDate = new Date(mostRecentWorkoutDateStr === todayStr ? today : yesterday);

  while (true) {
    const checkDateStr = getLocalDateString(checkDate);
    if (uniqueSortedDates.includes(checkDateStr)) {
      currentStreak++;
      // Move checkDate back by 1 day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak, daysSinceLastWorkout };
};
