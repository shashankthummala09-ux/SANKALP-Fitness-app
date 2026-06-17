import { useTranslation } from 'react-i18next';

interface DiyaStreakProps {
  streakCount: number;
  daysSinceLastWorkout: number;
}

export default function DiyaStreak({ streakCount, daysSinceLastWorkout }: DiyaStreakProps) {
  const { t } = useTranslation();

  // Streak is extinguished if streakCount is 0 or it has been 2 or more days since the last workout
  const isExtinguished = streakCount === 0 || daysSinceLastWorkout >= 2;

  // Flame scaling factors & visual styles
  let scaleX = 1;
  let scaleY = 1;
  let flameColorOuter = '#FF6B00'; // Brand primary orange
  let flameColorInner = '#FFE600'; // Yellow
  let glowColor = 'rgba(255, 107, 0, 0.4)';
  
  // Custom translatable text labels
  let flameLabel = t('dashboard.streakExtinguished', 'Streak Extinguished');
  let flameDescription = t('dashboard.streakExtinguishedDesc', "It's been 2+ days since your last session");

  if (!isExtinguished) {
    if (streakCount <= 2) {
      scaleX = 0.7;
      scaleY = 0.7;
      flameColorOuter = '#FF8C00';
      flameColorInner = '#FFD700';
      glowColor = 'rgba(255, 140, 0, 0.2)';
      flameLabel = t('dashboard.streakCountLow', '{{count}} Day Streak', { count: streakCount });
      flameDescription = t('dashboard.streakCountLowDesc', 'Flickering to life. Keep training!');
    } else if (streakCount < 7) {
      scaleX = 1.0;
      scaleY = 1.0;
      flameColorOuter = '#FF5500';
      flameColorInner = '#FFE600';
      glowColor = 'rgba(255, 85, 0, 0.45)';
      flameLabel = t('dashboard.streakCountMedium', '{{count}} Day Streak', { count: streakCount });
      flameDescription = t('dashboard.streakCountMediumDesc', 'Steady and burning. Great momentum!');
    } else {
      scaleX = 1.35;
      scaleY = 1.5;
      flameColorOuter = '#FF2200';
      flameColorInner = '#FFFFCC';
      glowColor = 'rgba(255, 34, 0, 0.75)';
      flameLabel = t('dashboard.streakCountHigh', '{{count}} Day Streak 🔥', { count: streakCount });
      flameDescription = t('dashboard.streakCountHighDesc', "Blazing strong! A true warrior's discipline.");
    }
  } else if (streakCount === 0 && daysSinceLastWorkout === 999) {
    flameLabel = t('dashboard.streakEmpty', 'No Active Streak');
    flameDescription = t('dashboard.streakEmptyDesc', 'Log a workout to start your streak!');
  }

  return (
    <div className="glass-panel p-6 border border-white/5 relative overflow-hidden group hover:border-brand-primary/20 transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[220px]">
      {/* Inline styles for flicker and prefers-reduced-motion compatibility */}
      <style>{`
        @keyframes diya-flicker {
          0%, 100% {
            transform: translate(50px, 58px) scale(${scaleX}, ${scaleY}) translate(-50px, -58px) rotate(-0.5deg);
            opacity: 0.95;
            filter: drop-shadow(0 0 8px ${glowColor});
          }
          20% {
            transform: translate(50px, 58px) scale(${scaleX * 0.95}, ${scaleY * 1.06}) translate(-50px, -58px) rotate(0.6deg);
            opacity: 1;
            filter: drop-shadow(0 0 13px ${glowColor});
          }
          40% {
            transform: translate(50px, 58px) scale(${scaleX * 1.05}, ${scaleY * 0.94}) translate(-50px, -58px) rotate(-1.2deg);
            opacity: 0.88;
            filter: drop-shadow(0 0 6px ${glowColor});
          }
          60% {
            transform: translate(50px, 58px) scale(${scaleX * 0.97}, ${scaleY * 1.03}) translate(-50px, -58px) rotate(1deg);
            opacity: 0.96;
            filter: drop-shadow(0 0 11px ${glowColor});
          }
          80% {
            transform: translate(50px, 58px) scale(${scaleX * 1.03}, ${scaleY * 0.97}) translate(-50px, -58px) rotate(-0.6deg);
            opacity: 0.98;
            filter: drop-shadow(0 0 9px ${glowColor});
          }
        }
        
        .diya-flame {
          transform-origin: 50px 58px;
          animation: ${isExtinguished ? 'none' : `diya-flicker ${streakCount >= 7 ? '0.7s' : '1.1s'} infinite ease-in-out`};
        }

        @media (prefers-reduced-motion: reduce) {
          .diya-flame {
            animation: none !important;
            transform: translate(50px, 58px) scale(${scaleX}, ${scaleY}) translate(-50px, -58px) !important;
            filter: drop-shadow(0 0 8px ${glowColor}) !important;
          }
        }
      `}</style>

      {/* Diya Lamp visual SVG */}
      <div className="relative w-24 h-24 flex items-center justify-center select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {/* Clay base gradient */}
            <linearGradient id="diyaBaseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3C2215" />
              <stop offset="60%" stopColor="#1E0E07" />
              <stop offset="100%" stopColor="#0A0402" />
            </linearGradient>
            
            {/* Clay lip highlight */}
            <linearGradient id="diyaRimGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5E331B" />
              <stop offset="50%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#5E331B" />
            </linearGradient>
            
            {/* Glowing oil gradient */}
            <linearGradient id="diyaOilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D45B00" />
              <stop offset="100%" stopColor="#3A1700" />
            </linearGradient>
            
            {/* Flame outer zone */}
            <linearGradient id="flameOuterGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FF1100" />
              <stop offset="50%" stopColor={flameColorOuter} />
              <stop offset="100%" stopColor="#FFE100" />
            </linearGradient>
            
            {/* Flame hot inner zone */}
            <linearGradient id="flameInnerGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={flameColorOuter} />
              <stop offset="70%" stopColor={flameColorInner} />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>

          {/* Wick path */}
          <path
            d="M 50 72 C 48.5 67, 48.5 62, 50 58"
            stroke={isExtinguished ? "#2E2E2E" : "#1A1A1A"}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Active Flame */}
          {!isExtinguished && (
            <g className="diya-flame">
              {/* Outer Glow Flame Shell */}
              <path
                d="M 50 58 C 41.5 58, 35.5 45, 50 20 C 64.5 45, 58.5 58, 50 58 Z"
                fill="url(#flameOuterGrad)"
              />
              {/* Inner Flame Shell */}
              <path
                d="M 50 58 C 44.5 58, 40.5 49, 50 31 C 59.5 49, 55.5 58, 50 58 Z"
                fill="url(#flameInnerGrad)"
                opacity="0.92"
              />
              {/* Blue combustion root */}
              <path
                d="M 50 58 C 47.5 58, 45.5 54, 50 47 C 54.5 54, 52.5 58, 50 58 Z"
                fill="#2A7BFF"
                opacity="0.75"
              />
            </g>
          )}

          {/* Extinguished state puff of smoke */}
          {isExtinguished && (
            <g opacity="0.5">
              {/* Hot glowing ember tip */}
              <circle cx="50" cy="58" r="1.8" fill="#FF4400" className="animate-pulse" />
              {/* Floating smoke trail */}
              <path
                d="M 50 54 Q 47.5 44, 51.5 37 T 48.5 25"
                stroke="rgba(138, 138, 138, 0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Oil/Ghee reservoir */}
          <ellipse cx="50" cy="71.5" rx="27" ry="6.5" fill="url(#diyaOilGrad)" />

          {/* Clay pot body */}
          <path
            d="M 19 70 C 19 89.5, 50 95, 50 95 C 50 95, 81 89.5, 81 70 Z"
            fill="url(#diyaBaseGrad)"
            stroke="#160803"
            strokeWidth="1"
          />
          
          {/* Clay pot inner rim */}
          <path
            d="M 19 70 C 19 74.5, 50 78.5, 50 78.5 C 50 78.5, 81 74.5, 81 70 C 81 65.5, 50 63.5, 19 70 Z"
            fill="url(#diyaRimGrad)"
            stroke="rgba(255, 107, 0, 0.3)"
            strokeWidth="1.5"
          />

          {/* Clay decorative etching */}
          <path
            d="M 30 80 C 40 86.5, 50 86.5, 50 86.5 C 50 86.5, 60 86.5, 70 80"
            stroke="#FF6B00"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Label and descriptions */}
      <div className="space-y-1 mt-2">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
          {t('dashboard.workoutStreakLabel', 'Workout Streak')}
        </p>
        <h4 className="text-lg font-extrabold text-white leading-tight">
          {flameLabel}
        </h4>
        <p className="text-[10px] text-brand-muted leading-normal max-w-[190px] mx-auto">
          {flameDescription}
        </p>
      </div>
    </div>
  );
}
