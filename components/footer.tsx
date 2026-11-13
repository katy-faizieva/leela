import Link from 'next/link';
import { Mail, Send, Phone, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-olive/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-script text-2xl text-text-dark block mb-4">Ekaterina</span>
            <p className="font-montserrat text-text-dark/70 mb-4">
              Online English Teacher
            </p>
          </div>

          <div>
            <h3 className="font-playfair text-lg text-text-dark mb-4">Страницы</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="font-montserrat text-text-dark/70 hover:text-olive transition">Обо мне</Link></li>
              <li><Link href="/services" className="font-montserrat text-text-dark/70 hover:text-olive transition">Тарифы</Link></li>
              <li><Link href="/booking" className="font-montserrat text-text-dark/70 hover:text-olive transition">Записаться</Link></li>
              <li><Link href="/contact" className="font-montserrat text-text-dark/70 hover:text-olive transition">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-playfair text-lg text-text-dark mb-4">Связь со мной</h3>
            <div className="space-y-3">
              <a href="https://t.me/k_f_6666" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <Send className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70 group-hover:text-olive transition">Telegram</span>
              </a>
              <a href="https://wa.me/79500980860" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70 group-hover:text-olive transition">WhatsApp</span>
              </a>
              <a href="https://www.instagram.com/katy_affogato?igsh=MXQ3OTIzamk5cDR4MA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <Instagram className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70 group-hover:text-olive transition">Instagram</span>
              </a>
              <a href="mailto:efaizieva@mail.ru" className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70 group-hover:text-olive transition">efaizieva@mail.ru</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-olive/20 mt-8 pt-8 text-center">
          <p className="font-montserrat text-text-dark/50 text-sm">© 2026 Екатерина. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
