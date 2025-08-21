import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Assignment, Question } from '../../types';
import { Plus, Trash2, Save } from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (assignment: Assignment) => void;
}

export function CreateAssignmentModal({ isOpen, onClose, onCreate }: CreateAssignmentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    points: 10
  });

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim())) {
      setQuestions(prev => [...prev, { ...currentQuestion }]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        points: 10
      });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCurrentQuestionOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !topic || !dueDate || questions.length === 0) {
      return;
    }

    const newAssignment: Assignment = {
      id: Math.random().toString(),
      title,
      description,
      topic,
      difficulty,
      questions: questions.map((q, index) => ({
        ...q,
        id: `q_${index + 1}`
      })),
      due_date: new Date(dueDate).toISOString(),
      created_at: new Date().toISOString(),
      created_by: 'admin'
    };

    onCreate(newAssignment);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTopic('');
    setDifficulty('easy');
    setDueDate('');
    setQuestions([]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      points: 10
    });
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новое задание</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название задания</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название задания"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Тема</Label>
              <Select value={topic} onValueChange={setTopic} required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тему" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Системы счисления">Системы счисления</SelectItem>
                  <SelectItem value="Алгоритмизация">Алгоритмизация</SelectItem>
                  <SelectItem value="Информация и кодирование">Информация и кодирование</SelectItem>
                  <SelectItem value="Логика">Логика</SelectItem>
                  <SelectItem value="Базы данных">Базы данных</SelectItem>
                  <SelectItem value="Электронные таблицы">Электронные таблицы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Сложность</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Легкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="hard">Сложный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Срок сдачи</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите задание и его цели"
              rows={3}
              required
            />
          </div>

          {/* Existing Questions */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Добавленные вопросы ({questions.length})</h3>
                <Badge variant="outline">Общий балл: {totalPoints}</Badge>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {questions.map((question, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium mb-2">Вопрос {index + 1}: {question.question}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {question.options.map((option, optIndex) => (
                              <p key={optIndex} className={optIndex === question.correct_answer ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                {optIndex === question.correct_answer ? '✓ ' : ''}{option}
                              </p>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Баллов: {question.points}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add New Question */}
          <Card>
            <CardHeader>
              <CardTitle>Добавить вопрос</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Текст вопроса</Label>
                <Textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Введите текст вопроса"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Варианты ответов</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={currentQuestion.correct_answer === index}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correct_answer: index }))}
                        />
                        <Label className="text-sm">Вариант {index + 1}</Label>
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => updateCurrentQuestionOption(index, e.target.value)}
                        placeholder={`Вариант ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="explanation">Объяснение</Label>
                  <Textarea
                    id="explanation"
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Объяснение правильного ответа"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Количество баллов</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="50"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="w-full"
                disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt.trim())}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить вопрос
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={!title || !description || !topic || !dueDate || questions.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Создать задание
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}