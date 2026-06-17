import { useState, useEffect, useRef } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [stage, setStage] = useState(1); // 1: Crouched, 2: Standing (Lifting), 3: Scaling Down
  const [showWordmark, setShowWordmark] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Measure target position after layout stability
    const timer = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    if (!coords) return;

    // Stage 1 (0s - 1.5s): Crouched low, gripping gada flat on the ground.
    
    // Stage 2 (1.5s - 2.8s): Standing upright (Lifting Gada to shoulder).
    const stage2Timer = setTimeout(() => {
      setStage(2);
    }, 1500);

    // Stage 3 (2.8s - 4.0s): Scale down to navbar logo position.
    const stage3Timer = setTimeout(() => {
      setStage(3);
    }, 2800);

    // Fade in wordmark next to logo (Stage 3 + 400ms = 3.2s)
    const wordmarkTimer = setTimeout(() => {
      setShowWordmark(true);
    }, 3200);

    // Fade in tagline below wordmark (Stage 3 + 800ms = 3.6s)
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 3600);

    // Start fading out the entire splash overlay (at 4.2s)
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4200);

    // Complete splash screen (at 4.6s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4600);

    return () => {
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
      clearTimeout(wordmarkTimer);
      clearTimeout(taglineTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [coords, onComplete]);

  const getLogoStyle = () => {
    if (!coords) {
      return {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1)',
        width: '180px',
        height: '180px',
        transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10000,
      };
    }

    if (stage < 3) {
      return {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1)',
        width: '180px',
        height: '180px',
        transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10000,
      };
    }

    return {
      position: 'fixed' as const,
      left: `${coords.x}px`,
      top: `${coords.y}px`,
      width: `${coords.width}px`,
      height: `${coords.height}px`,
      transform: 'translate(0, 0) scale(1)',
      transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 10000,
    };
  };

  // Compute Gada style based on stage
  const getGadaStyle = () => {
    if (stage === 1) {
      // Crouched: Gada horizontal on the ground
      return {
        transform: 'translate(-17px, 31px) rotate(158deg)',
        transformOrigin: '58px 40px',
        transition: 'transform 1300ms cubic-bezier(0.45, 0, 0.15, 1)',
      };
    }
    // Standing: Gada resting on shoulder
    return {
      transform: 'translate(0px, 0px) rotate(0deg)',
      transformOrigin: '58px 40px',
      transition: 'transform 1300ms cubic-bezier(0.45, 0, 0.15, 1)',
    };
  };

  // Compute Y offset on figures to simulate physical lifting force
  const getBodyTransform = () => {
    return stage === 1 ? 'translateY(2px)' : 'translateY(0px)';
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col bg-[#0A0A0A] transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Simulated Navbar to measure target logo anchor */}
      <div className="w-full border-b border-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <div className="flex items-center gap-3 relative">
              <div ref={targetRef} className="h-9 w-9 opacity-0" />
              
              <span
                className={`font-display tracking-wider text-xl text-white font-extrabold transition-all duration-500 transform ${
                  showWordmark ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                }`}
              >
                SANKALP
              </span>

              <div
                className={`absolute top-full left-0 mt-1.5 text-xs text-brand-primary tracking-widest uppercase font-semibold transition-all duration-500 whitespace-nowrap ${
                  showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                }`}
              >
                Where every transformation begins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animating Logo */}
      <div style={getLogoStyle()}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(255,107,0,0.35)]">
          <rect width="100" height="100" rx="20" fill="#0A0A0A" />
          
          <g>
            {/* Crouched State Hanuman */}
            <g
              id="crouched-hanuman"
              style={{
                opacity: stage === 1 ? 1 : 0,
                transform: getBodyTransform(),
                transition: 'opacity 1300ms cubic-bezier(0.45, 0, 0.15, 1), transform 1300ms cubic-bezier(0.45, 0, 0.15, 1)',
              }}
            >
              {/* Tail */}
              <path d="M41,72 C26,74 16,66 16,54 C16,42 28,36 36,40 C28,38 20,44 20,54 C20,62 28,68 41,68 Z" fill="#FF6B00" />
              
              {/* Legs */}
              <path d="M41,72 C33,74 26,76 28,78 C30,80 34,83 36,85 L42,85 C39,81 37,77 43,72 Z" fill="#FF6B00" />
              <path d="M49,72 C57,74 64,76 62,78 C60,80 56,83 58,85 L52,85 C55,81 57,77 47,72 Z" fill="#FF6B00" />
              <path d="M47,72 C55,74 60,76 58,78 C56,80 54,83 52,85 Z" fill="#CC5500" />
              
              {/* Torso */}
              <path d="M36,62 C36,62 46,64 56,58 C53,66 50,72 49,72 L41,72 C40,72 38,66 36,62 Z" fill="#FF6B00" />
              <path d="M45,60 C45,60 51,60 56,58 C53,66 50,72 49,72 L45,72 Z" fill="#CC5500" />
              
              {/* Head & Crown */}
              <circle cx="44" cy="56" r="4.5" fill="#FF6B00" />
              <polygon points="41,52 44,46 47,52" fill="#FF6B00" />
              <polygon points="44,52 44,46 47,52" fill="#CC5500" />
              
              {/* Arms */}
              <path d="M36,62 C33,67 35,72 38,76 C40,76 41,72 39,68 C38,65 38,63 38,62 Z" fill="#FF6B00" />
              <path d="M56,58 C52,64 48,70 44,75 C46,76 48,72 52,66 C54,63 55,60 56,58 Z" fill="#FF6B00" />
              <path d="M52,60 C49,66 46,72 44,75 C45,75 47,72 50,66 C51,63 52,61 52,60 Z" fill="#CC5500" />
            </g>

            {/* Standing State Hanuman */}
            <g
              id="standing-hanuman"
              style={{
                opacity: stage === 1 ? 0 : 1,
                transform: getBodyTransform(),
                transition: 'opacity 1300ms cubic-bezier(0.45, 0, 0.15, 1), transform 1300ms cubic-bezier(0.45, 0, 0.15, 1)',
              }}
            >
              {/* Tail */}
              <path d="M45,54 C28,56 18,44 18,30 C18,14 34,8 43,12 C32,10 22,18 22,30 C22,40 30,49 45,49 Z" fill="#FF6B00" />
              
              {/* Legs */}
              <path d="M45,54 C41,64 38,74 38,85 L44,85 C46,75 48,65 50,54 Z" fill="#FF6B00" />
              <path d="M55,54 C59,64 62,74 62,85 L56,85 C54,75 52,65 50,54 Z" fill="#FF6B00" />
              <path d="M50,54 C54,64 56,75 56,85 L62,85 C62,74 59,64 55,54 Z" fill="#CC5500" />
              
              {/* Dhoti/Sash */}
              <path d="M43,53 L57,53 L55,62 L45,62 Z" fill="#FF6B00" />
              <path d="M50,53 L57,53 L55,62 L50,62 Z" fill="#CC5500" />
              
              {/* Torso */}
              <path d="M39,37 C39,37 50,39 61,37 C59,46 56,54 55,54 L45,54 C44,54 41,46 39,37 Z" fill="#FF6B00" />
              <path d="M50,38 C50,38 55.5,38.5 61,37 C59,46 56,54 55,54 L50,54 Z" fill="#CC5500" />
              
              {/* Head & Crown */}
              <circle cx="50" cy="32" r="4.5" fill="#FF6B00" />
              <polygon points="47,28 50,22 53,28" fill="#FF6B00" />
              <polygon points="50,28 50,22 53,28" fill="#CC5500" />
              
              {/* Arms */}
              <path d="M39,35 C33,38 30,44 31,48 C32,51 37,51 38,47 C39,43 43,40 44,38 Z" fill="#FF6B00" />
              <path d="M61,35 C67,38 70,44 69,48 C68,50 64,48 62,44 C61,41 59,39 58,38 Z" fill="#FF6B00" />
              <path d="M65,37 C69,40 70,44 69,48 C68,50 66,49 64,45 Z" fill="#CC5500" />
            </g>

            {/* Animating Gada Element (Shared) */}
            <g id="gada-element" style={getGadaStyle()}>
              {/* Shaft */}
              <rect x="61" y="10" width="3" height="32" rx="1" transform="rotate(22 62.5 26)" fill="#FF6B00" />
              {/* Mace Head */}
              <circle cx="72" cy="11" r="8" fill="#FF6B00" />
              <path d="M72,3 A8,8 0 0,1 72,19 Z" fill="#CC5500" />
              <polygon points="70,3 74,3 72,0" fill="#FF6B00" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
