import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Phone, MessageCircle, Users, Award, Clock, Star } from "lucide-react";
import { CONTACT_INFO, ACHIEVEMENTS, PHOTOS } from "../constants/mockData";

export function HeroSection() {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const handleTelegramClick = () => {
    window.open(`https://t.me/${CONTACT_INFO.telegram.slice(1)}`, '_blank');
  };

  const handleCallClick = () => {
    setIsCallDialogOpen(true);
  };

  return (
    <>
      <section id="hero" className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2" />
                  Осталось всего {CONTACT_INFO.availableSlots} места!
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Подготовка к ЕГЭ/ОГЭ по
                  <span className="text-blue-600"> информатике</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Индивидуальный подход и проверенная методика от преподавателя, который сам сдал ЕГЭ на {ACHIEVEMENTS.egeScore} баллов и работает программистом в {CONTACT_INFO.company}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ACHIEVEMENTS.studentsCount}+ учеников</p>
                    <p className="text-sm text-gray-600">успешно подготовлены</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ACHIEVEMENTS.egeScore} баллов</p>
                    <p className="text-sm text-gray-600">мой результат ЕГЭ</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{CONTACT_INFO.company}</p>
                    <p className="text-sm text-gray-600">программист</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Онлайн/Офлайн</p>
                    <p className="text-sm text-gray-600">удобный формат</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleTelegramClick}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Записаться на занятие
                </Button>
                <Button 
                  onClick={handleCallClick}
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить сейчас
                </Button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Контакты преподавателя:</p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">{CONTACT_INFO.name}</span></p>
                  <p>Телефон: <span className="font-medium">{CONTACT_INFO.phone}</span></p>
                  <p>Email: <span className="font-medium">{CONTACT_INFO.email}</span></p>
                  <p>Telegram: <span className="font-medium">{CONTACT_INFO.telegram}</span></p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src={PHOTOS.profile}
                  alt="Дмитрий Андреевич Тепляшин - преподаватель информатики"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                  loading="lazy"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full opacity-20 z-0"></div>
              <div className="absolute -bottom-4 -left-4 w-56 h-56 bg-indigo-200 rounded-full opacity-20 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Связаться по телефону
            </DialogTitle>
            <DialogDescription>
              Позвоните мне для консультации или записи на занятие
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 mb-2">{CONTACT_INFO.phone}</p>
              <p className="text-sm text-gray-600">{CONTACT_INFO.name}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open(`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`)}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                Позвонить
              </Button>
              <Button 
                onClick={handleTelegramClick}
                variant="outline" 
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Telegram
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}