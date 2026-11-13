'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ru');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    setCurrentLang(code);
    setIsOpen(false);
    
    // Google Translate integration
    const googleTranslateUrl = `https://translate.google.com/translate?sl=ru&tl=${code}&u=${encodeURIComponent(window.location.href)}`;
    if (code !== 'ru') {
      window.open(googleTranslateUrl, '_blank');
    }
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-text-dark/70 hover:text-olive transition rounded-lg hover:bg-olive/5"
        aria-label="Выбрать язык"
      >
        <Globe className="w-4 h-4" />
        <span className="font-montserrat text-sm">{current.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-olive/20 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-olive/5 transition ${
                currentLang === lang.code ? 'bg-olive/10' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-montserrat text-sm text-text-dark">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
