import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { CheckCircle, Code, Calculator, MessageCircle, BookOpen, Lightbulb } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Задание 6. Простые алгоритмы",
    difficulty: "Легкая",
    points: 1,
    topic: "Алгоритмы",
    description: "Определите значение переменной после выполнения алгоритма",
    problem: `Дан алгоритм:
s := 0
n := 1
while n <= 100 do
  s := s + n
  n := n + 1
end

Чему равно значение переменной s после выполнения данного алгоритма?`,
    solution: "5050",
    explanation: "Алгоритм вычисляет сумму чисел от 1 до 100. Используя формулу арифметической прогрессии: S = n(n+1)/2 = 100×101/2 = 5050"
  },
  {
    id: 2,
    title: "Задание 8. Анализ программы",
    difficulty: "Средняя",
    points: 1,
    topic: "Программирование",
    description: "Проанализируйте работу программы и найдите результат",
    problem: `Программа на языке Python:

def mystery_function(x, y):
    result = 0
    while x > 0:
        if x % 2 == 1:
            result = result + y
        x = x // 2
        y = y * 2
    return result

print(mystery_function(13, 5))

Что выведет данная программа?`,
    steps: [
      "Начальные значения: x = 13, y = 5, result = 0",
      "Итерация 1: x = 13 (нечетное), result = 0 + 5 = 5, x = 6, y = 10",
      "Итерация 2: x = 6 (четное), result = 5, x = 3, y = 20",
      "Итерация 3: x = 3 (нечетное), result = 5 + 20 = 25, x = 1, y = 40",
      "Итерация 4: x = 1 (нечетное), result = 25 + 40 = 65, x = 0, y = 80",
      "Цикл завершается, функция возвращает 65"
    ],
    solution: "65",
    explanation: "Эта функция реализует алгоритм быстрого умножения. Она вычисляет произведение x × y = 13 × 5 = 65 через двоичное представление числа 13."
  }
];

export function PracticeSection() {
  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTelegramClick = () => {
    window.open('https://t.me/IRK_Dmitry_Teplyashin', '_blank');
  };

  const openTask = (task: typeof tasks[0]) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  return (
    <>
      <section id="practice" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
              Практические задания
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Попробуйте решить задания ЕГЭ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Протестируйте свои знания на реальных заданиях из экзамена. 
              Все задания разобраны с подробными объяснениями
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={task.difficulty === "Легкая" ? "secondary" : "default"}>
                      {task.difficulty}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{task.points} балл</p>
                      <p className="text-xs text-gray-500">{task.topic}</p>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {task.problem.split('\n')[0]}...
                    </p>
                  </div>
                  <Button 
                    onClick={() => openTask(task)}
                    variant="outline" 
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-300"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Открыть задание
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Хотите разобрать эти задания вместе?
              </h3>
              <p className="text-gray-600 mb-6">
                Запишитесь на консультацию за 1000 рублей! Разберем ваши сложности 
                и составим индивидуальный план подготовки
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleTelegramClick} size="lg" className="px-8">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Записаться на консультацию
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8"
                  onClick={handleTelegramClick}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Узнать больше о курсе
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={selectedTask.difficulty === "Легкая" ? "secondary" : "default"}>
                    {selectedTask.difficulty}
                  </Badge>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">{selectedTask.points} балл</span>
                  </div>
                </div>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  {selectedTask.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Условие задачи
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedTask.problem.split('\n').map((line, index) => (
                      <p key={index} className="text-sm text-gray-700 mb-1 font-mono">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {selectedTask.steps && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Calculator className="w-4 h-4 mr-2" />
                      Пошаговое решение
                    </h4>
                    <div className="space-y-2">
                      {selectedTask.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 font-mono">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Ответ и объяснение
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="font-bold text-green-800 mb-2">Ответ: {selectedTask.solution}</p>
                    <p className="text-sm text-green-700">{selectedTask.explanation}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-3">
                    <strong>Нужна помощь с такими заданиями?</strong> Записывайтесь на индивидуальные занятия!
                  </p>
                  <Button onClick={handleTelegramClick} size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Записаться на занятие
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}