import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Alert } from '../ui/alert';
import { Assignment, StudentAssignment, Question } from '../../types';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Save,
  Send
} from 'lucide-react';

interface AssignmentViewProps {
  assignment: Assignment;
  studentAssignment?: StudentAssignment;
  onBack: () => void;
}

export function AssignmentView({ assignment, studentAssignment, onBack }: AssignmentViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 час
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Мок данные вопросов
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        question: 'Переведите число 1011₂ в десятичную систему счисления:',
        options: ['9', '11', '13', '15'],
        correct_answer: 1,
        explanation: '1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰ = 8 + 0 + 2 + 1 = 11',
        points: 10
      },
      {
        id: '2',
        question: 'Сколько единиц в двоичной записи числа 15?',
        options: ['2', '3', '4', '5'],
        correct_answer: 2,
        explanation: '15₁₀ = 1111₂, содержит 4 единицы',
        points: 10
      },
      {
        id: '3',
        question: 'Какое число в шестнадцатеричной системе соответствует числу 255₁₀?',
        options: ['EF', 'FF', '100', 'FE'],
        correct_answer: 1,
        explanation: '255₁₀ = FF₁₆',
        points: 15
      },
      {
        id: '4',
        question: 'В какой системе счисления записано число 123, если в десятичной системе оно равно 83?',
        options: ['7', '8', '9', '12'],
        correct_answer: 1,
        explanation: '123₈ = 1×8² + 2×8¹ + 3×8⁰ = 64 + 16 + 3 = 83₁₀',
        points: 20
      }
    ];

    setQuestions(mockQuestions);

    // Загружаем сохраненные ответы если задание уже выполнялось
    if (studentAssignment?.answers) {
      const savedAnswers: { [questionId: string]: number } = {};
      studentAssignment.answers.forEach(answer => {
        savedAnswers[answer.question_id] = answer.selected_answer;
      });
      setAnswers(savedAnswers);
    }

    if (studentAssignment?.status === 'completed') {
      setIsSubmitted(true);
    }
  }, [studentAssignment]);

  // Таймер
  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (questionId: string, answer: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const saveProgress = () => {
    // В реальном приложении здесь будет сохранение в Supabase
    console.log('Прогресс сохранен:', answers);
  };

  const submitAssignment = () => {
    if (timeLeft === 0 || Object.keys(answers).length === questions.length) {
      setIsSubmitted(true);
      // В реальном приложении здесь будет отправка в Supabase
      console.log('Задание отправлено:', answers);
    }
  };

  const getAnswerStatus = (questionId: string) => {
    if (!isSubmitted || !studentAssignment?.answers) return null;
    
    const answer = studentAssignment.answers.find(a => a.question_id === questionId);
    return answer?.is_correct;
  };

  const getTotalScore = () => {
    if (!isSubmitted || !studentAssignment?.answers) return 0;
    return studentAssignment.answers.reduce((total, answer) => total + answer.points_earned, 0);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Загрузка задания...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="font-semibold">{assignment.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{assignment.topic}</Badge>
                  <span>•</span>
                  <span>Вопрос {currentQuestionIndex + 1} из {questions.length}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isSubmitted && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              {isSubmitted && (
                <Badge className="bg-green-100 text-green-800">
                  Завершено: {getTotalScore()}/{questions.reduce((sum, q) => sum + q.points, 0)} баллов
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Прогресс</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Question */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Вопрос {currentQuestionIndex + 1}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestion.points} баллов
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {currentQuestion.question}
                </ReactMarkdown>
              </div>

              <RadioGroup
                value={answers[currentQuestion.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                disabled={isSubmitted}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index;
                  const isCorrect = index === currentQuestion.correct_answer;
                  const answerStatus = getAnswerStatus(currentQuestion.id);
                  
                  let optionClass = '';
                  if (isSubmitted) {
                    if (isCorrect) {
                      optionClass = 'border-green-500 bg-green-50';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'border-red-500 bg-red-50';
                    }
                  }

                  return (
                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border ${optionClass}`}>
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                      {isSubmitted && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>

              {isSubmitted && (
                <Alert>
                  <div className="space-y-2">
                    <p className="font-medium">Объяснение:</p>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Предыдущий вопрос
          </Button>

          <div className="flex space-x-3">
            {!isSubmitted && (
              <Button variant="outline" onClick={saveProgress}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить прогресс
              </Button>
            )}

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              >
                Следующий вопрос
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : !isSubmitted ? (
              <Button
                onClick={submitAssignment}
                disabled={Object.keys(answers).length < questions.length}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Отправить задание
              </Button>
            ) : null}
          </div>
        </div>

        {/* Question Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Обзор вопросов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((_, index) => {
                const isAnswered = answers[questions[index].id] !== undefined;
                const isCurrent = index === currentQuestionIndex;
                const answerStatus = getAnswerStatus(questions[index].id);

                let buttonClass = 'w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors ';
                
                if (isCurrent) {
                  buttonClass += 'border-blue-500 bg-blue-100 text-blue-700 ';
                } else if (isSubmitted && answerStatus === true) {
                  buttonClass += 'border-green-500 bg-green-100 text-green-700 ';
                } else if (isSubmitted && answerStatus === false) {
                  buttonClass += 'border-red-500 bg-red-100 text-red-700 ';
                } else if (isAnswered) {
                  buttonClass += 'border-gray-400 bg-gray-100 text-gray-700 ';
                } else {
                  buttonClass += 'border-gray-200 bg-white text-gray-400 ';
                }

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={buttonClass}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}