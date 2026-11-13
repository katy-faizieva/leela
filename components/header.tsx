'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './language-switcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-cream border-b border-olive/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-script text-2xl text-text-dark">
            Ekaterina
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-montserrat text-text-dark/70 hover:text-olive transition">Главная</Link>
            <Link href="/about" className="font-montserrat text-text-dark/70 hover:text-olive transition">Обо мне</Link>
            <Link href="/services" className="font-montserrat text-text-dark/70 hover:text-olive transition">Тарифы</Link>
            <Link href="/gift" className="font-montserrat text-text-dark/70 hover:text-olive transition">Сертификат</Link>
            <Link href="/booking" className="font-montserrat text-text-dark/70 hover:text-olive transition">Записаться</Link>
            <Link href="/contact" className="font-montserrat text-text-dark/70 hover:text-olive transition">Контакты</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <a 
              href="https://t.me/k_f_6666"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-olive text-white font-montserrat text-sm font-medium rounded-full hover:bg-olive-dark transition-colors"
            >
              Записаться на урок
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-text-dark"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-olive/20">
            <div className="flex flex-col space-y-4 px-4">
              <Link href="/" className="font-montserrat text-text-dark/70 hover:text-olive transition py-2" onClick={() => setIsMenuOpen(false)}>Главная</Link>
              <Link href="/about" className="font-montserrat text-text-dark/70 hover:text-olive transition py-2" onClick={() => setIsMenuOpen(false)}>Обо мне</Link>
              <Link href="/services" className="font-montserrat text-text-dark/70 hover:text-olive transition py-2" onClick={() => setIsMenuOpen(false)}>Тарифы</Link>
              <Link href="/gift" className="font-montserrat text-text-dark/70 hover:text-olive transition py-2" onClick={() => setIsMenuOpen(false)}>Сертификат</Link>
              <Link href="/booking" className="font-montserrat text-text-dark/70 hover:text-olive transition py-2" onClick={() => setIsMenuOpen(false)}>Записаться</Link>
              <Link href="/contact" className="font-montserrat text-text-dark/70 hover:text-olive transition py-2" onClick={() => setIsMenuOpen(false)}>Контакты</Link>
              <a 
                href="https://t.me/k_f_6666"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center px-6 py-3 bg-olive text-white font-montserrat text-sm font-medium rounded-full hover:bg-olive-dark transition-colors"
              >
                Записаться на урок
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
