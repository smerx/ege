import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Users,
  Award,
  TrendingUp,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import {
  CONTACT_INFO,
  ACHIEVEMENTS,
  PHOTOS,
  generateStudentResults,
} from "../constants/mockData";

export function AchievementsSection() {
  const [results, setResults] = useState<number[]>([]);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  useEffect(() => {
    setResults(generateStudentResults());
  }, []);

  const handleTelegramClick = () => {
    window.open(`https://t.me/${CONTACT_INFO.telegram.slice(1)}`, "_blank");
  };

  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/${CONTACT_INFO.phone.replace(
        /\s+/g,
        ""
      )}?text=Здравствуйте! Интересует подготовка к ЕГЭ/ОГЭ по информатике`,
      "_blank"
    );
  };

  const averageScore =
    results.length > 0
      ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
      : ACHIEVEMENTS.averageStudentScore;

  return (
    <>
      <section id="achievements" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              Результаты учеников
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Мои ученики поступают в лучшие вузы
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              За последние годы более {ACHIEVEMENTS.studentsCount} учеников
              успешно сдали ЕГЭ и ОГЭ по информатике, поступив в ведущие
              технические университеты России
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <img
                  src={PHOTOS.baikal}
                  alt="Дмитрий Андреевич на Байкале"
                  className="w-full h-64 object-cover rounded-2xl shadow-xl"
                  loading="lazy"
                />
                <div className="bg-white rounded-lg shadow-lg p-3 mt-4 text-center">
                  <p className="font-semibold text-gray-900">
                    Отдых на Байкале
                  </p>
                  <p className="text-sm text-gray-600">
                    Заряжаюсь энергией для новых достижений
                  </p>
                </div>
              </div>
              <img
                src={PHOTOS.vladivostok}
                alt="Дмитрий Андреевич во Владивостоке"
                className="w-full h-32 object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">
                    {ACHIEVEMENTS.studentsCount}+
                  </p>
                  <p className="text-xs text-blue-600">учеников</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {ACHIEVEMENTS.studentsCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      учеников подготовлено
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {averageScore}
                    </p>
                    <p className="text-sm text-gray-600">средний балл ЕГЭ</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Последние результаты ЕГЭ:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.slice(0, 8).map((score, index) => (
                    <Badge
                      key={index}
                      variant={
                        score >= 80
                          ? "default"
                          : score >= 70
                          ? "secondary"
                          : "outline"
                      }
                      className={`text-sm px-3 py-1 ${
                        score >= 80
                          ? "bg-green-100 text-green-800"
                          : score >= 70
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {score} баллов
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResultsDialogOpen(true)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Посмотреть все результаты
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Мои преимущества:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Работаю программистом в {CONTACT_INFO.company} — знаю, как
                    применять знания на практике
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Сам сдал ЕГЭ на {ACHIEVEMENTS.egeScore} баллов — понимаю все
                    подводные камни
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Индивидуальный подход к каждому ученику
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Возможность заниматься онлайн и офлайн
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleTelegramClick} className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Записаться на пробное
                </Button>
                <Button
                  onClick={handleWhatsAppClick}
                  variant="outline"
                  className="flex-1 text-white bg-green-600 border-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Результаты всех {ACHIEVEMENTS.studentsCount} учеников ЕГЭ 2024
            </DialogTitle>
            <DialogDescription>
              Полная статистика результатов моих учеников за последний учебный
              год
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
              {results.map((score, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg border text-sm ${
                    score >= 80
                      ? "bg-green-50 border-green-200"
                      : score >= 70
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="font-bold">{score}</p>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    Средний балл:{" "}
                    <span className="font-semibold text-gray-900">
                      {averageScore}
                    </span>
                  </p>
                  <p>
                    Всего учеников:{" "}
                    <span className="font-semibold text-gray-900">
                      {ACHIEVEMENTS.studentsCount}
                    </span>
                  </p>
                </div>
                <div>
                  <p>
                    Результат 80+:{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.round(
                        (results.filter((score) => score >= 80).length /
                          results.length) *
                          100
                      )}
                      %
                    </span>
                  </p>
                  <p>
                    Результат 70+:{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.round(
                        (results.filter((score) => score >= 70).length /
                          results.length) *
                          100
                      )}
                      %
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
