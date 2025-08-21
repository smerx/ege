import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Phone, Mail, MessageCircle, MapPin, Clock, GraduationCap } from "lucide-react";

export function Footer() {
  const handleTelegramClick = () => {
    window.open('https://t.me/IRK_Dmitry_Teplyashin', '_blank');
  };

  const handleCallClick = () => {
    window.open('tel:+79041237534', '_blank');
  };

  const handleEmailClick = () => {
    window.open('mailto:smerx620@gmail.com', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/79041237534?text=Здравствуйте! Интересует подготовка к ЕГЭ/ОГЭ по информатике', '_blank');
  };

  return (
    <>
      {/* Contact Section */}
      <section id="contacts" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Свяжитесь со мной
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Готов ответить на любые вопросы о подготовке к ЕГЭ и ОГЭ по информатике
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Телефон</h3>
                      <p className="text-gray-600">+7 904 123-75-34</p>
                      <Button 
                        onClick={handleCallClick}
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Позвонить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Telegram</h3>
                      <p className="text-gray-600">@IRK_Dmitry_Teplyashin</p>
                      <Button 
                        onClick={handleTelegramClick}
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Написать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">smerx620@gmail.com</p>
                      <Button 
                        onClick={handleEmailClick}
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Написать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Местоположение</h3>
                      <p className="text-gray-600">Иркутск, Россия</p>
                      <p className="text-sm text-gray-500 mt-1">Онлайн и офлайн занятия</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Card */}
            <div className="lg:flex lg:items-center">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Запишитесь сейчас!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Первая консультация — всего 1000 рублей. Определим уровень знаний и составим план подготовки.
                      </p>
                      <div className="bg-white/70 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Режим работы:</span>
                        </div>
                        <p className="text-sm text-gray-700">Пн-Вс: 9:00 - 21:00</p>
                        <p className="text-xs text-gray-500 mt-1">Ответ в течение часа</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        onClick={handleTelegramClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Написать в Telegram
                      </Button>
                      <Button 
                        onClick={handleWhatsAppClick}
                        variant="outline" 
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Дмитрий Тепляшин</h3>
                  <p className="text-sm text-gray-400">ЕГЭ/ОГЭ Информатика</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Программист ГК Форус, преподаватель информатики с 5-летним опытом подготовки к экзаменам.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>+7 904 123-75-34</p>
                <p>smerx620@gmail.com</p>
                <p>@IRK_Dmitry_Teplyashin</p>
                <p>Иркутск, Россия</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Подготовка к ЕГЭ по информатике</p>
                <p>Подготовка к ОГЭ по информатике</p>
                <p>Индивидуальные занятия</p>
                <p>Онлайн и офлайн формат</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Дмитрий Тепляшин. Подготовка к ЕГЭ/ОГЭ по информатике в Иркутске.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}