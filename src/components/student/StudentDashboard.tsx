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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
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
  ChevronDown,
  ChevronRight,
  Lock,
  Filter,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImagePreview } from "../ui/image-preview";
import { ContentFormatter } from "../ui/content-formatter";

interface Assignment {
  id: string;
  title: string;
  description: string;
  max_score: number;
  image_urls: string[];
  created_at: string;
  assignment_access?: { student_id: string }[];
}

interface TheoryBlock {
  id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  theory_access?: { student_id: string }[];
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
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [expandedTheoryBlocks, setExpandedTheoryBlocks] = useState<Set<string>>(
    new Set()
  );

  // Filter states
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "homework" | "classwork">("all");
  const [assignmentSearch, setAssignmentSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load all assignments with optional access info
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select(
          `
          *,
          assignment_access(student_id)
        `
        )
        .order("created_at", { ascending: false });

      // Load all theory blocks with optional access info
      const { data: theoryData } = await supabase
        .from("theory_blocks")
        .select(
          `
          *,
          theory_access(student_id)
        `
        )
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

  const openImagePreview = (
    images: string[],
    index: number = 0,
    title?: string
  ) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setPreviewTitle(title || "");
    setIsPreviewOpen(true);
  };

  const toggleTheoryBlock = (blockId: string) => {
    setExpandedTheoryBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const hasAccessToAssignment = (
    assignment: Assignment & { assignment_access?: { student_id: string }[] }
  ) => {
    return (
      assignment.assignment_access?.some(
        (access) => access.student_id === user?.id
      ) || false
    );
  };

  const hasAccessToTheory = (
    theory: TheoryBlock & { theory_access?: { student_id: string }[] }
  ) => {
    return (
      theory.theory_access?.some((access) => access.student_id === user?.id) ||
      false
    );
  };

  const completedAssignments = submissions.filter(
    (s) => s.status === "graded"
  ).length;
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "pending"
  ).length;

  // Filter assignments based on type and search
  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by type (homework/classwork)
    const typeMatch = (() => {
      if (assignmentFilter === "all") return true;
      
      const title = assignment.title.toLowerCase();
      if (assignmentFilter === "homework") {
        return title.includes("домашняя работа") || title.includes("домашнее задание");
      }
      if (assignmentFilter === "classwork") {
        return title.includes("классная работа") || title.includes("классное задание");
      }
      return true;
    })();

    // Filter by search text
    const searchMatch = assignmentSearch.trim() === "" || 
      assignment.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      assignment.description.toLowerCase().includes(assignmentSearch.toLowerCase());

    return typeMatch && searchMatch;
  });

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
            <div className="flex items-center justify-end gap-4">
              {/* Фильтры */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={assignmentFilter} onValueChange={(value: "all" | "homework" | "classwork") => setAssignmentFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все задания</SelectItem>
                      <SelectItem value="homework">Домашняя работа</SelectItem>
                      <SelectItem value="classwork">Классная работа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>

              {/* Здесь может быть кнопка если понадобится */}
              <div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAssignments.map((assignment) => {
                const submission = getSubmissionForAssignment(assignment.id);
                const hasAccess = hasAccessToAssignment(assignment);

                return (
                  <Card
                    key={assignment.id}
                    className={`hover:shadow-lg transition-shadow h-full flex flex-col ${
                      !hasAccess ? "opacity-60" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {assignment.title}
                          </CardTitle>
                          {!hasAccess && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              !hasAccess
                                ? "outline"
                                : submission?.status === "graded"
                                ? "default"
                                : submission?.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {!hasAccess
                              ? "Заблокировано"
                              : submission?.status === "graded"
                              ? "Проверено"
                              : submission?.status === "pending"
                              ? "На проверке"
                              : "Новое"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full">
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {assignment.description}
                        </p>

                        {assignment.image_urls &&
                          assignment.image_urls.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              {assignment.image_urls.map((url, index) => (
                                <ImageWithFallback
                                  key={index}
                                  src={url}
                                  alt={`Изображение ${index + 1}`}
                                  className="w-full h-32 sm:h-40 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm hover:shadow-md"
                                  onClick={() =>
                                    openImagePreview(
                                      assignment.image_urls,
                                      index,
                                      assignment.title
                                    )
                                  }
                                  onError={(e) => {
                                    console.error("Image loading error:", url);
                                  }}
                                />
                              ))}
                            </div>
                          )}

                        {submission?.status === "graded" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-green-800">
                                Оценка: {submission.score}/
                                {assignment.max_score}
                              </span>
                              <span className="text-sm text-green-600">
                                {Math.round(
                                  (submission.score! / assignment.max_score) *
                                    100
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
                      </div>

                      <div className="flex justify-between items-center mt-auto pt-4">
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
                                disabled={!hasAccess}
                                onClick={() =>
                                  hasAccess && setSelectedAssignment(assignment)
                                }
                                title={
                                  !hasAccess
                                    ? "Задание заблокировано"
                                    : "Отправить ответ"
                                }
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {hasAccess
                                  ? "Отправить ответ"
                                  : "Заблокировано"}
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                          {assignment.image_urls.map(
                                            (url, index) => (
                                              <ImageWithFallback
                                                key={index}
                                                src={url}
                                                alt={`Изображение ${index + 1}`}
                                                className="w-full h-32 sm:h-36 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm hover:shadow-md"
                                                onClick={() =>
                                                  openImagePreview(
                                                    assignment.image_urls,
                                                    index,
                                                    assignment.title
                                                  )
                                                }
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
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <p className="text-xs text-blue-700 mb-1">
                                        <strong>💡 Подсказка:</strong>
                                      </p>
                                      <p className="text-xs text-blue-600">
                                        Для выделения кода используйте формат:{" "}
                                        <code className="bg-blue-100 px-1 rounded">
                                          $(ваш код)
                                        </code>
                                      </p>
                                      <p className="text-xs text-blue-600 mt-1">
                                        Пример: Задание 1{" "}
                                        <code className="bg-blue-100 px-1 rounded">
                                          $(print("hello world"))
                                        </code>
                                      </p>
                                    </div>
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

            {/* Сообщение если нет заданий после фильтрации */}
            {filteredAssignments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {assignmentFilter === "all" && assignmentSearch === ""
                    ? "Заданий пока нет"
                    : "Задания не найдены. Попробуйте изменить фильтры."}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Теория */}
          <TabsContent value="theory" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Теоретические материалы
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {theoryBlocks.map((theory) => {
                const isExpanded = expandedTheoryBlocks.has(theory.id);
                const hasAccess = hasAccessToTheory(theory);
                return (
                  <Card
                    key={theory.id}
                    className={`overflow-hidden ${
                      !hasAccess ? "opacity-60" : ""
                    }`}
                  >
                    <CardHeader
                      className={`cursor-pointer hover:bg-gray-50 transition-colors duration-200 pb-3 ${
                        !hasAccess ? "cursor-not-allowed" : ""
                      }`}
                      onClick={() => hasAccess && toggleTheoryBlock(theory.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-medium text-gray-900">
                                {theory.title}
                              </CardTitle>
                              {!hasAccess && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {!hasAccess
                                ? "Заблокировано"
                                : `Добавлено: ${new Date(
                                    theory.created_at
                                  ).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {hasAccess && isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                          ) : hasAccess ? (
                            <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && hasAccess && (
                      <CardContent className="pt-0 pb-4">
                        <div className="border-t border-gray-100 pt-4">
                          <div className="prose prose-sm max-w-none">
                            <ContentFormatter
                              content={theory.content}
                              className="text-sm leading-relaxed text-gray-700"
                            />
                          </div>
                          {theory.image_urls.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                              {theory.image_urls.map((img, index) => (
                                <ImageWithFallback
                                  key={index}
                                  src={img}
                                  alt={`Изображение ${index + 1}`}
                                  className="w-full h-40 sm:h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm hover:shadow-md"
                                  onClick={() =>
                                    openImagePreview(
                                      theory.image_urls,
                                      index,
                                      theory.title
                                    )
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
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

        {/* Предпросмотр изображений */}
        <ImagePreview
          images={previewImages}
          initialIndex={previewIndex}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={previewTitle}
        />
      </main>
    </div>
  );
}
