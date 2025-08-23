import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, uploadFile, hashPassword } from "../../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { EditAssignmentModal } from "./EditAssignmentModal";
import { EditTheoryModal } from "./EditTheoryModal";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImagePreview } from "../ui/image-preview";
import { ContentFormatter } from "../ui/content-formatter";
import {
  Plus,
  BookOpen,
  Users,
  FileText,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Upload,
  Save,
  UserPlus,
  GraduationCap,
  X,
  Key,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  max_score: number;
  image_urls: string[];
  created_at: string;
  created_by: string;
}

interface TheoryBlock {
  id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  created_by: string;
}

interface Student {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  grade?: string;
  parent_phone?: string;
  email: string;
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

export function AdminDashboard() {
  const { logout, user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [theoryBlocks, setTheoryBlocks] = useState<TheoryBlock[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isCreateTheoryOpen, setIsCreateTheoryOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForPassword, setSelectedStudentForPassword] =
    useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "assignment" | "theory" | "student";
    id: string;
  } | null>(null);

  // Edit modal states
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] = useState(false);
  const [isEditTheoryOpen, setIsEditTheoryOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [editingTheory, setEditingTheory] = useState<TheoryBlock | null>(null);

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    maxScore: 100,
    images: [] as File[],
  });

  const [newTheory, setNewTheory] = useState({
    title: "",
    content: "",
    images: [] as File[],
  });

  const [newStudent, setNewStudent] = useState({
    lastName: "",
    firstName: "",
    grade: "",
    parentPhone: "",
    username: "",
    password: "",
    email: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      // Load students
      const { data: studentsData } = await supabase
        .from("users")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      // Load submissions
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      setAssignments(assignmentsData || []);
      setTheoryBlocks(theoryData || []);
      setStudents(studentsData || []);
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title.trim()) return;

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of newAssignment.images) {
        const url = await uploadFile(file);
        if (url) imageUrls.push(url);
      }

      const { error } = await supabase.from("assignments").insert({
        title: newAssignment.title,
        description: newAssignment.description,
        max_score: newAssignment.maxScore,
        image_urls: imageUrls,
        created_by: user?.id || "1",
      });

      if (error) throw error;

      toast.success("Задание создано успешно");
      setNewAssignment({
        title: "",
        description: "",
        maxScore: 100,
        images: [],
      });
      setIsCreateAssignmentOpen(false);
      loadData();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Ошибка создания задания");
    }
  };

  const handleCreateTheory = async () => {
    if (!newTheory.title.trim()) return;

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of newTheory.images) {
        const url = await uploadFile(file);
        if (url) imageUrls.push(url);
      }

      const { error } = await supabase.from("theory_blocks").insert({
        title: newTheory.title,
        content: newTheory.content,
        image_urls: imageUrls,
        created_by: user?.id || "1",
      });

      if (error) throw error;

      toast.success("Теория создана успешно");
      setNewTheory({ title: "", content: "", images: [] });
      setIsCreateTheoryOpen(false);
      loadData();
    } catch (error) {
      console.error("Error creating theory:", error);
      toast.error("Ошибка создания теории");
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.username.trim() || !newStudent.password.trim()) return;

    try {
      const passwordHash = await hashPassword(newStudent.password);

      const { error } = await supabase.from("users").insert({
        email: newStudent.email,
        username: newStudent.username,
        first_name: newStudent.firstName,
        last_name: newStudent.lastName,
        role: "student",
        grade: newStudent.grade,
        parent_phone: newStudent.parentPhone,
        password_hash: passwordHash,
      });

      if (error) throw error;

      toast.success("Ученик добавлен успешно");
      setNewStudent({
        lastName: "",
        firstName: "",
        grade: "",
        parentPhone: "",
        username: "",
        password: "",
        email: "",
      });
      setIsAddStudentOpen(false);
      loadData();
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Ошибка добавления ученика");
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          email: editingStudent.email,
          username: editingStudent.username,
          first_name: editingStudent.first_name,
          last_name: editingStudent.last_name,
          grade: editingStudent.grade,
          parent_phone: editingStudent.parent_phone,
        })
        .eq("id", editingStudent.id);

      if (error) throw error;

      toast.success("Данные ученика обновлены");
      setEditingStudent(null);
      setIsEditStudentOpen(false);
      loadData();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Ошибка обновления данных");
    }
  };

  const handleChangePassword = async () => {
    if (!selectedStudentForPassword || !newPassword.trim()) return;

    try {
      const passwordHash = await hashPassword(newPassword);

      const { error } = await supabase
        .from("users")
        .update({ password_hash: passwordHash })
        .eq("id", selectedStudentForPassword.id);

      if (error) throw error;

      toast.success("Пароль изменен успешно");
      setNewPassword("");
      setSelectedStudentForPassword(null);
      setIsChangePasswordOpen(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Ошибка изменения пароля");
    }
  };

  const handleGradeSubmission = async (
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          score,
          feedback,
          status: "graded",
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast.success("Оценка выставлена");
      loadData();
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Ошибка выставления оценки");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      let tableName = "";
      if (deleteConfirm.type === "assignment") {
        tableName = "assignments";
      } else if (deleteConfirm.type === "theory") {
        tableName = "theory_blocks";
      } else if (deleteConfirm.type === "student") {
        tableName = "users";
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", deleteConfirm.id);

      if (error) throw error;

      toast.success("Элемент удален");
      setDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Ошибка удаления");
    }
  };

  const openDeleteConfirm = (
    type: "assignment" | "theory" | "student",
    id: string
  ) => {
    setDeleteConfirm({ type, id });
  };

  const removeImage = (index: number, type: "assignment" | "theory") => {
    if (type === "assignment") {
      setNewAssignment({
        ...newAssignment,
        images: newAssignment.images.filter((_, i) => i !== index),
      });
    } else {
      setNewTheory({
        ...newTheory,
        images: newTheory.images.filter((_, i) => i !== index),
      });
    }
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

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  // Функции для редактирования
  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsEditAssignmentOpen(true);
  };

  const handleEditTheory = (theory: TheoryBlock) => {
    setEditingTheory(theory);
    setIsEditTheoryOpen(true);
  };

  const handleSaveAssignment = async (
    updatedAssignment: Assignment,
    newImages: File[]
  ) => {
    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of newImages) {
        const url = await uploadFile(file);
        if (url) newImageUrls.push(url);
      }

      // Combine existing and new image URLs
      const allImageUrls = [...updatedAssignment.image_urls, ...newImageUrls];

      const { error } = await supabase
        .from("assignments")
        .update({
          title: updatedAssignment.title,
          description: updatedAssignment.description,
          max_score: updatedAssignment.max_score,
          image_urls: allImageUrls,
        })
        .eq("id", updatedAssignment.id);

      if (error) throw error;

      toast.success("Задание обновлено успешно");
      setIsEditAssignmentOpen(false);
      setEditingAssignment(null);
      loadData();
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("Ошибка обновления задания");
    }
  };

  const handleSaveTheory = async (
    updatedTheory: TheoryBlock,
    newImages: File[]
  ) => {
    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of newImages) {
        const url = await uploadFile(file);
        if (url) newImageUrls.push(url);
      }

      // Combine existing and new image URLs
      const allImageUrls = [...updatedTheory.image_urls, ...newImageUrls];

      const { error } = await supabase
        .from("theory_blocks")
        .update({
          title: updatedTheory.title,
          content: updatedTheory.content,
          image_urls: allImageUrls,
        })
        .eq("id", updatedTheory.id);

      if (error) throw error;

      toast.success("Теория обновлена успешно");
      setIsEditTheoryOpen(false);
      setEditingTheory(null);
      loadData();
    } catch (error) {
      console.error("Error updating theory:", error);
      toast.error("Ошибка обновления теории");
    }
  };

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
                  Панель администратора
                </h1>
                <p className="text-sm text-gray-600">
                  Дмитрий Андреевич Тепляшин
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={logout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Всего учеников</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Активных заданий</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ожидают проверки</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingSubmissions.length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Теорий создано</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments">Задания</TabsTrigger>
            <TabsTrigger value="theory">Теория</TabsTrigger>
            <TabsTrigger value="students">Ученики</TabsTrigger>
            <TabsTrigger value="submissions">Проверка работ</TabsTrigger>
          </TabsList>

          {/* Задания */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Управление заданиями
              </h2>
              <Dialog
                open={isCreateAssignmentOpen}
                onOpenChange={setIsCreateAssignmentOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать задание
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Создать новое задание</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о задании для учеников
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Заголовок задания
                      </Label>
                      <Input
                        id="title"
                        value={newAssignment.title}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            title: e.target.value,
                          })
                        }
                        placeholder="Введите заголовок..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Описание задания
                      </Label>
                      <Textarea
                        id="description"
                        value={newAssignment.description}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            description: e.target.value,
                          })
                        }
                        placeholder="Подробное описание задания..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="maxScore" className="text-sm font-medium">
                        Максимальный балл
                      </Label>
                      <Input
                        id="maxScore"
                        type="number"
                        value={newAssignment.maxScore}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            maxScore: parseInt(e.target.value) || 100,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="images" className="text-sm font-medium">
                        Изображения (можно выбрать несколько)
                      </Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            images: Array.from(e.target.files || []),
                          })
                        }
                      />
                      {newAssignment.images.length > 0 && (
                        <div className="space-y-2">
                          {newAssignment.images.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm text-gray-600">
                                {file.name}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImage(index, "assignment")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateAssignmentOpen(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleCreateAssignment}
                        disabled={!newAssignment.title.trim()}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Создать
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {assignment.title}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openDeleteConfirm("assignment", assignment.id)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {assignment.description}
                    </p>
                    {assignment.image_urls &&
                      assignment.image_urls.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {assignment.image_urls
                            .slice(0, 2)
                            .map((url, index) => (
                              <ImageWithFallback
                                key={index}
                                src={url}
                                alt={`Изображение ${index + 1}`}
                                className="w-full h-24 sm:h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm hover:shadow-md"
                                onClick={() =>
                                  openImagePreview(
                                    assignment.image_urls,
                                    index,
                                    assignment.title
                                  )
                                }
                              />
                            ))}
                          {assignment.image_urls.length > 2 && (
                            <div className="bg-gray-100 rounded-lg flex items-center justify-center h-24 sm:h-28">
                              <span className="text-xs text-gray-500">
                                +{assignment.image_urls.length - 2}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        Создано:{" "}
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">
                        {assignment.max_score} баллов
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Теория */}
          <TabsContent value="theory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Теоретические материалы
              </h2>
              <Dialog
                open={isCreateTheoryOpen}
                onOpenChange={setIsCreateTheoryOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить теорию
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Создать теоретический блок</DialogTitle>
                    <DialogDescription>
                      Добавьте новый материал для изучения
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="theoryTitle"
                        className="text-sm font-medium"
                      >
                        Заголовок
                      </Label>
                      <Input
                        id="theoryTitle"
                        value={newTheory.title}
                        onChange={(e) =>
                          setNewTheory({ ...newTheory, title: e.target.value })
                        }
                        placeholder="Название темы..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="theoryContent"
                        className="text-sm font-medium"
                      >
                        Содержание
                      </Label>
                      <Textarea
                        id="theoryContent"
                        value={newTheory.content}
                        onChange={(e) =>
                          setNewTheory({
                            ...newTheory,
                            content: e.target.value,
                          })
                        }
                        placeholder="Теоретический материал..."
                        rows={6}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="theoryImages"
                        className="text-sm font-medium"
                      >
                        Изображения (можно выбрать несколько)
                      </Label>
                      <Input
                        id="theoryImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setNewTheory({
                            ...newTheory,
                            images: Array.from(e.target.files || []),
                          })
                        }
                      />
                      {newTheory.images.length > 0 && (
                        <div className="space-y-2">
                          {newTheory.images.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm text-gray-600">
                                {file.name}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImage(index, "theory")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateTheoryOpen(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleCreateTheory}
                        disabled={!newTheory.title.trim()}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Создать
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {theoryBlocks.map((theory) => (
                <Card key={theory.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{theory.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTheory(theory)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteConfirm("theory", theory.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-600 text-sm mb-3 line-clamp-3">
                      <ContentFormatter 
                        content={theory.content}
                        className="text-sm"
                      />
                    </div>
                    {theory.image_urls.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {theory.image_urls.slice(0, 2).map((img, index) => (
                          <ImageWithFallback
                            key={index}
                            src={img}
                            alt={`Изображение ${index + 1}`}
                            className="w-full h-24 sm:h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() =>
                              openImagePreview(
                                theory.image_urls,
                                index,
                                theory.title
                              )
                            }
                          />
                        ))}
                        {theory.image_urls.length > 2 && (
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-24 sm:h-28">
                            <span className="text-xs text-gray-500">
                              +{theory.image_urls.length - 2}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Создано:{" "}
                      {new Date(theory.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ученики */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Управление учениками
              </h2>
              <Dialog
                open={isAddStudentOpen}
                onOpenChange={setIsAddStudentOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Добавить ученика
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Добавить нового ученика</DialogTitle>
                    <DialogDescription>
                      Заполните данные для создания аккаунта ученика
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                          id="lastName"
                          value={newStudent.lastName}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              lastName: e.target.value,
                            })
                          }
                          placeholder="Иванов"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                          id="firstName"
                          value={newStudent.firstName}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              firstName: e.target.value,
                            })
                          }
                          placeholder="Александр"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            email: e.target.value,
                          })
                        }
                        placeholder="student@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="grade">Класс</Label>
                        <Select
                          value={newStudent.grade}
                          onValueChange={(value) =>
                            setNewStudent({ ...newStudent, grade: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите класс" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">9 класс</SelectItem>
                            <SelectItem value="10">10 класс</SelectItem>
                            <SelectItem value="11">11 класс</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="parentPhone">Телефон родителя</Label>
                        <Input
                          id="parentPhone"
                          value={newStudent.parentPhone}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              parentPhone: e.target.value,
                            })
                          }
                          placeholder="+7900123456"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="username">Логин</Label>
                        <Input
                          id="username"
                          value={newStudent.username}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              username: e.target.value,
                            })
                          }
                          placeholder="ivanov_alex"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newStudent.password}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              password: e.target.value,
                            })
                          }
                          placeholder="Пароль"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddStudentOpen(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleAddStudent}
                        disabled={
                          !newStudent.username.trim() ||
                          !newStudent.password.trim()
                        }
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Класс</TableHead>
                    <TableHead>Телефон родителя</TableHead>
                    <TableHead>Логин</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.last_name} {student.first_name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.parent_phone}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.username}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingStudent(student);
                              setIsEditStudentOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudentForPassword(student);
                              setIsChangePasswordOpen(true);
                            }}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openDeleteConfirm("student", student.id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Проверка работ */}
          <TabsContent value="submissions" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Проверка работ учеников
            </h2>

            <div className="space-y-4">
              {submissions.map((submission) => {
                const student = students.find(
                  (s) => s.id === submission.student_id
                );
                const assignment = assignments.find(
                  (a) => a.id === submission.assignment_id
                );

                return (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {assignment?.title} - {student?.last_name}{" "}
                            {student?.first_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Сдано:{" "}
                            {new Date(
                              submission.submitted_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            submission.status === "pending"
                              ? "outline"
                              : "default"
                          }
                        >
                          {submission.status === "pending"
                            ? "На проверке"
                            : "Проверено"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Ответ ученика:</Label>
                          <div className="bg-gray-50 rounded-lg p-4 mt-2">
                            <ContentFormatter 
                              content={submission.content}
                              className="text-sm font-mono"
                            />
                          </div>
                        </div>

                        {submission.status === "pending" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label htmlFor={`score-${submission.id}`}>
                                Оценка (из {assignment?.max_score})
                              </Label>
                              <Input
                                id={`score-${submission.id}`}
                                type="number"
                                max={assignment?.max_score}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor={`feedback-${submission.id}`}>
                                Комментарий
                              </Label>
                              <Textarea
                                id={`feedback-${submission.id}`}
                                placeholder="Комментарий к работе..."
                                rows={2}
                              />
                            </div>
                          </div>
                        )}

                        {submission.status === "graded" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p>
                              <strong>Оценка:</strong> {submission.score}/
                              {assignment?.max_score}
                            </p>
                            {submission.feedback && (
                              <p>
                                <strong>Комментарий:</strong>{" "}
                                {submission.feedback}
                              </p>
                            )}
                          </div>
                        )}

                        {submission.status === "pending" && (
                          <div className="flex justify-end">
                            <Button
                              onClick={() => {
                                const scoreInput = document.getElementById(
                                  `score-${submission.id}`
                                ) as HTMLInputElement;
                                const feedbackInput = document.getElementById(
                                  `feedback-${submission.id}`
                                ) as HTMLTextAreaElement;

                                const score = parseInt(scoreInput.value);
                                const feedback = feedbackInput.value;

                                if (!isNaN(score)) {
                                  handleGradeSubmission(
                                    submission.id,
                                    score,
                                    feedback
                                  );
                                }
                              }}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Сохранить оценку
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать ученика</DialogTitle>
            <DialogDescription>Измените данные ученика</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="editLastName">Фамилия</Label>
                  <Input
                    id="editLastName"
                    value={editingStudent.last_name}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="editFirstName">Имя</Label>
                  <Input
                    id="editFirstName"
                    value={editingStudent.first_name}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="editGrade">Класс</Label>
                  <Select
                    value={editingStudent.grade}
                    onValueChange={(value) =>
                      setEditingStudent({ ...editingStudent, grade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9 класс</SelectItem>
                      <SelectItem value="10">10 класс</SelectItem>
                      <SelectItem value="11">11 класс</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="editParentPhone">Телефон родителя</Label>
                  <Input
                    id="editParentPhone"
                    value={editingStudent.parent_phone}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        parent_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="editUsername">Логин</Label>
                <Input
                  id="editUsername"
                  value={editingStudent.username}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      username: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditStudentOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleEditStudent}>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
            <DialogDescription>
              Введите новый пароль для ученика{" "}
              {selectedStudentForPassword?.first_name}{" "}
              {selectedStudentForPassword?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={!newPassword.trim()}
              >
                <Key className="w-4 h-4 mr-2" />
                Изменить пароль
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Элемент будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Предпросмотр изображений */}
      <ImagePreview
        images={previewImages}
        initialIndex={previewIndex}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewTitle}
      />

      {/* Модальные окна редактирования */}
      <EditAssignmentModal
        assignment={editingAssignment}
        isOpen={isEditAssignmentOpen}
        onClose={() => {
          setIsEditAssignmentOpen(false);
          setEditingAssignment(null);
        }}
        onSave={handleSaveAssignment}
      />

      <EditTheoryModal
        theory={editingTheory}
        isOpen={isEditTheoryOpen}
        onClose={() => {
          setIsEditTheoryOpen(false);
          setEditingTheory(null);
        }}
        onSave={handleSaveTheory}
      />
    </div>
  );
}
