import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Menu, X, GraduationCap, Phone, MessageCircle } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setView } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/IRK_Dmitry_Teplyashin', '_blank');
  };

  const handleCallClick = () => {
    window.open('tel:+79041237534', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Дмитрий Тепляшин</h1>
              <p className="text-xs text-gray-600">ЕГЭ/ОГЭ Информатика</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              О преподавателе
            </button>
            <button
              onClick={() => scrollToSection('achievements')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Достижения
            </button>
            <button
              onClick={() => scrollToSection('practice')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Задания
            </button>
            <button
              onClick={() => scrollToSection('contacts')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Контакты
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={handleCallClick}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Phone className="w-4 h-4 mr-2" />
              Позвонить
            </Button>
            <Button
              onClick={handleTelegramClick}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Записаться
            </Button>
            <Button
              onClick={() => setView('login')}
              variant="outline"
              size="sm"
            >
              Войти
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-4">
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                О преподавателе
              </button>
              <button
                onClick={() => scrollToSection('achievements')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Достижения
              </button>
              <button
                onClick={() => scrollToSection('practice')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Задания
              </button>
              <button
                onClick={() => scrollToSection('contacts')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Контакты
              </button>
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Button
                  onClick={handleCallClick}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Позвонить
                </Button>
                <Button
                  onClick={handleTelegramClick}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Записаться
                </Button>
                <Button
                  onClick={() => {
                    setView('login');
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Войти в систему
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}