import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Code, Trophy, Users } from "lucide-react";
import { CONTACT_INFO, ACHIEVEMENTS, PHOTOS } from "../constants/mockData";

export function AboutSection() {
  const benefits = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Практический опыт",
      description: "Работаю программистом в ГК Форус — знаю, как применять теорию на практике"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Высокие результаты",
      description: `Сам сдал ЕГЭ на ${ACHIEVEMENTS.egeScore} баллов, понимаю все тонкости экзамена`
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Индивидуальный подход",
      description: "Каждый ученик получает персональный план обучения и постоянную поддержку"
    }
  ];

  const skills = [
    "Python, Java, C++",
    "Алгоритмы и структуры данных", 
    "ОГЭ/ЕГЭ по информатике",
    "Олимпиадное программирование",
    "Веб-разработка",
    "Базы данных"
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Обо мне
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Преподаватель информатики с практическим опытом
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Я — {CONTACT_INFO.name}, программист в {CONTACT_INFO.company} и преподаватель информатики. 
            Помогаю ученикам не только сдать экзамены, но и полюбить программирование.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Мой подход к обучению</h3>
              <p className="text-gray-600 leading-relaxed">
                Работая программистом в {CONTACT_INFO.company}, я понимаю, какие знания действительно нужны в IT. 
                Мой опыт сдачи ЕГЭ на {ACHIEVEMENTS.egeScore} баллов помогает ученикам избежать типичных ошибок и эффективно подготовиться к экзаменам.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Каждое занятие строится на практических задачах и реальных примерах из профессиональной деятельности. 
                Это помогает не только сдать экзамен, но и понять, как программирование применяется в жизни.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Технологии и навыки:</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-white text-gray-700 hover:bg-gray-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src={PHOTOS.profile}
                alt="Дмитрий Андреевич Тепляшин в офисе"
                className="w-full max-w-sm mx-auto rounded-2xl shadow-xl"
                loading="lazy"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-64 h-64 bg-blue-100 rounded-full opacity-30 z-0"></div>
            <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-indigo-100 rounded-full opacity-30 z-0"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Почему выбирают меня</h3>
            <p className="text-gray-600">Результаты говорят сами за себя</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 mb-2">{ACHIEVEMENTS.studentsCount}+</p>
              <p className="text-gray-600">учеников подготовлено</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600 mb-2">{ACHIEVEMENTS.egeScore}</p>
              <p className="text-gray-600">баллов мой ЕГЭ</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600 mb-2">{ACHIEVEMENTS.averageStudentScore}</p>
              <p className="text-gray-600">средний балл учеников</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600 mb-2">{ACHIEVEMENTS.experienceYears}+</p>
              <p className="text-gray-600">лет опыта в IT</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Что получают ученики:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    Персональный план подготовки к экзамену
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    Практические навыки программирования
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    Разбор реальных заданий ЕГЭ/ОГЭ
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    Поддержку и мотивацию на всем пути
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                  Форматы обучения:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    Индивидуальные занятия онлайн
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    Очные встречи в Иркутске
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    Гибкий график занятий
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    Материалы и задания для самостоятельной работы
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}