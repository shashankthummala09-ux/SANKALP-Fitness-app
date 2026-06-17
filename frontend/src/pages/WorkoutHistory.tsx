import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, AlertCircle, 
  MessageSquare, TrendingUp, Weight 
} from 'lucide-react';
import api from '../services/api';

interface SetRecord {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  restTime: number;
}

interface ExerciseMetadata {
  id: string;
  name: string;
  difficulty: string;
  equipment: string;
}

interface SessionExerciseRecord {
  id: string;
  exerciseId: string;
  note: string | null;
  exercise: ExerciseMetadata;
  sets: SetRecord[];
}

interface WorkoutSessionRecord {
  id: string;
  startTime: string;
  endTime: string;
  note: string | null;
  moodRating: number | null;
  exercises: SessionExerciseRecord[];
}

export default function WorkoutHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<WorkoutSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Expanded Session IDs
  const [expandedSessionIds, setExpandedSessionIds] = useState<string[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/workouts');
      setHistory(res.data.history);
      
      // Auto-expand the first session if available
      if (res.data.history.length > 0) {
        setExpandedSessionIds([res.data.history[0].id]);
      }
      setError('');
    } catch (err: any) {
      console.error('Error fetching workout history:', err);
      setError('Could not fetch workout history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleSessionExpand = (id: string) => {
    if (expandedSessionIds.includes(id)) {
      setExpandedSessionIds(expandedSessionIds.filter(sid => sid !== id));
    } else {
      setExpandedSessionIds([...expandedSessionIds, id]);
    }
  };

  // Helper calculations
  const getDurationMinutes = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.round(diffMs / 60000));
  };

  const calculateSessionVolume = (exercises: SessionExerciseRecord[]) => {
    return exercises.reduce((sessionTotal, ex) => {
      const exTotal = ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
      return sessionTotal + exTotal;
    }, 0);
  };

  const calculateExerciseVolume = (sets: SetRecord[]) => {
    return sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  };

  const getMoodFace = (rating: number | null) => {
    if (!rating) return '';
    const faces = ['😢', '😕', '😐', '🙂', '😄'];
    return faces[Math.max(0, Math.min(4, rating - 1))];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-brand-primary" />
            {t('workoutHistory.title')}
          </h1>
          <p className="text-brand-muted mt-1.5 text-sm sm:text-base">
            {t('workoutHistory.subtitle')}
          </p>
        </div>
        <Link
          to="/log"
          className="w-full sm:w-auto btn-primary py-2.5 px-5 flex items-center justify-center gap-2 font-bold text-center"
        >
          <Dumbbell className="h-5 w-5" />
          {t('navbar.logWorkout')}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 glass-panel max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-brand-text font-bold">{t('common.error')}</p>
          <p className="text-brand-muted text-xs mt-1">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 glass-panel max-w-xl mx-auto border border-dashed border-white/10 bg-white/[0.01]">
          <Dumbbell className="h-12 w-12 text-brand-muted/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">{t('workoutHistory.title')}</h3>
          <p className="text-brand-muted text-sm mt-1 max-w-sm mx-auto">
            {t('workoutHistory.noHistory')}
          </p>
          <Link to="/log" className="btn-primary py-2.5 px-6 mt-6 inline-block text-sm">
            {t('navbar.logWorkout')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((session) => {
            const isExpanded = expandedSessionIds.includes(session.id);
            const duration = getDurationMinutes(session.startTime, session.endTime);
            const totalVolume = calculateSessionVolume(session.exercises);
            const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            
            const sessionDate = new Date(session.startTime);
            const formattedDate = `${sessionDate.toLocaleDateString(undefined, {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })} @ ${sessionDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;

            return (
              <div 
                key={session.id}
                className={`glass-panel border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'border-brand-primary/40 shadow-glass bg-brand-card/65' 
                    : 'border-white/5 hover:border-white/10 hover:bg-brand-card/30'
                }`}
              >
                {/* Session Card Header Summary clickable */}
                <div 
                  onClick={() => toggleSessionExpand(session.id)}
                  className="p-6 cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-brand-primary font-bold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      {session.moodRating && (
                        <span className="bg-white/5 border border-white/5 rounded px-2 py-0.5 font-bold flex items-center gap-1">
                          {t('workoutHistory.moodText')}: {getMoodFace(session.moodRating)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">
                      {t('workoutHistory.sessionLog', 'Workout Session Log')}
                    </h3>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold">
                      <Clock className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>{t('workoutHistory.durationText', { minutes: duration })}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold">
                      <Dumbbell className="h-4 w-4 text-brand-accent shrink-0" />
                      <span>{t('workoutHistory.setsText', { count: totalSets })}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold">
                      <Weight className="h-4 w-4 text-brand-secondary shrink-0" />
                      <span>{t('workoutHistory.volumeText', { volume: totalVolume.toLocaleString() })}</span>
                    </div>

                    <div className="p-1 rounded-lg bg-white/5 text-brand-muted shrink-0 ml-2">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Session details details */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-brand-dark/30 p-6 space-y-6 text-sm animate-fade-in">
                    
                    {/* Overall Session notes */}
                    {session.note && (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                        <MessageSquare className="h-5 w-5 text-brand-secondary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-muted">{t('workoutHistory.sessionCommentary', 'Session Commentary')}</h4>
                          <p className="text-brand-text text-sm mt-1 leading-relaxed">{session.note}</p>
                        </div>
                      </div>
                    )}

                    {/* Exercises logged list */}
                    <div className="space-y-5">
                      <h4 className="font-extrabold text-white text-base flex items-center gap-1.5 pb-2 border-b border-white/5">
                        <TrendingUp className="h-5 w-5 text-brand-primary" />
                        {t('workoutHistory.loggedMovements', 'Logged Movements')}
                      </h4>

                      <div className="space-y-4">
                        {session.exercises.map((se) => {
                          const exVolume = calculateExerciseVolume(se.sets);
                          return (
                            <div key={se.id} className="bg-brand-card/40 border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                              
                              {/* Exercise metadata header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <h5 className="font-bold text-white text-sm flex items-center gap-2">
                                    <Dumbbell className="h-4 w-4 text-brand-accent" />
                                    {se.exercise?.name || 'Unknown Exercise'}
                                  </h5>
                                  {se.note && (
                                    <p className="text-xs text-brand-muted mt-1 italic flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" /> {t('workoutHistory.noteLabel', 'Note:')} {se.note}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/15 capitalize">
                                    {t('common.' + se.exercise?.difficulty?.toLowerCase(), se.exercise?.difficulty)}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/15 capitalize">
                                    {se.exercise?.equipment}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-white/5 text-brand-muted border border-white/5">
                                    Vol: {exVolume.toLocaleString()} {t('common.kg')}
                                  </span>
                                </div>
                              </div>

                              {/* Sets sub-table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-white/5 text-brand-muted font-semibold">
                                      <th className="py-2 pr-4 w-12 text-center">{t('workoutHistory.setHeader', 'Set')}</th>
                                      <th className="py-2 px-4 w-32">{t('workoutLogger.weightSlider').split(' ')[0]}</th>
                                      <th className="py-2 px-4 w-28">{t('workoutLogger.repsSlider')}</th>
                                      <th className="py-2 px-4">{t('workoutLogger.restSlider')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {se.sets.map((set) => (
                                      <tr key={set.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                                        <td className="py-2.5 pr-4 text-center font-bold text-brand-muted">
                                          {set.setNumber}
                                        </td>
                                        <td className="py-2.5 px-4 font-bold text-white">
                                          {set.weight} {t('common.kg')}
                                        </td>
                                        <td className="py-2.5 px-4 font-bold text-white">
                                          {set.reps} {t('common.reps')}
                                        </td>
                                        <td className="py-2.5 px-4 text-brand-accent font-semibold">
                                          {Math.floor(set.restTime / 60)}{t('common.min')} {set.restTime % 60}{t('common.sec')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
