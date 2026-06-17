import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Menu, X, LogOut, User as UserIcon, Calendar, BarChart3, BookOpen, Globe, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface RegionOption {
  name: string;
  flag: string;
  languages: LanguageOption[];
}

const REGIONS: RegionOption[] = [
  {
    name: 'India',
    flag: '🇮🇳',
    languages: [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
      { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' }
    ]
  },
  {
    name: 'USA',
    flag: '🇺🇸',
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  },
  {
    name: 'Germany',
    flag: '🇩🇪',
    languages: [
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ]
  },
  {
    name: 'Spain',
    flag: '🇪🇸',
    languages: [
      { code: 'es', name: 'Español', flag: '🇪🇸' }
    ]
  },
  {
    name: 'France',
    flag: '🇫🇷',
    languages: [
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ]
  }
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const currentPath = location.pathname;

  const isActiveRoute = (path: string) => {
    return path === '/' ? currentPath === '/' : currentPath.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('sankalp_language', code);
    setIsLangOpen(false);
  };

  const currentLangCode = i18n.language || 'en';
  let currentRegion = REGIONS[0];
  let currentLang = REGIONS[0].languages[0];

  for (const region of REGIONS) {
    const lang = region.languages.find(l => l.code === currentLangCode);
    if (lang) {
      currentRegion = region;
      currentLang = lang;
      break;
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-dark/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
              <svg viewBox="0 0 100 100" className="h-9 w-9 drop-shadow-[0_2px_4px_rgba(255,107,0,0.2)]">
                <rect width="100" height="100" rx="20" fill="#0A0A0A" />
                <g id="standing-hanuman">
                  <path d="M45,54 C28,56 18,44 18,30 C18,14 34,8 43,12 C32,10 22,18 22,30 C22,40 30,49 45,49 Z" fill="#FF6B00" />
                  <path d="M45,54 C41,64 38,74 38,85 L44,85 C46,75 48,65 50,54 Z" fill="#FF6B00" />
                  <path d="M55,54 C59,64 62,74 62,85 L56,85 C54,75 52,65 50,54 Z" fill="#FF6B00" />
                  <path d="M50,54 C54,64 56,75 56,85 L62,85 C62,74 59,64 55,54 Z" fill="#CC5500" />
                  <path d="M43,53 L57,53 L55,62 L45,62 Z" fill="#FF6B00" />
                  <path d="M50,53 L57,53 L55,62 L50,62 Z" fill="#CC5500" />
                  <path d="M39,37 C39,37 50,39 61,37 C59,46 56,54 55,54 L45,54 C44,54 41,46 39,37 Z" fill="#FF6B00" />
                  <path d="M50,38 C50,38 55.5,38.5 61,37 C59,46 56,54 55,54 L50,54 Z" fill="#CC5500" />
                  <circle cx="50" cy="32" r="4.5" fill="#FF6B00" />
                  <polygon points="47,28 50,22 53,28" fill="#FF6B00" />
                  <polygon points="50,28 50,22 53,28" fill="#CC5500" />
                  <path d="M39,35 C33,38 30,44 31,48 C32,51 37,51 38,47 C39,43 43,40 44,38 Z" fill="#FF6B00" />
                  <path d="M61,35 C67,38 70,44 69,48 C68,50 64,48 62,44 C61,41 59,39 58,38 Z" fill="#FF6B00" />
                  <path d="M65,37 C69,40 70,44 69,48 C68,50 66,49 64,45 Z" fill="#CC5500" />
                  <g id="standing-gada">
                    <rect x="61" y="10" width="3" height="32" rx="1" transform="rotate(22 62.5 26)" fill="#FF6B00" />
                    <circle cx="72" cy="11" r="8" fill="#FF6B00" />
                    <path d="M72,3 A8,8 0 0,1 72,19 Z" fill="#CC5500" />
                    <polygon points="70,3 74,3 72,0" fill="#FF6B00" />
                  </g>
                </g>
              </svg>
              <span className="font-display tracking-wider text-xl text-white font-extrabold">SANKALP</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className={isActiveRoute('/dashboard') 
                  ? "text-brand-primary font-bold flex items-center gap-1.5 transition-colors duration-200" 
                  : "text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-1.5 font-medium"
                }
              >
                <BarChart3 className="h-4 w-4" />
                {t('navbar.dashboard')}
              </Link>
            )}

            <Link 
              to="/exercises" 
              className={isActiveRoute('/exercises') 
                ? "text-brand-primary font-bold flex items-center gap-1.5 transition-colors duration-200" 
                : "text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-1.5 font-medium"
              }
            >
              <BookOpen className="h-4 w-4" />
              {t('navbar.exercises')}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/history" 
                  className={isActiveRoute('/history') 
                    ? "text-brand-primary font-bold flex items-center gap-1.5 transition-colors duration-200" 
                    : "text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-1.5 font-medium"
                  }
                >
                  <Calendar className="h-4 w-4" />
                  {t('navbar.history')}
                </Link>
                <Link 
                  to="/log" 
                  className={isActiveRoute('/log') 
                    ? "text-brand-primary font-bold flex items-center gap-1.5 transition-colors duration-200" 
                    : "text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-1.5 font-medium"
                  }
                >
                  <Dumbbell className="h-4 w-4" />
                  {t('navbar.logWorkout')}
                </Link>
                
                {/* Language Selector Dropdown */}
                <div 
                  className="relative" 
                  onMouseEnter={() => setIsLangOpen(true)}
                  onMouseLeave={() => setIsLangOpen(false)}
                >
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-sm font-medium py-1.5 px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{currentRegion.flag} {currentLang.name}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLangOpen && (
                    <div className="absolute right-0 top-full pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="rounded-xl border border-white/10 bg-brand-dark/95 backdrop-blur-lg p-2 shadow-2xl">
                        <div className="text-[10px] font-semibold text-brand-muted px-2 py-1 border-b border-white/5 mb-1.5 uppercase tracking-wider">
                          {t('navbar.regionLanguage')}
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {REGIONS.map((region) => (
                            <div key={region.name} className="space-y-0.5">
                              <div className="text-[10px] uppercase font-bold text-brand-primary/80 px-2 tracking-wider">
                                {region.flag} {region.name}
                              </div>
                              {region.languages.map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={() => handleLanguageChange(lang.code)}
                                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all flex items-center gap-2 cursor-pointer ${
                                    i18n.language === lang.code
                                      ? 'bg-brand-primary/20 text-white border border-brand-primary/30 font-medium'
                                      : 'text-brand-text hover:bg-white/5 hover:text-white border border-transparent'
                                  }`}
                                >
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown Profile mock */}
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <Link 
                    to="/profile" 
                    className={`flex items-center gap-2 transition-colors duration-200 ${
                      isActiveRoute('/profile') ? 'text-brand-primary font-bold' : 'text-brand-muted hover:text-white'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm transition-colors duration-200 ${
                      isActiveRoute('/profile')
                        ? 'bg-brand-primary text-white border border-brand-primary'
                        : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
                    }`}>
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">{user?.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-brand-muted hover:text-red-400 transition-colors duration-200 cursor-pointer"
                    title={t('navbar.signOut')}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Language Selector Dropdown */}
                <div 
                  className="relative" 
                  onMouseEnter={() => setIsLangOpen(true)}
                  onMouseLeave={() => setIsLangOpen(false)}
                >
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-sm font-medium py-1.5 px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{currentRegion.flag} {currentLang.name}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLangOpen && (
                    <div className="absolute right-0 top-full pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="rounded-xl border border-white/10 bg-brand-dark/95 backdrop-blur-lg p-2 shadow-2xl">
                        <div className="text-[10px] font-semibold text-brand-muted px-2 py-1 border-b border-white/5 mb-1.5 uppercase tracking-wider">
                          {t('navbar.regionLanguage')}
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {REGIONS.map((region) => (
                            <div key={region.name} className="space-y-0.5">
                              <div className="text-[10px] uppercase font-bold text-brand-primary/80 px-2 tracking-wider">
                                {region.flag} {region.name}
                              </div>
                              {region.languages.map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={() => handleLanguageChange(lang.code)}
                                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all flex items-center gap-2 cursor-pointer ${
                                    i18n.language === lang.code
                                      ? 'bg-brand-primary/20 text-white border border-brand-primary/30 font-medium'
                                      : 'text-brand-text hover:bg-white/5 hover:text-white border border-transparent'
                                  }`}
                                >
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/login" className="text-brand-muted hover:text-white transition-colors duration-200 font-semibold text-sm">
                  {t('navbar.login')}
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">
                  {t('navbar.getStarted')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-brand-muted hover:bg-white/5 hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand-dark px-4 py-3 space-y-3 shadow-2xl" id="mobile-menu">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={isActiveRoute('/dashboard')
                ? "block text-base font-bold text-brand-primary px-3 py-2 rounded-md bg-brand-primary/10 border-l-2 border-brand-primary"
                : "block text-base font-medium text-brand-muted hover:text-white px-3 py-2 rounded-md hover:bg-white/5"
              }
            >
              {t('navbar.dashboard')}
            </Link>
          )}
          <Link
            to="/exercises"
            onClick={() => setIsOpen(false)}
            className={isActiveRoute('/exercises')
              ? "block text-base font-bold text-brand-primary px-3 py-2 rounded-md bg-brand-primary/10 border-l-2 border-brand-primary"
              : "block text-base font-medium text-brand-muted hover:text-white px-3 py-2 rounded-md hover:bg-white/5"
            }
          >
            {t('navbar.exercises')}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className={isActiveRoute('/history')
                  ? "block text-base font-bold text-brand-primary px-3 py-2 rounded-md bg-brand-primary/10 border-l-2 border-brand-primary"
                  : "block text-base font-medium text-brand-muted hover:text-white px-3 py-2 rounded-md hover:bg-white/5"
                }
              >
                {t('navbar.history')}
              </Link>
              <Link
                to="/log"
                onClick={() => setIsOpen(false)}
                className={isActiveRoute('/log')
                  ? "block text-base font-bold text-brand-primary px-3 py-2 rounded-md bg-brand-primary/10 border-l-2 border-brand-primary"
                  : "block text-base font-medium text-brand-muted hover:text-white px-3 py-2 rounded-md hover:bg-white/5"
                }
              >
                {t('navbar.logWorkout')}
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={isActiveRoute('/profile')
                  ? "flex items-center gap-2 text-base font-bold text-brand-primary px-3 py-2 rounded-md bg-brand-primary/10 border-l-2 border-brand-primary group"
                  : "flex items-center gap-2 text-base font-medium text-brand-muted hover:text-white px-3 py-2 rounded-md hover:bg-white/5 group"
                }
              >
                <UserIcon className={`h-5 w-5 transition-colors duration-200 ${isActiveRoute('/profile') ? 'text-brand-primary' : 'text-brand-muted group-hover:text-white'}`} />
                {t('navbar.profile')} ({user?.name})
              </Link>
              
              {/* Mobile Language Selector */}
              <div className="pt-2 border-t border-white/10 px-3 py-2 space-y-2">
                <div className="text-xs uppercase font-bold text-brand-muted flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> {t('navbar.regionLanguage')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map((region) => 
                    region.languages.map((lang) => (
                      <button
                        key={`${region.name}-${lang.code}`}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsOpen(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border ${
                          i18n.language === lang.code
                            ? 'bg-brand-primary/20 text-white border-brand-primary/30 font-medium'
                            : 'bg-white/5 text-brand-text border-transparent hover:bg-white/10'
                        }`}
                      >
                        <span>{region.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-left text-base font-medium text-red-400 px-3 py-2 rounded-md hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                {t('navbar.signOut')}
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-white/10 space-y-3">
              {/* Mobile Language Selector */}
              <div className="px-3 py-2 space-y-2">
                <div className="text-xs uppercase font-bold text-brand-muted flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> {t('navbar.regionLanguage')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map((region) => 
                    region.languages.map((lang) => (
                      <button
                        key={`${region.name}-${lang.code}`}
                        onClick={() => {
                          handleLanguageChange(lang.code);
                          setIsOpen(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border ${
                          i18n.language === lang.code
                            ? 'bg-brand-primary/20 text-white border-brand-primary/30 font-medium'
                            : 'bg-white/5 text-brand-text border-transparent hover:bg-white/10'
                        }`}
                      >
                        <span>{region.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-base font-medium text-brand-text hover:text-white py-2 rounded-md hover:bg-white/5"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center btn-primary py-2.5"
                >
                  {t('navbar.getStarted')}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
