import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Dumbbell, Search, Square, Timer, Plus, Trash2, Award, Clock, 
  Weight, Sparkles, Smile, MessageSquare, PlusCircle, Check, X, AlertCircle, RefreshCw,
  BookOpen, AlertTriangle
} from 'lucide-react';
import api from '../services/api';

interface ExerciseLookup {
  id: string;
  name: string;
  muscleGroups?: string[];
}

interface SetState {
  setNumber: number;
  weight: number; // in kg
  reps: number;
  restTime: number; // in seconds
}

interface LoggedExerciseState {
  exerciseId: string;
  name: string;
  note: string;
  sets: SetState[];
}

interface PRSummary {
  id: string;
  name: string;
  maxWeight: number;
}

interface WorkoutSummary {
  durationMinutes: number;
  totalVolume: number;
  brokenPrs: PRSummary[];
}

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Active workout states
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [workoutNote, setWorkoutNote] = useState('');
  const [moodRating, setMoodRating] = useState(4); // default to 4/5
  const [loggedExercises, setLoggedExercises] = useState<LoggedExerciseState[]>([]);

  // System states
  const [availableExercises, setAvailableExercises] = useState<ExerciseLookup[]>([]);
  const [hasLastWorkout, setHasLastWorkout] = useState(false);
  const [lastWorkoutLoading, setLastWorkoutLoading] = useState(false);
  
  // Search Exercises Modal
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Submit Success Modal
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<WorkoutSummary | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Routines / Templates states
  const [routines, setRoutines] = useState<any[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(false);
  const [isSaveRoutineModalOpen, setIsSaveRoutineModalOpen] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineSaving, setRoutineSaving] = useState(false);
  const [routineModalError, setRoutineModalError] = useState('');

  // Rest-day nudge states
  const [recentMuscles, setRecentMuscles] = useState<string[]>([]);

  // Interval reference for timer
  const timerRef = useRef<any>(null);

  // 1. Setup Timer and fetch exercises
  useEffect(() => {
    if (isWorkoutActive && startTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        
        const hours = Math.floor(diffSecs / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((diffSecs % 3600) / 60).toString().padStart(2, '0');
        const seconds = (diffSecs % 60).toString().padStart(2, '0');
        
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWorkoutActive, startTime]);

  useEffect(() => {
    const initData = async () => {
      try {
        const res = await api.get('/api/exercises');
        setAvailableExercises(res.data.exercises.map((e: any) => ({ id: e.id, name: e.name, muscleGroups: e.muscleGroups })));

        // Check if last workout exists to enable "Repeat" button
        const lastRes = await api.get('/api/workouts/last');
        if (lastRes.data.hasHistory) {
          setHasLastWorkout(true);
        }

        // Fetch routines templates
        setRoutinesLoading(true);
        const routinesRes = await api.get('/api/routines');
        setRoutines(routinesRes.data.routines);
        setRoutinesLoading(false);

        // Fetch history for nudge calculations
        const historyRes = await api.get('/api/workouts');
        const last24h = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const muscles: string[] = [];
        
        historyRes.data.history.forEach((session: any) => {
          const sessionTime = new Date(session.startTime).getTime();
          if (now - sessionTime < last24h) {
            session.exercises.forEach((se: any) => {
              if (se.exercise?.muscleGroups) {
                se.exercise.muscleGroups.forEach((m: string) => {
                  muscles.push(m.toLowerCase());
                });
              }
            });
          }
        });
        setRecentMuscles(Array.from(new Set(muscles)));
      } catch (err) {
        console.error('Error initiating workout logger page:', err);
        setRoutinesLoading(false);
      }
    };
    
    initData();
  }, []);

  const handleStartWorkout = () => {
    setStartTime(new Date());
    setIsWorkoutActive(true);
  };

  // 2. Repeat Last Workout handler
  const handleRepeatLastWorkout = async () => {
    setLastWorkoutLoading(true);
    setError('');
    try {
      const res = await api.get('/api/workouts/last');
      if (res.data.hasHistory && res.data.session) {
        const session = res.data.session;
        
        const mapped = session.exercises.map((se: any) => ({
          exerciseId: se.exerciseId,
          name: se.exercise?.name || 'Unknown Exercise',
          note: se.note || '',
          sets: se.sets.map((s: any) => ({
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            restTime: s.restTime
          }))
        }));

        setLoggedExercises(mapped);
        if (session.note) setWorkoutNote(session.note);
        if (session.moodRating) setMoodRating(session.moodRating);
        
        setStartTime(new Date());
        setIsWorkoutActive(true);
      }
    } catch (err: any) {
      console.error('Error loading last workout:', err);
      setError('Could not fetch your last workout history.');
    } finally {
      setLastWorkoutLoading(false);
    }
  };

  const handleStartRoutine = (routine: any) => {
    setStartTime(new Date());
    setIsWorkoutActive(true);
    setElapsedTime('00:00:00');

    // Pre-populate with routine exercises, each having 1 default set
    const prefilled = routine.exercises.map((re: any) => ({
      exerciseId: re.exercise.id,
      name: re.exercise.name,
      note: '',
      sets: [
        {
          setNumber: 1,
          weight: 40.0,
          reps: 10,
          restTime: 60,
        },
      ],
    }));

    setLoggedExercises(prefilled);
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) return;
    try {
      await api.delete(`/api/routines/${routineId}`);
      setRoutines(routines.filter(r => r.id !== routineId));
    } catch (err) {
      console.error('Error deleting routine:', err);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) return;
    setRoutineSaving(true);
    setRoutineModalError('');
    try {
      const exerciseIds = loggedExercises.map(e => e.exerciseId);
      await api.post('/api/routines', {
        name: routineName.trim(),
        exerciseIds
      });
      setIsSaveRoutineModalOpen(false);
      // Refresh routines list
      const routinesRes = await api.get('/api/routines');
      setRoutines(routinesRes.data.routines);
    } catch (err: any) {
      console.error('Error saving routine:', err);
      setRoutineModalError(err.response?.data?.error || 'Failed to save routine template.');
    } finally {
      setRoutineSaving(false);
    }
  };

  // Helper to determine conflicting muscles trained recently
  const getConflictingMuscles = () => {
    const activeMuscles: string[] = [];
    loggedExercises.forEach(le => {
      const matched = availableExercises.find(ae => ae.id === le.exerciseId);
      if (matched && matched.muscleGroups) {
        matched.muscleGroups.forEach(m => {
          if (recentMuscles.includes(m.toLowerCase())) {
            activeMuscles.push(m);
          }
        });
      }
    });
    return Array.from(new Set(activeMuscles));
  };

  // 3. Add Exercise to Session
  const handleAddExercise = (exercise: ExerciseLookup) => {
    // Check if already added
    if (loggedExercises.some(e => e.exerciseId === exercise.id)) {
      setIsAddExerciseModalOpen(false);
      setSearchQuery('');
      return;
    }

    const newLogged: LoggedExerciseState = {
      exerciseId: exercise.id,
      name: exercise.name,
      note: '',
      sets: [
        { setNumber: 1, weight: 20, reps: 10, restTime: 60 } // Default first set parameters
      ]
    };

    setLoggedExercises([...loggedExercises, newLogged]);
    setIsAddExerciseModalOpen(false);
    setSearchQuery('');
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setLoggedExercises(loggedExercises.filter(e => e.exerciseId !== exerciseId));
  };

  const handleExerciseNoteChange = (exerciseId: string, val: string) => {
    setLoggedExercises(loggedExercises.map(e => {
      if (e.exerciseId === exerciseId) {
        return { ...e, note: val };
      }
      return e;
    }));
  };

  // 4. Sets CRUD
  const handleAddSet = (exerciseId: string) => {
    setLoggedExercises(loggedExercises.map(e => {
      if (e.exerciseId === exerciseId) {
        const lastSet = e.sets[e.sets.length - 1];
        const newSet: SetState = {
          setNumber: e.sets.length + 1,
          weight: lastSet ? lastSet.weight : 20,
          reps: lastSet ? lastSet.reps : 10,
          restTime: lastSet ? lastSet.restTime : 60
        };
        return { ...e, sets: [...e.sets, newSet] };
      }
      return e;
    }));
  };

  const handleRemoveSet = (exerciseId: string, setNumber: number) => {
    setLoggedExercises(loggedExercises.map(e => {
      if (e.exerciseId === exerciseId) {
        const filtered = e.sets.filter(s => s.setNumber !== setNumber);
        // Re-index sets
        const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...e, sets: reindexed };
      }
      return e;
    }));
  };

  const handleSetFieldChange = (
    exerciseId: string, 
    setNumber: number, 
    field: keyof SetState, 
    value: number
  ) => {
    setLoggedExercises(loggedExercises.map(e => {
      if (e.exerciseId === exerciseId) {
        const updatedSets = e.sets.map(s => {
          if (s.setNumber === setNumber) {
            return { ...s, [field]: value };
          }
          return s;
        });
        return { ...e, sets: updatedSets };
      }
      return e;
    }));
  };

  // 5. Volume tracker calculation
  const calculateTotalVolume = () => {
    return loggedExercises.reduce((total, ex) => {
      const exVol = ex.sets.reduce((exTotal, set) => exTotal + (set.weight * set.reps), 0);
      return total + exVol;
    }, 0);
  };

  // 6. Submit handler
  const handleFinishWorkout = async () => {
    setError('');

    if (loggedExercises.length === 0) {
      setError('Please add at least one exercise to your session.');
      return;
    }

    // Verify all exercises have at least one set
    for (const ex of loggedExercises) {
      if (ex.sets.length === 0) {
        setError(`Please add at least one set for exercise "${ex.name}" or remove it.`);
        return;
      }
    }

    setSubmitting(true);
    const endTime = new Date();

    try {
      const res = await api.post('/api/workouts/log', {
        startTime: startTime ? startTime.toISOString() : new Date().toISOString(),
        endTime: endTime.toISOString(),
        note: workoutNote.trim() || undefined,
        moodRating: moodRating,
        exercises: loggedExercises.map(e => ({
          exerciseId: e.exerciseId,
          note: e.note.trim() || undefined,
          sets: e.sets
        }))
      });

      if (timerRef.current) clearInterval(timerRef.current);
      setSummaryData(res.data.summary);
      setIsSummaryModalOpen(true);
    } catch (err: any) {
      console.error('Error logging session:', err);
      setError(err.response?.data?.error || 'Failed to submit workout. Please verify your connection.');
      setSubmitting(false);
    }
  };

  // Filter exercises by query
  const filteredAvailableExercises = availableExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isWorkoutActive) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Pane: Ready to Train Card */}
          <div className="glass-panel p-8 sm:p-10 border border-white/10 shadow-[0_8px_32px_0_rgba(255,107,0,0.15)] flex flex-col justify-between space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shadow-[0_0_20px_rgba(255,107,0,0.15)]">
                  <Dumbbell className="h-8 w-8 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {t('workoutLogger.readyToTrain', 'Ready to Train?')}
              </h2>
              <p className="text-brand-muted text-xs max-w-sm mx-auto leading-relaxed">
                {t('workoutLogger.readyToTrainDesc', 'Log your movements, track your lifted weight volume, and set new personal records.')}
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <button
                onClick={handleStartWorkout}
                className="w-full btn-primary py-3 font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/10"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                {t('workoutLogger.startEmptyWorkout', 'Start an Empty Workout')}
              </button>

              {hasLastWorkout && (
                <button
                  onClick={handleRepeatLastWorkout}
                  disabled={lastWorkoutLoading}
                  className="w-full btn-secondary py-3 font-bold text-sm flex justify-center items-center gap-2 cursor-pointer border border-brand-primary/10 hover:border-brand-primary/30 text-brand-text"
                >
                  {lastWorkoutLoading ? (
                    <RefreshCw className="h-4.5 w-4.5 animate-spin text-brand-primary" />
                  ) : (
                    <RefreshCw className="h-4.5 w-4.5 text-brand-primary" />
                  )}
                  {t('workoutLogger.repeatLast', 'Repeat Last Workout')}
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 text-[10px] text-brand-muted">
              {t('common.tagline', 'Where every transformation begins')}
            </div>
          </div>

          {/* Right Pane: My Routines Card */}
          <div className="glass-panel p-8 sm:p-10 border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4 flex-grow flex flex-col">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                <BookOpen className="h-5 w-5 text-brand-primary" />
                {t('workoutLogger.myRoutines', 'My Routines')}
              </h3>

              {routinesLoading ? (
                <div className="flex-grow flex items-center justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-brand-primary" />
                </div>
               ) : routines.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-10 text-center text-brand-muted space-y-3">
                  <Sparkles className="h-8 w-8 text-brand-muted/30 animate-pulse" />
                  <p className="font-semibold text-white text-sm">No Saved Routines</p>
                  <p className="text-xs max-w-xs leading-relaxed">
                    Create templates during active sessions to trigger workout configurations instantly.
                  </p>
                </div>
               ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {routines.map((routine) => (
                    <div key={routine.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-all">
                      <div className="space-y-0.5 text-left max-w-[200px]">
                        <span className="font-bold text-sm text-white block truncate">{routine.name}</span>
                        <span className="text-[10px] text-brand-muted block truncate">
                          {routine.exercises.map((re: any) => re.exercise.name).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStartRoutine(routine)}
                          className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/20 text-brand-muted hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 sm:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-secondary"></span>
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('workoutLogger.title')}</h1>
          </div>
          
          <div className="flex items-center gap-2 text-brand-muted text-sm font-semibold">
            <Clock className="h-4 w-4 text-brand-primary" />
            {t('workoutLogger.startedAt', 'Started at:')} {startTime ? startTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ''}
          </div>
        </div>

        {/* Stopwatch & Action buttons */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Glowing Stopwatch */}
          <div className="flex items-center gap-2 bg-brand-dark/80 border border-brand-primary/30 rounded-xl px-5 py-2.5 shadow-[0_0_15px_rgba(255,107,0,0.15)] font-mono text-2xl text-white font-bold tracking-widest min-w-[160px] justify-center select-none">
            <Timer className="h-5.5 w-5.5 text-brand-primary animate-pulse" />
            {elapsedTime}
          </div>

          {/* Quick Repeat Button */}
          {hasLastWorkout && loggedExercises.length === 0 && (
            <button
              onClick={handleRepeatLastWorkout}
              disabled={lastWorkoutLoading}
              className="flex-grow md:flex-grow-0 btn-secondary py-2.5 px-4 flex items-center justify-center gap-2 text-sm cursor-pointer border-brand-primary/20 hover:border-brand-primary/50 text-brand-text font-bold"
            >
              {lastWorkoutLoading ? (
                <RefreshCw className="h-4.5 w-4.5 animate-spin text-brand-primary" />
              ) : (
                <RefreshCw className="h-4.5 w-4.5 text-brand-primary" />
              )}
              {t('workoutLogger.repeatLast')}
            </button>
          )}

          {/* Save as Routine Button */}
          {loggedExercises.length > 0 && (
            <button
              onClick={() => {
                setRoutineName('');
                setRoutineModalError('');
                setIsSaveRoutineModalOpen(true);
              }}
              className="flex-grow md:flex-grow-0 btn-secondary py-2.5 px-4 flex items-center justify-center gap-2 text-sm cursor-pointer border-brand-primary/20 hover:border-brand-primary/50 text-brand-text font-bold"
            >
              <BookOpen className="h-4.5 w-4.5 text-brand-primary" />
              {t('workoutLogger.saveAsRoutine', 'Save as Routine')}
            </button>
          )}

          {/* Finish workout button */}
          <button
            onClick={handleFinishWorkout}
            disabled={submitting}
            className="flex-grow md:flex-grow-0 btn-primary py-2.5 px-6 font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-secondary/15"
          >
            <Square className="h-4 w-4" />
            {submitting ? t('workoutLogger.finishing') : t('workoutLogger.finishSession')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Logging Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left / Center: Session Logged Exercises */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rest-Day Muscle Nudge */}
          {loggedExercises.length > 0 && getConflictingMuscles().length > 0 && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400 flex items-start gap-3 shadow-md">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5 animate-pulse" />
              <div>
                <p className="font-bold text-white mb-0.5">{t('workoutLogger.nudgeTitle', 'Rest-Day Muscle Nudge')}</p>
                <p className="text-xs">
                  {t('workoutLogger.nudgeText', 'You trained {{muscles}} yesterday — consider giving these muscles a rest today to support optimal recovery.', { muscles: getConflictingMuscles().join(', ') })}
                </p>
              </div>
            </div>
          )}

          {loggedExercises.length === 0 ? (
            <div className="text-center py-20 glass-panel border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center">
              <Dumbbell className="h-16 w-16 text-brand-muted/30 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white">{t('workoutLogger.noExercisesLogged')}</h3>
              <button
                onClick={() => setIsAddExerciseModalOpen(true)}
                className="btn-primary py-2.5 px-6 mt-6 flex items-center gap-2 font-bold cursor-pointer text-sm"
              >
                <PlusCircle className="h-5 w-5" />
                {t('workoutLogger.addExerciseBtn')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {loggedExercises.map((ex) => (
                <div key={ex.exerciseId} className="glass-panel p-6 border border-white/5 space-y-5">
                  
                  {/* Exercise header */}
                  <div className="flex justify-between items-start gap-4 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-brand-primary" />
                        {ex.name}
                      </h3>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveExercise(ex.exerciseId)}
                      className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Sets table / sliders */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {ex.sets.map((set) => (
                        <div 
                          key={set.setNumber}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 bg-brand-dark/50 border border-white/5 rounded-xl text-sm"
                        >
                          {/* Set Label */}
                          <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 font-extrabold text-brand-muted">
                              {set.setNumber}
                            </span>
                            <span className="sm:hidden text-xs text-brand-muted uppercase font-bold">{t('workoutLogger.parameters', 'Parameters:')}</span>
                            {ex.sets.length > 1 && (
                              <button
                                onClick={() => handleRemoveSet(ex.exerciseId, set.setNumber)}
                                className="sm:hidden text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" /> {t('common.delete')}
                              </button>
                            )}
                          </div>

                          {/* Weight Slider/Input */}
                          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                            {/* Weight */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-brand-muted">
                                <span className="flex items-center gap-1">
                                  <Weight className="h-3.5 w-3.5 text-brand-primary" /> {t('workoutLogger.weightSlider').split(' ')[0]}
                                </span>
                                <span className="text-white font-bold">{set.weight} {t('common.kg')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0.0"
                                  max="200.0"
                                  step="2.5"
                                  value={set.weight}
                                  onChange={(e) => handleSetFieldChange(ex.exerciseId, set.setNumber, 'weight', parseFloat(e.target.value))}
                                  className="w-full h-1.5 rounded-lg bg-white/10 accent-brand-primary cursor-pointer"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="999"
                                  step="0.5"
                                  value={set.weight}
                                  onChange={(e) => handleSetFieldChange(ex.exerciseId, set.setNumber, 'weight', parseFloat(e.target.value) || 0)}
                                  className="w-16 bg-brand-dark/80 border border-white/10 rounded px-1.5 py-0.5 text-center text-xs font-bold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                            </div>

                            {/* Reps */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-brand-muted">
                                <span>{t('workoutLogger.repsSlider')}</span>
                                <span className="text-white font-bold">{set.reps} {t('common.reps')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="1"
                                  max="30"
                                  step="1"
                                  value={set.reps}
                                  onChange={(e) => handleSetFieldChange(ex.exerciseId, set.setNumber, 'reps', parseInt(e.target.value))}
                                  className="w-full h-1.5 rounded-lg bg-white/10 accent-brand-secondary cursor-pointer"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={set.reps}
                                  onChange={(e) => handleSetFieldChange(ex.exerciseId, set.setNumber, 'reps', parseInt(e.target.value) || 1)}
                                  className="w-12 bg-brand-dark/80 border border-white/10 rounded px-1.5 py-0.5 text-center text-xs font-bold focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Rest Time Slider */}
                          <div className="shrink-0 flex items-center gap-3 text-xs w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0">
                            <div className="space-y-1 w-full">
                              <div className="flex justify-between font-semibold text-brand-muted">
                                <span>{t('workoutLogger.restSlider')}</span>
                                <span className="text-brand-accent font-bold">
                                  {Math.floor(set.restTime / 60)}{t('common.min')} {set.restTime % 60}{t('common.sec')}
                                </span>
                              </div>
                              <input
                                  type="range"
                                  min="0"
                                  max="300"
                                  step="15"
                                  value={set.restTime}
                                  onChange={(e) => handleSetFieldChange(ex.exerciseId, set.setNumber, 'restTime', parseInt(e.target.value))}
                                  className="w-full sm:w-36 h-1 rounded-lg bg-white/10 accent-brand-accent cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Desktop Delete button */}
                          {ex.sets.length > 1 && (
                            <button
                              onClick={() => handleRemoveSet(ex.exerciseId, set.setNumber)}
                              className="hidden sm:block p-1 text-brand-muted hover:text-red-400 rounded transition cursor-pointer"
                              title={t('common.delete')}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <button
                        onClick={() => handleAddSet(ex.exerciseId)}
                        className="btn-secondary py-2 text-xs flex justify-center items-center gap-1 cursor-pointer w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4" /> {t('workoutLogger.addSet', 'Add Set')}
                      </button>

                      {/* Exercise Note input */}
                      <div className="relative flex-grow">
                        <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-muted" />
                        <input
                          type="text"
                          placeholder={t('workoutLogger.exerciseNotePlaceholder')}
                          value={ex.note}
                          onChange={(e) => handleExerciseNoteChange(ex.exerciseId, e.target.value)}
                          className="glass-input w-full !pl-10 py-2 text-xs"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Exercise Trigger Button */}
          {loggedExercises.length > 0 && (
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="w-full btn-secondary border-dashed py-4 border-white/10 bg-white/[0.01] hover:border-brand-primary/40 text-brand-primary flex items-center justify-center gap-2 cursor-pointer font-bold rounded-xl"
            >
              <PlusCircle className="h-5 w-5" />
              {t('workoutLogger.addExerciseBtn')}
            </button>
          )}

        </div>

        {/* Right Pane: Session Stats & Overall Notes */}
        <div className="space-y-6">
          {/* Summary stats tracker panel */}
          <div className="glass-panel p-6 border border-white/5 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2.5 border-b border-white/5">
              <Sparkles className="h-5 w-5 text-brand-primary" />
              {t('workoutLogger.sessionInsights', 'Session Insights')}
            </h3>

            {/* Total volume tracker badge */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('workoutLogger.estimatedLoadVolume', 'Estimated Load Volume')}</p>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary tracking-tight">
                  {calculateTotalVolume().toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-brand-muted">{t('common.kg')}</span>
              </div>
            </div>

            {/* Count summaries */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-brand-dark/50 border border-white/5 rounded-xl p-3 text-center">
                <span className="block text-2xl font-extrabold text-white">{loggedExercises.length}</span>
                <span className="text-[10px] text-brand-muted uppercase font-bold">{t('workoutLogger.exercisesCount', 'Exercises')}</span>
              </div>
              <div className="bg-brand-dark/50 border border-white/5 rounded-xl p-3 text-center">
                <span className="block text-2xl font-extrabold text-white">
                  {loggedExercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                </span>
                <span className="text-[10px] text-brand-muted uppercase font-bold">{t('workoutLogger.totalSets', 'Total Sets')}</span>
              </div>
            </div>
          </div>

          {/* Session details note */}
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Smile className="h-5 w-5 text-brand-secondary" />
              {t('workoutLogger.workoutDetails', 'Workout Details')}
            </h3>

            {/* Mood selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                {t('workoutLogger.moodRating', 'Session Mood / Energy Rating')}
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((stars) => {
                  const faces = ['😢', '😕', '😐', '🙂', '😄'];
                  const isActive = moodRating === stars;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setMoodRating(stars)}
                      className={`text-2xl p-2.5 rounded-xl transition duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-brand-primary/25 scale-110 shadow-glass border border-brand-primary/50' 
                          : 'bg-white/5 border border-transparent hover:bg-white/10'
                      }`}
                    >
                      {faces[stars - 1]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Note text field */}
            <div className="space-y-1.5 pt-1.5">
              <label htmlFor="sessionNote" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                {t('workoutLogger.sessionNotes', 'Workout Session Notes')}
              </label>
              <textarea
                id="sessionNote"
                rows={3}
                placeholder={t('workoutLogger.notesPlaceholder')}
                value={workoutNote}
                onChange={(e) => setWorkoutNote(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Select Exercise Search Dialog */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsAddExerciseModalOpen(false)} 
            className="absolute inset-0 bg-brand-dark/85 backdrop-blur-sm cursor-pointer"
          ></div>

          {/* Dialog Panel */}
          <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5 z-10 animate-scale-up max-h-[80vh] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-brand-primary" />
                {t('workoutLogger.selectMovement', 'Select Movement Pattern')}
              </h3>
              <button 
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="text-brand-muted hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-brand-muted" />
              <input
                type="text"
                autoFocus
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full !pl-12 text-sm py-2"
              />
            </div>

            {/* Matches list */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-1.5 max-h-[40vh] py-2">
              {filteredAvailableExercises.length > 0 ? (
                filteredAvailableExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex)}
                    className="w-full text-left p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-brand-primary/10 hover:border-brand-primary/30 transition-all flex justify-between items-center cursor-pointer group text-sm"
                  >
                    <span className="font-bold text-white group-hover:text-brand-primary transition-colors">
                      {ex.name}
                    </span>
                    <Plus className="h-4 w-4 text-brand-muted group-hover:text-brand-primary transition-colors" />
                  </button>
                ))
              ) : (
                <p className="text-xs text-brand-muted text-center py-6">
                  {t('exerciseLibrary.noExercises')}
                </p>
              )}
            </div>

            <div className="pt-2 shrink-0 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="btn-secondary py-2 text-xs"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Routine Dialog */}
      {isSaveRoutineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSaveRoutineModalOpen(false)} 
            className="absolute inset-0 bg-brand-dark/85 backdrop-blur-sm cursor-pointer"
          ></div>

          {/* Dialog Panel */}
          <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5 z-10 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary" />
                {t('workoutLogger.saveRoutineTemplate', 'Save Routine Template')}
              </h3>
              <button 
                onClick={() => setIsSaveRoutineModalOpen(false)}
                className="text-brand-muted hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {routineModalError && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{routineModalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="routineName" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  {t('workoutLogger.routineNameLabel', 'Routine Name')}
                </label>
                <input
                  id="routineName"
                  type="text"
                  autoFocus
                  placeholder={t('workoutLogger.routineNamePlaceholder', 'e.g. Push Day, Upper Body')}
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  className="glass-input w-full text-sm py-2"
                />
              </div>

              <div className="text-xs text-brand-muted leading-relaxed text-left">
                {t('workoutLogger.saveRoutineInfo', 'Saving as routine will record the list of selected movements so you can load them instantly in your next session.')}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaveRoutineModalOpen(false)}
                  className="w-1/2 btn-secondary py-2.5 text-xs font-bold"
                  disabled={routineSaving}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoutine}
                  className="w-1/2 btn-primary py-2.5 text-xs font-bold cursor-pointer"
                  disabled={routineSaving || !routineName.trim()}
                >
                  {routineSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save Routine')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Summary Stats Modal */}
      {isSummaryModalOpen && summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md"></div>

          {/* Glowing Dialog Panel */}
          <div className="relative w-full max-w-lg glass-panel p-8 sm:p-10 border border-brand-primary/30 shadow-[0_0_50px_rgba(255,107,0,0.25)] text-center space-y-6 z-10 animate-scale-up">
            
            {/* Header / Celebration */}
            <div className="space-y-2.5">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary shadow-[0_0_20px_rgba(255,107,0,0.4)]">
                  <Award className="h-10 w-10 animate-bounce" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary tracking-tight">
                {t('workoutLogger.congratsTitle')}
              </h2>
              <p className="text-brand-muted text-sm max-w-sm mx-auto">
                {t('workoutLogger.congratsSubtitle')}
              </p>
            </div>

            {/* Session Stats widgets */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="glass-panel bg-brand-dark/60 p-4 border border-white/5">
                <span className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('workoutLogger.duration')}</span>
                <span className="block text-2xl font-extrabold text-white mt-1.5 flex items-center justify-center gap-1">
                  <Clock className="h-4.5 w-4.5 text-brand-primary" />
                  {summaryData.durationMinutes} <span className="text-xs font-medium text-brand-muted">{t('common.min')}</span>
                </span>
              </div>
              <div className="glass-panel bg-brand-dark/60 p-4 border border-white/5">
                <span className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">{t('workoutLogger.volume')}</span>
                <span className="block text-2xl font-extrabold text-white mt-1.5 flex items-center justify-center gap-1">
                  <Weight className="h-4.5 w-4.5 text-brand-secondary" />
                  {summaryData.totalVolume.toLocaleString()} <span className="text-xs font-medium text-brand-muted">{t('common.kg')}</span>
                </span>
              </div>
            </div>

            {/* Broken PRs List */}
            {summaryData.brokenPrs.length > 0 ? (
              <div className="max-w-sm mx-auto bg-brand-secondary/5 border border-brand-secondary/20 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-brand-secondary text-sm flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  {t('workoutLogger.prCount')}
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {summaryData.brokenPrs.map((pr) => (
                    <div key={pr.id} className="flex justify-between items-center text-xs text-brand-text bg-brand-dark/30 rounded-lg px-3 py-2 border border-white/5">
                      <span className="font-bold text-left">{pr.name}</span>
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                        {pr.maxWeight} {t('common.kg')} max
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-brand-muted py-2">
                {t('workoutLogger.keepPushing', 'Keep pushing! Track weights regularly to hit new personal limits.')}
              </div>
            )}

            {/* Direct Back to dashboard */}
            <div className="pt-4 max-w-sm mx-auto">
              <button
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full btn-primary py-3 font-bold text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="h-5 w-5" />
                {t('workoutLogger.goToDashboard', 'Go to Dashboard')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
