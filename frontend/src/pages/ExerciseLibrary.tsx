import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Dumbbell, AlertTriangle, Lightbulb, 
  Wind, ChevronDown, ChevronUp, Plus, Edit2, Trash2, X, AlertCircle, Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  difficulty: string;
  equipment: string;
  gifUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  formSteps: string[];
  commonMistakes: string[];
  proTips: string[];
  breathingCue?: string;
}

const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'forearms', name: 'Forearms' },
  { id: 'quads', name: 'Quads' },
  { id: 'hamstrings', name: 'Hamstrings' },
  { id: 'calves', name: 'Calves' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'core', name: 'Core' },
  { id: 'full body', name: 'Full Body' },
  { id: 'cardio', name: 'Cardio' }
];

const EQUIPMENTS = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Kettlebell'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function ExerciseThumbnail({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0 relative flex items-center justify-center">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40">
          <div className="h-4 w-4 rounded-full bg-brand-primary animate-pulse" />
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center h-full w-full bg-white/5 text-brand-muted/40">
          <Dumbbell className="h-6 w-6" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function ExerciseMedia({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-brand-dark/50 flex items-center justify-center shadow-inner">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/80 z-10 space-y-2">
          <Dumbbell className="h-8 w-8 text-brand-primary animate-spin" />
          <span className="text-[10px] text-brand-muted uppercase tracking-wider font-bold">Loading demo...</span>
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/80 text-brand-muted p-4 text-center">
          <AlertCircle className="h-8 w-8 text-rose-400 mb-2" />
          <span className="text-xs font-semibold">Demonstration failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default function ExerciseLibrary() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  
  // Expanded Exercise IDs
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // CRUD Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Exercise Form fields
  const [formName, setFormName] = useState('');
  const [formMuscles, setFormMuscles] = useState<string[]>([]);
  const [formDifficulty, setFormDifficulty] = useState('Beginner');
  const [formEquipment, setFormEquipment] = useState('Barbell');
  const [formSteps, setFormSteps] = useState<string[]>(['']);
  const [formMistakes, setFormMistakes] = useState<string[]>(['']);
  const [formTips, setFormTips] = useState<string[]>(['']);
  const [formBreathing, setFormBreathing] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

  const getDifficultyTranslation = (diff: string) => {
    switch (diff) {
      case 'Beginner': return t('common.beginner', 'Beginner');
      case 'Intermediate': return t('common.intermediate', 'Intermediate');
      case 'Advanced': return t('common.advanced', 'Advanced');
      default: return diff;
    }
  };

  const getEquipmentTranslation = (eq: string) => {
    switch (eq.toLowerCase()) {
      case 'barbell': return t('exerciseLibrary.equipments.barbell', 'Barbell');
      case 'dumbbell': return t('exerciseLibrary.equipments.dumbbell', 'Dumbbell');
      case 'bodyweight': return t('exerciseLibrary.equipments.bodyweight', 'Bodyweight');
      case 'machine': return t('exerciseLibrary.equipments.machine', 'Machine');
      case 'kettlebell': return t('exerciseLibrary.equipments.kettlebell', 'Kettlebell');
      default: return eq;
    }
  };

  const getMuscleTranslation = (mCode: string) => {
    return t(`exerciseLibrary.muscles.${mCode}`, mCode);
  };

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedMuscle) params.append('muscleGroup', selectedMuscle);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedEquipment) params.append('equipment', selectedEquipment);

      const res = await api.get(`/api/exercises?${params.toString()}`);
      setExercises(res.data.exercises);
      setError('');
    } catch (err: any) {
      console.error('Error fetching exercises:', err);
      setError(t('exerciseLibrary.loadFailed', 'Failed to fetch exercises. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExercises();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedMuscle, selectedDifficulty, selectedEquipment]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleMuscleSelect = (muscleId: string) => {
    setSelectedMuscle(selectedMuscle === muscleId ? null : muscleId);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMuscle(null);
    setSelectedDifficulty('');
    setSelectedEquipment('');
  };

  // CRUD Form handlers
  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormName('');
    setFormMuscles([]);
    setFormDifficulty('Beginner');
    setFormEquipment('Barbell');
    setFormSteps(['']);
    setFormMistakes(['']);
    setFormTips(['']);
    setFormBreathing('');
    setFormImageUrl('');
    setFormVideoUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setModalMode('edit');
    setEditingId(exercise.id);
    setFormName(exercise.name);
    setFormMuscles(exercise.muscleGroups);
    setFormDifficulty(exercise.difficulty);
    setFormEquipment(exercise.equipment);
    setFormSteps(exercise.formSteps.length > 0 ? [...exercise.formSteps] : ['']);
    setFormMistakes(exercise.commonMistakes.length > 0 ? [...exercise.commonMistakes] : ['']);
    setFormTips(exercise.proTips.length > 0 ? [...exercise.proTips] : ['']);
    setFormBreathing(exercise.breathingCue || '');
    setFormImageUrl(exercise.imageUrl || '');
    setFormVideoUrl(exercise.videoUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>, currentVal: string[]) => {
    setter([...currentVal, '']);
  };

  const handleRemoveField = (setter: React.Dispatch<React.SetStateAction<string[]>>, currentVal: string[], index: number) => {
    const newVal = [...currentVal];
    newVal.splice(index, 1);
    setter(newVal.length > 0 ? newVal : ['']);
  };

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, currentVal: string[], index: number, value: string) => {
    const newVal = [...currentVal];
    newVal[index] = value;
    setter(newVal);
  };

  const handleMuscleToggle = (muscleId: string) => {
    if (formMuscles.includes(muscleId)) {
      setFormMuscles(formMuscles.filter(id => id !== muscleId));
    } else {
      setFormMuscles([...formMuscles, muscleId]);
    }
  };

  const handleDeleteExercise = async (id: string, name: string) => {
    const confirmMsg = t('exerciseLibrary.deleteConfirm', 'Are you sure you want to delete this exercise? This will delete all associated logs.');
    if (!window.confirm(`${confirmMsg} (${name})`)) {
      return;
    }

    try {
      await api.delete(`/api/exercises/${id}`);
      fetchExercises();
    } catch (err: any) {
      console.error('Delete exercise error:', err);
      alert(err.response?.data?.error || 'Failed to delete exercise.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Please enter an exercise name.');
      return;
    }

    if (formMuscles.length === 0) {
      setFormError('Please select at least one target muscle group.');
      return;
    }

    const cleanedSteps = formSteps.filter(s => s.trim() !== '');
    if (cleanedSteps.length === 0) {
      setFormError('Please provide at least one execution step.');
      return;
    }

    const cleanedMistakes = formMistakes.filter(s => s.trim() !== '');
    const cleanedTips = formTips.filter(s => s.trim() !== '');

    setFormSubmitting(true);

    const payload = {
      name: formName.trim(),
      muscleGroups: formMuscles,
      difficulty: formDifficulty,
      equipment: formEquipment,
      formSteps: cleanedSteps,
      commonMistakes: cleanedMistakes,
      proTips: cleanedTips,
      breathingCue: formBreathing.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      videoUrl: formVideoUrl.trim() || undefined
    };

    try {
      if (modalMode === 'create') {
        await api.post('/api/exercises', payload);
      } else {
        await api.put(`/api/exercises/${editingId}`, payload);
      }
      setIsModalOpen(false);
      fetchExercises();
    } catch (err: any) {
      console.error('Save exercise error:', err);
      setFormError(err.response?.data?.error || 'Failed to save exercise.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t('exerciseLibrary.title', 'Exercise Library')}
          </h1>
          <p className="text-brand-muted mt-1.5 text-sm sm:text-base">
            {t('exerciseLibrary.subtitle', 'Browse step-by-step form guides for all major movement patterns.')}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto btn-primary py-2.5 px-5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            {t('exerciseLibrary.addNewExercise', 'Add Custom Exercise')}
          </button>
        )}
      </div>

      {/* Muscle Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-secondary" />
            {t('exerciseLibrary.muscleCategories', 'Muscle Categories')}
          </h2>
          {selectedMuscle && (
            <button 
              onClick={() => setSelectedMuscle(null)} 
              className="text-xs text-brand-secondary hover:underline cursor-pointer"
            >
              {t('exerciseLibrary.clearCategoryFilter', 'Clear Category Filter')}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {MUSCLE_GROUPS.map((m) => {
            const isActive = selectedMuscle === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMuscleSelect(m.id)}
                className={`group text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden select-none cursor-pointer flex flex-col justify-between h-24 ${
                  isActive 
                    ? 'border-brand-primary bg-brand-primary/10 shadow-glass-sm' 
                    : 'border-white/5 bg-brand-card/30 hover:border-white/20 hover:bg-brand-card/50'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary opacity-80" />
                <span className="text-xs text-brand-muted font-medium uppercase tracking-wider group-hover:text-brand-text">Target</span>
                <span className="text-sm font-extrabold text-white tracking-tight break-words pr-2">
                  {getMuscleTranslation(m.id)}
                </span>
                {isActive && (
                  <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-brand-primary animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel p-5 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-muted" />
            <input
              type="text"
              placeholder={t('exerciseLibrary.searchPlaceholder', 'Search exercise name or keyword...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full !pl-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
              {t('exerciseLibrary.filtersLabel', 'Filters:')}
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="glass-input text-sm py-1.5 bg-brand-dark text-white cursor-pointer"
            >
              <option value="">{t('exerciseLibrary.allDifficulties', 'All Difficulties')}</option>
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{getDifficultyTranslation(d)}</option>
              ))}
            </select>

            {/* Equipment Filter */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="glass-input text-sm py-1.5 bg-brand-dark text-white cursor-pointer"
            >
              <option value="">{t('exerciseLibrary.allEquipment', 'All Equipment')}</option>
              {EQUIPMENTS.map(e => (
                <option key={e} value={e}>{getEquipmentTranslation(e)}</option>
              ))}
            </select>

            {(selectedDifficulty || selectedEquipment || searchQuery || selectedMuscle) && (
              <button
                onClick={resetFilters}
                className="text-xs py-1.5 px-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white transition cursor-pointer"
              >
                {t('common.reset', 'Reset')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exercises Listings */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 glass-panel max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-brand-text font-bold">{t('exerciseLibrary.loadFailed', 'Failed to load exercises')}</p>
          <p className="text-brand-muted text-xs mt-1">{error}</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 glass-panel max-w-xl mx-auto border border-dashed border-white/10 bg-white/[0.01]">
          <Dumbbell className="h-12 w-12 text-brand-muted/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">{t('exerciseLibrary.noExercises', 'No Exercises Match Criteria')}</h3>
          <p className="text-brand-muted text-sm mt-1 max-w-md mx-auto">
            {t('exerciseLibrary.noExercisesDesc', 'Try adjusting your search terms, clearing selected muscle categories, or resetting difficulty and equipment filters.')}
          </p>
          <button onClick={resetFilters} className="btn-secondary py-2 px-5 mt-6 text-sm cursor-pointer">
            {t('exerciseLibrary.clearFilters', 'Clear Filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((exercise) => {
            const isExpanded = expandedId === exercise.id;
            
            return (
              <div 
                key={exercise.id}
                className={`glass-panel border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isExpanded 
                    ? 'border-brand-primary/45 shadow-glass bg-brand-card/60' 
                    : 'border-white/5 hover:border-white/10 hover:bg-brand-card/30'
                }`}
              >
                {/* Top overview card summary */}
                <div 
                  onClick={() => toggleExpand(exercise.id)}
                  className="p-6 cursor-pointer flex justify-between items-start gap-4 select-none"
                >
                  <div className="flex gap-4 items-start flex-grow">
                    {/* Thumbnail */}
                    {exercise.imageUrl && (
                      <ExerciseThumbnail src={exercise.imageUrl} alt={exercise.name} />
                    )}
                    <div className="space-y-2.5 flex-grow">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                          {getDifficultyTranslation(exercise.difficulty)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                          {getEquipmentTranslation(exercise.equipment)}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-white tracking-tight">{exercise.name}</h3>

                      {/* Muscle group chips */}
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscleGroups.map(mg => (
                          <span key={mg} className="text-[10px] bg-white/5 border border-white/5 rounded px-2 py-0.5 text-brand-muted capitalize font-semibold">
                            {getMuscleTranslation(mg)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAuthenticated && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(exercise)}
                          className="p-2 text-brand-muted hover:text-brand-primary hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title={t('exerciseLibrary.editExercise', 'Edit Exercise')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
                          className="p-2 text-brand-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                          title={t('common.delete', 'Delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="p-1.5 rounded-lg bg-white/5 text-brand-muted">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-6 bg-brand-dark/35 space-y-6 text-sm animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left side: Media Preview */}
                      <div className="lg:col-span-5 space-y-3">
                        {(exercise.videoUrl || exercise.gifUrl || exercise.imageUrl) ? (
                          <ExerciseMedia 
                            src={exercise.videoUrl || exercise.gifUrl || exercise.imageUrl || ''} 
                            alt={exercise.name} 
                          />
                        ) : (
                          <div className="w-full aspect-video rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-brand-muted">
                            <Dumbbell className="h-10 w-10 mb-2 opacity-30 animate-pulse" />
                            <span className="text-xs">{t('exerciseLibrary.noMedia', 'No demonstration available')}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-brand-muted text-center italic">
                          {t('exerciseLibrary.mediaNotice', 'Demonstrations are sourced from open-source fitness archives')}
                        </div>
                      </div>

                      {/* Right side: Instructions & Tips */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Setup step directions */}
                        <div className="space-y-2.5">
                          <h4 className="font-bold text-white text-base flex items-center gap-2">
                            <SlidersHorizontal className="h-4.5 w-4.5 text-brand-primary" />
                            {t('exerciseLibrary.steps', 'Step-by-Step Instructions')}
                          </h4>
                          <ol className="list-decimal pl-5 space-y-2 text-brand-text/90">
                            {exercise.formSteps.map((step, idx) => (
                              <li key={idx} className="pl-1 leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Common Mistakes */}
                        {exercise.commonMistakes.length > 0 && (
                          <div className="space-y-2.5">
                            <h4 className="font-bold text-white text-base flex items-center gap-2">
                              <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                              {t('exerciseLibrary.mistakes', 'Common Mistakes to Avoid')}
                            </h4>
                            <ul className="space-y-1.5 pl-1.5 text-brand-muted">
                              {exercise.commonMistakes.map((mistake, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-rose-400 shrink-0 text-sm mt-0.5">•</span>
                                  <span>{mistake}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Pro Tips */}
                        {exercise.proTips.length > 0 && (
                          <div className="space-y-2.5">
                            <h4 className="font-bold text-white text-base flex items-center gap-2">
                              <Lightbulb className="h-4.5 w-4.5 text-yellow-400" />
                              {t('exerciseLibrary.tips', 'Performance Pro-Tips')}
                            </h4>
                            <ul className="space-y-1.5 pl-1.5 text-brand-muted">
                              {exercise.proTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-yellow-400 shrink-0 text-sm mt-0.5">★</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Breathing Cue */}
                        {exercise.breathingCue && (
                          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-4 flex gap-3 items-start">
                            <Wind className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-white text-sm">
                                {t('exerciseLibrary.breathing', 'Breathing Cue Pattern')}
                              </h4>
                              <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                                {exercise.breathingCue}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Exercise Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="fixed inset-0 bg-brand-dark/85 backdrop-blur-sm cursor-pointer"
          ></div>

          <div className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 z-10 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="h-5.5 w-5.5 text-brand-primary" />
                {modalMode === 'create' 
                  ? t('exerciseLibrary.addNewExercise', 'Add Custom Library Exercise') 
                  : t('exerciseLibrary.editExercise', 'Edit Exercise Profile')}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brand-muted hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Exercise Name */}
              <div>
                <label htmlFor="exName" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  {t('exerciseLibrary.formName', 'Exercise Name')}
                </label>
                <input
                  id="exName"
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Press"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="glass-input w-full text-white"
                  disabled={formSubmitting}
                />
              </div>

              {/* Grid 2-cols: Difficulty & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="exDiff" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                    {t('exerciseLibrary.formDifficulty', 'Difficulty')}
                  </label>
                  <select
                    id="exDiff"
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="glass-input w-full cursor-pointer bg-brand-dark text-white"
                    disabled={formSubmitting}
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{getDifficultyTranslation(d)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="exEquip" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                    {t('exerciseLibrary.formEquipment', 'Equipment')}
                  </label>
                  <select
                    id="exEquip"
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    className="glass-input w-full cursor-pointer bg-brand-dark text-white"
                    disabled={formSubmitting}
                  >
                    {EQUIPMENTS.map(eq => (
                      <option key={eq} value={eq}>{getEquipmentTranslation(eq)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Muscle Groups Checklist */}
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                  {t('exerciseLibrary.formMuscleGroups', 'Target Muscle Groups')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map(m => {
                    const isChecked = formMuscles.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMuscleToggle(m.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer capitalize font-semibold ${
                          isChecked 
                            ? 'bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_8px_rgba(255,107,0,0.25)]' 
                            : 'bg-white/5 border-white/5 text-brand-muted hover:border-white/10 hover:text-white'
                        }`}
                        disabled={formSubmitting}
                      >
                        {getMuscleTranslation(m.id)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic steps directions */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    {t('exerciseLibrary.formStepsLabel', 'Form Steps')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddField(setFormSteps, formSteps)}
                    className="text-xs text-brand-primary hover:text-brand-secondary font-bold flex items-center gap-1 cursor-pointer"
                    disabled={formSubmitting}
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('common.addStep', 'Add Step')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs text-brand-muted font-bold w-5 text-right shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Detail the mechanical setup or motion cues..."
                        value={step}
                        onChange={(e) => handleFieldChange(setFormSteps, formSteps, idx, e.target.value)}
                        className="glass-input flex-grow text-sm py-2 text-white"
                        required={idx === 0}
                        disabled={formSubmitting}
                      />
                      {formSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(setFormSteps, formSteps, idx)}
                          className="p-2 text-brand-muted hover:text-red-400 transition cursor-pointer"
                          disabled={formSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Common Mistakes */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    {t('exerciseLibrary.formMistakesLabel', 'Common Mistakes')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddField(setFormMistakes, formMistakes)}
                    className="text-xs text-brand-primary hover:text-brand-secondary font-bold flex items-center gap-1 cursor-pointer"
                    disabled={formSubmitting}
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('common.addMistake', 'Add Mistake')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formMistakes.map((mistake, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs text-brand-muted font-bold w-5 text-right shrink-0">•</span>
                      <input
                        type="text"
                        placeholder="e.g. arching lower back, flaring elbows too wide..."
                        value={mistake}
                        onChange={(e) => handleFieldChange(setFormMistakes, formMistakes, idx, e.target.value)}
                        className="glass-input flex-grow text-sm py-2 text-white"
                        disabled={formSubmitting}
                      />
                      {formMistakes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(setFormMistakes, formMistakes, idx)}
                          className="p-2 text-brand-muted hover:text-red-400 transition cursor-pointer"
                          disabled={formSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Pro Tips */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    {t('exerciseLibrary.formTipsLabel', 'Pro Tips')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddField(setFormTips, formTips)}
                    className="text-xs text-brand-primary hover:text-brand-secondary font-bold flex items-center gap-1 cursor-pointer"
                    disabled={formSubmitting}
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('common.addTip', 'Add Tip')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formTips.map((tip, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs text-brand-muted font-bold w-5 text-right shrink-0">★</span>
                      <input
                        type="text"
                        placeholder="e.g. squeeze shoulder blades together before lift..."
                        value={tip}
                        onChange={(e) => handleFieldChange(setFormTips, formTips, idx, e.target.value)}
                        className="glass-input flex-grow text-sm py-2 text-white"
                        disabled={formSubmitting}
                      />
                      {formTips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(setFormTips, formTips, idx)}
                          className="p-2 text-brand-muted hover:text-red-400 transition cursor-pointer"
                          disabled={formSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Breathing Cue */}
              <div>
                <label htmlFor="exBreath" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  {t('exerciseLibrary.formBreathingLabel', 'Breathing Cue Pattern')}
                </label>
                <input
                  id="exBreath"
                  type="text"
                  placeholder="e.g. Inhale as you lower, exhale as you push up."
                  value={formBreathing}
                  onChange={(e) => setFormBreathing(e.target.value)}
                  className="glass-input w-full text-white"
                  disabled={formSubmitting}
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="exImageUrl" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  {t('exerciseLibrary.formImageUrl', 'Demonstration Image URL')}
                </label>
                <input
                  id="exImageUrl"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="glass-input w-full text-white"
                  disabled={formSubmitting}
                />
              </div>

              {/* Video / GIF URL */}
              <div>
                <label htmlFor="exVideoUrl" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  {t('exerciseLibrary.formVideoUrl', 'Demonstration GIF/Video URL')}
                </label>
                <input
                  id="exVideoUrl"
                  type="text"
                  placeholder="https://example.com/demo.gif"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="glass-input w-full text-white"
                  disabled={formSubmitting}
                />
              </div>

              {/* Cancel / Submit Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 btn-secondary py-3 font-bold cursor-pointer"
                  disabled={formSubmitting}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 btn-primary py-3 font-bold cursor-pointer"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? t('exerciseLibrary.submitting', 'Saving...') : t('common.save', 'Save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
