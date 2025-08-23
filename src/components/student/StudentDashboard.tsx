import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import {
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  LogOut,
  GraduationCap,
  Send,
  Award,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Assignment {
  id: string;
  title: string;
  description: string;
  max_score: number;
  image_urls: string[];
  created_at: string;
}

interface TheoryBlock {
  id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  status: "pending" | "graded";
}

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [theoryBlocks, setTheoryBlocks] = useState<TheoryBlock[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load assignments
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });

      // Load theory blocks
      const { data: theoryData } = await supabase
        .from("theory_blocks")
        .select("*")
        .order("created_at", { ascending: false });

      // Load user's submissions
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false });

      setAssignments(assignmentsData || []);
      setTheoryBlocks(theoryData || []);
      setSubmissions(submissionsData || []);

      // Calculate average score
      const gradedSubmissions = (submissionsData || []).filter(
        (s) => s.status === "graded" && s.score !== null
      );
      if (gradedSubmissions.length > 0) {
        const avg =
          gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
          gradedSubmissions.length;
        setAverageScore(Math.round(avg));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionText.trim() || !user) return;

    try {
      const { error } = await supabase.from("submissions").insert({
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        content: submissionText,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Задание отправлено на проверку");
      setSubmissionText("");
      setIsSubmitDialogOpen(false);
      setSelectedAssignment(null);
      loadData();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Ошибка отправки задания");
    }
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find((s) => s.assignment_id === assignmentId);
  };

  const completedAssignments = submissions.filter(
    (s) => s.status === "graded"
  ).length;
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "pending"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Личный кабинет
                </h1>
                <p className="text-sm text-gray-600">
                  Добро пожаловать, {user?.firstName}!
                </p>
              </div>
            </div>
            <Button onClick={logout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Средний балл</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {averageScore}
                  </p>
                </div>
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Выполнено заданий</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedAssignments}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">На проверке</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingSubmissions}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Материалов</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {theoryBlocks.length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Задания</TabsTrigger>
            <TabsTrigger value="theory">Теория</TabsTrigger>
            <TabsTrigger value="progress">Прогресс</TabsTrigger>
          </TabsList>

          {/* Задания */}
          <TabsContent value="assignments" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Домашние задания
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignments.map((assignment) => {
                const submission = getSubmissionForAssignment(assignment.id);

                return (
                  <Card
                    key={assignment.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {assignment.title}
                        </CardTitle>
                        <div className="text-right">
                          <Badge
                            variant={
                              submission?.status === "graded"
                                ? "default"
                                : submission?.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {submission?.status === "graded"
                              ? "Проверено"
                              : submission?.status === "pending"
                              ? "На проверке"
                              : "Новое"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        {assignment.description}
                      </p>

                      {assignment.image_urls &&
                        assignment.image_urls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {assignment.image_urls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Изображение ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}

                      {submission?.status === "graded" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              Оценка: {submission.score}/{assignment.max_score}
                            </span>
                            <span className="text-sm text-green-600">
                              {Math.round(
                                (submission.score! / assignment.max_score) * 100
                              )}
                              %
                            </span>
                          </div>
                          {submission.feedback && (
                            <p className="text-sm text-green-700">
                              {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}

                      {submission?.status === "pending" && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-orange-700">
                            Задание отправлено на проверку{" "}
                            {new Date(
                              submission.submitted_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Макс. балл: {assignment.max_score}
                        </span>
                        {!submission && (
                          <Dialog
                            open={
                              isSubmitDialogOpen &&
                              selectedAssignment?.id === assignment.id
                            }
                            onOpenChange={(open) => {
                              setIsSubmitDialogOpen(open);
                              if (!open) setSelectedAssignment(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setSelectedAssignment(assignment)
                                }
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Отправить ответ
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] p-0">
                              <div className="max-h-[80vh] overflow-y-auto p-6">
                                <DialogHeader>
                                  <DialogTitle>Отправка задания</DialogTitle>
                                  <DialogDescription>
                                    {assignment.title} - максимум{" "}
                                    {assignment.max_score} баллов
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      Условие:
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="prose prose-sm">
                                        <ReactMarkdown>
                                          {assignment.description}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                    {assignment.image_urls &&
                                      assignment.image_urls.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                          {assignment.image_urls.map(
                                            (url, index) => (
                                              <img
                                                key={index}
                                                src={url}
                                                alt={`Изображение ${index + 1}`}
                                                className="w-full h-24 object-cover rounded"
                                              />
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Ваш ответ:
                                    </label>
                                    <Textarea
                                      value={submissionText}
                                      onChange={(e) =>
                                        setSubmissionText(e.target.value)
                                      }
                                      placeholder="Введите ваш код или ответ..."
                                      rows={8}
                                      className="mt-2 font-mono"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsSubmitDialogOpen(false);
                                        setSelectedAssignment(null);
                                        setSubmissionText("");
                                      }}
                                    >
                                      Отмена
                                    </Button>
                                    <Button
                                      onClick={handleSubmitAssignment}
                                      disabled={!submissionText.trim()}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Отправить
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Теория */}
          <TabsContent value="theory" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Теоретические материалы
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {theoryBlocks.map((theory) => (
                <Card key={theory.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                      {theory.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Добавлено:{" "}
                      {new Date(theory.created_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {theory.content}
                      </div>
                    </div>
                    {theory.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {theory.image_urls.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Изображение ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Прогресс */}
          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Ваш прогресс
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Общая статистика
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Выполнено заданий</span>
                      <span className="text-sm font-medium">
                        {completedAssignments}/{assignments.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        assignments.length > 0
                          ? (completedAssignments / assignments.length) * 100
                          : 0
                      }
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Средний балл</span>
                      <span className="text-sm font-medium">
                        {averageScore}%
                      </span>
                    </div>
                    <Progress value={averageScore} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>История оценок</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions
                      .filter((s) => s.status === "graded")
                      .map((submission) => {
                        const assignment = assignments.find(
                          (a) => a.id === submission.assignment_id
                        );
                        return (
                          <div
                            key={submission.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {assignment?.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  submission.submitted_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant={
                                submission.score! >=
                                (assignment?.max_score || 0) * 0.8
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {submission.score}/{assignment?.max_score}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
