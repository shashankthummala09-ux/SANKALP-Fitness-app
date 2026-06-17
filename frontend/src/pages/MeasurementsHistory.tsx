import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Camera, Plus, Sparkles, TrendingUp, Dumbbell, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface MeasurementRecord {
  id: string;
  chest: number;
  waist: number;
  arms: number;
  thighs: number;
  photo: string | null;
  loggedAt: string;
}

export default function MeasurementsHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<MeasurementRecord[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/measurements');
      setHistory(res.data.history);
      setError('');
    } catch (err: any) {
      console.error('Error fetching measurements history:', err);
      setError(t('measurements.fetchFailed', 'Failed to load measurements history. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-brand-dark">
        <Dumbbell className="h-10 w-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  // Filter records with progress photos
  const photoRecords = history.filter((r) => r.photo);
  const beforePhoto = photoRecords.length > 0 ? photoRecords[0] : null;
  const afterPhoto = photoRecords.length > 1 ? photoRecords[photoRecords.length - 1] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-brand-muted hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {t('measurements.historyTitle', 'Measurements & Progress')}
            </h1>
            <p className="text-brand-muted mt-1 text-sm">
              {t('measurements.historySubtitle', 'Analyze your body dimensions over time and track your visual transformation.')}
            </p>
          </div>
        </div>
        <Link
          to="/measurements/log"
          className="btn-primary py-2.5 px-5 flex items-center justify-center gap-2 cursor-pointer font-bold w-full sm:w-auto text-center"
        >
          <Plus className="h-5 w-5" />
          {t('measurements.logNewBtn', 'Log Measurements')}
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel p-8 border border-dashed border-white/10 max-w-xl mx-auto space-y-4">
          <Sparkles className="h-12 w-12 text-brand-muted/40 animate-pulse" />
          <h2 className="text-xl font-bold text-white">{t('measurements.noDataTitle', 'No Measurements Logged')}</h2>
          <p className="text-brand-muted text-sm max-w-sm">
            {t('measurements.noDataDesc', 'Start tracking chest, waist, arms, and thighs to see visual progression trend charts.')}
          </p>
          <Link to="/measurements/log" className="btn-primary">
            {t('measurements.logFirstBtn', 'Record First Log')}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard data={history} dataKey="chest" label={t('measurements.chestChart', 'Chest')} strokeColor="#FF6B00" />
            <ChartCard data={history} dataKey="waist" label={t('measurements.waistChart', 'Waist')} strokeColor="#FF5500" />
            <ChartCard data={history} dataKey="arms" label={t('measurements.armsChart', 'Arms')} strokeColor="#FF8800" />
            <ChartCard data={history} dataKey="thighs" label={t('measurements.thighsChart', 'Thighs')} strokeColor="#FFAA00" />
          </div>

          {/* Before/After timeline section */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Camera className="h-5.5 w-5.5 text-brand-primary" />
              {t('measurements.photoTimeline', 'Before & After Progress Timeline')}
            </h3>

            {photoRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <Camera className="h-10 w-10 text-brand-muted/40 mb-3" />
                <p className="text-brand-text font-semibold">{t('measurements.noPhotos', 'No Progress Photos Yet')}</p>
                <p className="text-brand-muted text-xs max-w-xs mt-1">
                  {t('measurements.noPhotosDesc', 'Attach a photo when logging body measurements to visualize your muscular progress.')}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Highlight Before/After Compare Panel */}
                {beforePhoto && (
                  <div className="bg-brand-dark/45 border border-white/5 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-4 text-center sm:text-left">
                      {t('measurements.comparisonTitle', 'Current Transformation Highlight')}
                    </h4>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-8 md:gap-12">
                      {/* Before Frame */}
                      <div className="space-y-2 text-center">
                        <span className="text-xs font-bold px-3 py-1 rounded bg-brand-muted/10 border border-white/5 text-brand-muted uppercase tracking-widest block w-fit mx-auto">
                          {t('measurements.beforeLabel', 'Before')}
                        </span>
                        <div className="h-64 w-48 rounded-xl border border-white/10 overflow-hidden bg-brand-dark shadow-lg">
                          <img src={beforePhoto.photo!} alt="Before" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-xs text-brand-muted block">
                          {new Date(beforePhoto.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Timeline flow indicator (Arrow) */}
                      {afterPhoto && (
                        <div className="hidden sm:flex flex-col items-center justify-center text-brand-primary font-black text-2xl animate-pulse">
                          ➜
                        </div>
                      )}

                      {/* After/Current Frame */}
                      {afterPhoto ? (
                        <div className="space-y-2 text-center">
                          <span className="text-xs font-bold px-3 py-1 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary uppercase tracking-widest block w-fit mx-auto">
                            {t('measurements.afterLabel', 'After / Current')}
                          </span>
                          <div className="h-64 w-48 rounded-xl border border-brand-primary/30 overflow-hidden bg-brand-dark shadow-lg shadow-brand-primary/5">
                            <img src={afterPhoto.photo!} alt="After" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-xs text-brand-muted block">
                            {new Date(afterPhoto.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center py-6 max-w-[200px] text-xs text-brand-muted leading-relaxed">
                          {t('measurements.uploadMore', 'Upload another progress photo in your next log to activate the before/after comparison!')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Chronological Grid */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t('measurements.allTimelinePhotos', 'Full Photo History')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {photoRecords.map((record, index) => (
                      <div key={record.id} className="glass-panel p-2.5 border border-white/5 space-y-2 text-center group hover:border-brand-primary/20 transition-all duration-300">
                        <div className="h-44 rounded-lg overflow-hidden bg-brand-dark border border-white/5 relative">
                          <img src={record.photo!} alt={`Log ${index + 1}`} className="h-full w-full object-cover" />
                          <div className="absolute top-2 left-2 bg-brand-dark/85 text-[9px] font-bold text-white px-2 py-0.5 rounded border border-white/10">
                            #{index + 1}
                          </div>
                        </div>
                        <span className="text-[10px] text-brand-muted font-bold block flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3 text-brand-primary" />
                          {new Date(record.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline chart component to render a premium SVG trend chart
interface ChartCardProps {
  data: MeasurementRecord[];
  dataKey: 'chest' | 'waist' | 'arms' | 'thighs';
  label: string;
  strokeColor: string;
}

function ChartCard({ data, dataKey, label, strokeColor }: ChartCardProps) {
  const [hoveredNode, setHoveredNode] = useState<{ index: number; x: number; y: number; val: number; date: string } | null>(null);

  // SVG dimensions
  const w = 500;
  const h = 200;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };

  // Calculate coordinates
  const values = data.map((r) => r[dataKey]);
  const maxVal = Math.max(...values) + 2;
  const minVal = Math.max(0, Math.min(...values) - 2);
  const rangeY = maxVal - minVal || 1;

  const pointsCount = data.length;

  const generatePoints = () => {
    return data.map((record, idx) => {
      const val = record[dataKey];
      const x = padding.left + (idx / Math.max(1, pointsCount - 1)) * (w - padding.left - padding.right);
      const y = h - padding.bottom - ((val - minVal) / rangeY) * (h - padding.top - padding.bottom);
      const date = new Date(record.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return { x, y, val, date };
    });
  };

  const points = generatePoints();

  // Create SVG path string
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Area under line
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${h - padding.bottom} L ${points[0].x} ${h - padding.bottom} Z`
    : '';

  return (
    <div className="glass-panel p-5 border border-white/5 space-y-4 hover:border-brand-primary/15 transition-all duration-300 relative">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-brand-primary" />
          {label} Trend Tracker
        </h3>
        <span className="text-[10px] text-brand-muted bg-white/5 px-2 py-0.5 rounded border border-white/5">
          Latest: {values[values.length - 1]} cm
        </span>
      </div>

      {points.length === 1 ? (
        <div className="flex flex-col items-center justify-center h-36 text-center text-xs text-brand-muted border border-dashed border-white/5 rounded-xl">
          <span>Logged value: {values[0]} cm</span>
          <span className="text-[10px] mt-1">(Log more dimensions over time to generate a trend graph)</span>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
            <defs>
              <linearGradient id={`areaGrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.5, 1].map((r, i) => {
              const y = padding.top + r * (h - padding.top - padding.bottom);
              const gridVal = maxVal - r * rangeY;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={w - padding.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 4"
                  />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-[9px] fill-brand-muted/70">
                    {gridVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* X axis labels */}
            {points.map((p, idx) => {
              // Only draw 4 labels maximum to keep layout clean
              const step = Math.max(1, Math.floor(pointsCount / 4));
              if (idx % step === 0 || idx === pointsCount - 1) {
                return (
                  <text key={idx} x={p.x} y={h - 10} textAnchor="middle" className="text-[9px] fill-brand-muted/70">
                    {p.date}
                  </text>
                );
              }
              return null;
            })}

            {/* Filled Area */}
            {areaD && <path d={areaD} fill={`url(#areaGrad-${dataKey})`} />}

            {/* Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Circles */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode({ index: idx, x: p.x, y: p.y, val: p.val, date: p.date })}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredNode?.index === idx ? '5' : '3.5'}
                  fill={hoveredNode?.index === idx ? '#FFFFFF' : strokeColor}
                  className="pointer-events-none transition-all duration-150"
                  stroke={hoveredNode?.index === idx ? strokeColor : 'none'}
                  strokeWidth={hoveredNode?.index === idx ? '2' : '0'}
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip bubble */}
          {hoveredNode && (
            <div
              style={{
                position: 'absolute',
                left: `${(hoveredNode.x / w) * 100}%`,
                top: `${(hoveredNode.y / h) * 100 - 32}%`,
                transform: 'translateX(-50%)',
              }}
              className="glass-panel px-2.5 py-1 border border-white/10 text-center pointer-events-none z-10 shadow-glass-sm animate-scale-up text-[10px]"
            >
              <p className="font-bold text-white">{hoveredNode.val} cm</p>
              <p className="text-[8px] text-brand-muted">{hoveredNode.date}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
