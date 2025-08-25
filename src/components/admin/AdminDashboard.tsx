import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, uploadFile, hashPassword } from "../../lib/supabase";
import { evaluateSubmissionWithAI, formatAIFeedback } from "../../lib/geminiAI";
import {
  cleanStudentCode,
  extractCodeFromSubmission,
} from "../../lib/codeUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useIsMobile } from "../ui/use-mobile";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  Archive,
  Filter,
  Search,
  TrendingUp,
  Sparkles,
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
  image_urls?: string[];
  submitted_at: string;
  score?: number;
  feedback?: string;
  status: "pending" | "graded";
}

export function AdminDashboard() {
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();

  // Custom hook for large screens (1300px+)
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsLargeScreen(width >= 1300);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  // Archive states
  const [showArchive, setShowArchive] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(
    null
  );
  const [isEditSubmissionOpen, setIsEditSubmissionOpen] = useState(false);

  // Access control states
  const [isAccessControlOpen, setIsAccessControlOpen] = useState(false);
  const [accessControlType, setAccessControlType] = useState<
    "assignment" | "theory"
  >("assignment");
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [assignmentAccess, setAssignmentAccess] = useState<
    Record<string, string[]>
  >({});
  const [theoryAccess, setTheoryAccess] = useState<Record<string, string[]>>(
    {}
  );

  // Student analytics states
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] =
    useState<string>("");
  const [studentGradeData, setStudentGradeData] = useState<any[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<"day" | "month">(
    "month"
  );
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);

  // AI evaluation states
  const [aiEvaluationLoading, setAiEvaluationLoading] = useState<
    Record<string, boolean>
  >({});
  const [aiEvaluationResults, setAiEvaluationResults] = useState<
    Record<string, any>
  >({});

  // Temporary score states for grading
  const [tempScores, setTempScores] = useState<Record<string, string>>({});
  const [tempFeedbacks, setTempFeedbacks] = useState<Record<string, string>>(
    {}
  );

  // Grading states to prevent multiple submissions
  const [gradingInProgress, setGradingInProgress] = useState<
    Record<string, boolean>
  >({});

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    // store as string for controlled input behavior
    maxScore: 100 as any,
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

  // Filter states
  const [assignmentFilter, setAssignmentFilter] = useState<
    "all" | "homework" | "classwork"
  >("all");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [submissionSort, setSubmissionSort] = useState<"newest" | "oldest">(
    "newest"
  );
  const [submissionStudentFilter, setSubmissionStudentFilter] = useState("");
  const [submissionAssignmentFilter, setSubmissionAssignmentFilter] =
    useState("");

  // Mobile filter modal states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentFilterTab, setCurrentFilterTab] = useState<
    "assignments" | "submissions"
  >("assignments");
  const [tempAssignmentFilter, setTempAssignmentFilter] = useState<
    "all" | "homework" | "classwork"
  >("all");
  const [tempAssignmentSearch, setTempAssignmentSearch] = useState("");
  const [tempSubmissionSort, setTempSubmissionSort] = useState<
    "newest" | "oldest"
  >("newest");
  const [tempSubmissionStudentFilter, setTempSubmissionStudentFilter] =
    useState("");
  const [tempSubmissionAssignmentFilter, setTempSubmissionAssignmentFilter] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentForAnalytics) {
      loadStudentAnalytics(selectedStudentForAnalytics);
    }
  }, [selectedStudentForAnalytics, analyticsGroupBy]);

  // Auto-select first student when opening Analytics dialog (helps ensure chart loads)
  useEffect(() => {
    if (
      isAnalyticsDialogOpen &&
      students.length > 0 &&
      !selectedStudentForAnalytics
    ) {
      setSelectedStudentForAnalytics(students[0].id);
    }
  }, [isAnalyticsDialogOpen, students, selectedStudentForAnalytics]);

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

      // Load assignment access
      const { data: assignmentAccessData } = await supabase
        .from("assignment_access")
        .select("assignment_id, student_id");

      // Load theory access
      const { data: theoryAccessData } = await supabase
        .from("theory_access")
        .select("theory_block_id, student_id");

      setAssignments(assignmentsData || []);
      setTheoryBlocks(theoryData || []);
      setStudents(studentsData || []);
      setSubmissions(submissionsData || []);

      // Process access data
      const assignmentAccessMap: Record<string, string[]> = {};
      (assignmentAccessData || []).forEach((access) => {
        if (!assignmentAccessMap[access.assignment_id]) {
          assignmentAccessMap[access.assignment_id] = [];
        }
        assignmentAccessMap[access.assignment_id].push(access.student_id);
      });

      const theoryAccessMap: Record<string, string[]> = {};
      (theoryAccessData || []).forEach((access) => {
        if (!theoryAccessMap[access.theory_block_id]) {
          theoryAccessMap[access.theory_block_id] = [];
        }
        theoryAccessMap[access.theory_block_id].push(access.student_id);
      });

      setAssignmentAccess(assignmentAccessMap);
      setTheoryAccess(theoryAccessMap);

      // Check for stuck submissions and notify user
      if (submissionsData && submissionsData.length > 0) {
        const pendingSubmissions = submissionsData.filter(
          (s) => s.status === "pending"
        );

        if (pendingSubmissions.length > 0) {
          const oneHourAgo = new Date();
          oneHourAgo.setHours(oneHourAgo.getHours() - 1);

          const stuckSubmissions = pendingSubmissions.filter(
            (submission) => new Date(submission.submitted_at) < oneHourAgo
          );

          if (stuckSubmissions.length > 0) {
            toast.warning(
              `Обнаружено ${stuckSubmissions.length} работ в статусе "На проверке" более 1 часа. Используйте кнопку "Очистка" для решения проблемы.`,
              { duration: 10000 }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAnalytics = async (studentId: string) => {
    if (!studentId) {
      setStudentGradeData([]);
      return;
    }

    setIsAnalyticsLoading(true);
    try {
      // Get all graded submissions for the student
      const { data: submissionsData, error } = await supabase
        .from("submissions")
        .select(
          `
          id,
          score,
          submitted_at,
          assignment_id,
          assignments!inner (
            title,
            max_score
          )
        `
        )
        .eq("student_id", studentId)
        .eq("status", "graded")
        .order("submitted_at", { ascending: true });

      if (submissionsData && submissionsData.length > 0) {
        // If the join didn't work, get assignments separately
        if (!submissionsData[0].assignments) {
          const assignmentIds = [
            ...new Set(submissionsData.map((s) => s.assignment_id)),
          ];
          const { data: assignmentsData } = await supabase
            .from("assignments")
            .select("id, title, max_score")
            .in("id", assignmentIds);

          // Add assignment data to submissions
          submissionsData.forEach((submission: any) => {
            submission.assignments = assignmentsData?.find(
              (a) => a.id === submission.assignment_id
            ) || { max_score: 100 };
          });
        }

        // Group submissions by selected period and calculate averages
        const groupedData: Record<
          string,
          { totalScore: number; count: number; submissions: any[] }
        > = {};

        submissionsData.forEach((submission: any) => {
          const date = new Date(submission.submitted_at);
          let groupKey = "";

          if (analyticsGroupBy === "month") {
            groupKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
          } else {
            groupKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          }

          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              totalScore: 0,
              count: 0,
              submissions: [],
            };
          }

          // Calculate percentage score
          const percentage =
            (submission.score / submission.assignments.max_score) * 100;
          groupedData[groupKey].totalScore += percentage;
          groupedData[groupKey].count += 1;
          groupedData[groupKey].submissions.push(submission);
        });

        // Convert to chart data
        const chartData = Object.entries(groupedData)
          .map(([period, data]) => {
            // ensure numeric value for Recharts
            const averageScore = Number(
              Math.round(data.totalScore / data.count)
            );
            return {
              period:
                analyticsGroupBy === "month"
                  ? new Date(period + "-01").toLocaleDateString("ru-RU", {
                      month: "short",
                      year: "2-digit",
                    })
                  : new Date(period).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                    }),
              fullPeriod:
                analyticsGroupBy === "month"
                  ? new Date(period + "-01").toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                    })
                  : new Date(period).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }),
              averageScore,
              submissionsCount: data.count,
              sortKey: period,
            };
          })
          .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        setStudentGradeData(chartData);
      } else {
        // Нет реальных данных — очищаем набор точек и показываем сообщение в UI
        setStudentGradeData([]);
      }
    } catch (error) {
      console.error("Error loading student analytics:", error);
      toast.error("Ошибка загрузки аналитики");
      setStudentGradeData([]);
    } finally {
      setIsAnalyticsLoading(false);
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

      // Safely parse maxScore from possibly string state
      const parsedMaxScore =
        typeof newAssignment.maxScore === "string"
          ? newAssignment.maxScore.trim() === ""
            ? 0
            : parseInt(newAssignment.maxScore, 10) || 0
          : newAssignment.maxScore || 0;

      const { error } = await supabase.from("assignments").insert({
        title: newAssignment.title,
        description: newAssignment.description,
        max_score: parsedMaxScore,
        image_urls: imageUrls,
        created_by: user?.id || "1",
      });

      if (error) throw error;

      toast.success("Задание создано успешно");
      setNewAssignment({
        title: "",
        description: "",
        maxScore: 100 as any,
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
    // Prevent multiple submissions
    if (gradingInProgress[submissionId]) {
      toast.warning("Оценка уже выставляется...");
      return;
    }

    try {
      setGradingInProgress((prev) => ({ ...prev, [submissionId]: true }));

      // Validate score
      const submission = submissions.find((s) => s.id === submissionId);
      const assignment = assignments.find(
        (a) => a.id === submission?.assignment_id
      );

      if (!submission) {
        throw new Error("Работа не найдена");
      }

      if (!assignment) {
        throw new Error("Задание не найдено");
      }

      if (score < 0 || score > assignment.max_score) {
        throw new Error(`Оценка должна быть от 0 до ${assignment.max_score}`);
      }

      // Check if submission is already graded to prevent race conditions
      const { data: currentSubmission, error: fetchError } = await supabase
        .from("submissions")
        .select("status")
        .eq("id", submissionId)
        .single();

      if (fetchError) throw fetchError;

      if (currentSubmission.status === "graded") {
        toast.warning("Работа уже проверена");
        return;
      }

      const { error } = await supabase
        .from("submissions")
        .update({
          score,
          feedback,
          status: "graded",
        })
        .eq("id", submissionId)
        .eq("status", "pending"); // Additional safety check

      if (error) throw error;

      toast.success("Оценка выставлена");

      // Optimistic update
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, score, feedback, status: "graded" as const }
            : s
        )
      );

      // Clear temp values
      setTempScores((prev) => {
        const newScores = { ...prev };
        delete newScores[submissionId];
        return newScores;
      });
      setTempFeedbacks((prev) => {
        const newFeedbacks = { ...prev };
        delete newFeedbacks[submissionId];
        return newFeedbacks;
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка выставления оценки";
      toast.error(errorMessage);

      // Reload data on error to ensure consistency
      loadData();
    } finally {
      setGradingInProgress((prev) => {
        const newState = { ...prev };
        delete newState[submissionId];
        return newState;
      });
    }
  };

  const handleEditSubmissionGrade = async () => {
    if (!editingSubmission) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          score: editingSubmission.score,
          feedback: editingSubmission.feedback,
        })
        .eq("id", editingSubmission.id);

      if (error) throw error;

      toast.success("Оценка обновлена");
      setIsEditSubmissionOpen(false);
      setEditingSubmission(null);
      loadData();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Ошибка обновления оценки");
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

  // Filter assignments based on type and search
  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by type (homework/classwork)
    const typeMatch = (() => {
      if (assignmentFilter === "all") return true;

      const title = assignment.title.toLowerCase();
      if (assignmentFilter === "homework") {
        return (
          title.includes("домашняя работа") ||
          title.includes("домашнее задание")
        );
      }
      if (assignmentFilter === "classwork") {
        return (
          title.includes("классная работа") ||
          title.includes("классное задание")
        );
      }
      return true;
    })();

    // Filter by search text
    const searchMatch =
      assignmentSearch.trim() === "" ||
      assignment.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      assignment.description
        .toLowerCase()
        .includes(assignmentSearch.toLowerCase());

    return typeMatch && searchMatch;
  });

  // Filter submissions for grading section
  const filteredSubmissions = submissions
    .filter((submission) => {
      const targetStatus = showArchive ? "graded" : "pending";
      if (submission.status !== targetStatus) return false;

      // Student filter
      const student = students.find((s) => s.id === submission.student_id);
      const studentMatch =
        submissionStudentFilter === "" ||
        (student &&
          `${student.first_name} ${student.last_name}`
            .toLowerCase()
            .includes(submissionStudentFilter.toLowerCase()));

      // Assignment filter
      const assignment = assignments.find(
        (a) => a.id === submission.assignment_id
      );
      const assignmentMatch =
        submissionAssignmentFilter === "" ||
        (assignment &&
          assignment.title
            .toLowerCase()
            .includes(submissionAssignmentFilter.toLowerCase()));

      return studentMatch && assignmentMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.submitted_at).getTime();
      const dateB = new Date(b.submitted_at).getTime();
      return submissionSort === "newest" ? dateB - dateA : dateA - dateB;
    });

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

  const handleToggleAccess = async (
    contentId: string,
    studentId: string,
    type: "assignment" | "theory"
  ) => {
    if (!user) return;

    try {
      const tableName =
        type === "assignment" ? "assignment_access" : "theory_access";
      const columnName =
        type === "assignment" ? "assignment_id" : "theory_block_id";

      const accessMap = type === "assignment" ? assignmentAccess : theoryAccess;
      const currentAccess = accessMap[contentId] || [];
      const hasAccess = currentAccess.includes(studentId);

      if (hasAccess) {
        // Remove access
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(columnName, contentId)
          .eq("student_id", studentId);

        if (error) throw error;

        // Update local state immediately
        if (type === "assignment") {
          setAssignmentAccess((prev) => ({
            ...prev,
            [contentId]: currentAccess.filter((id) => id !== studentId),
          }));
        } else {
          setTheoryAccess((prev) => ({
            ...prev,
            [contentId]: currentAccess.filter((id) => id !== studentId),
          }));
        }

        toast.success("Доступ отозван");
      } else {
        // Grant access
        const { error } = await supabase.from(tableName).insert({
          [columnName]: contentId,
          student_id: studentId,
          granted_by: user.id,
        });

        if (error) throw error;

        // Update local state immediately
        if (type === "assignment") {
          setAssignmentAccess((prev) => ({
            ...prev,
            [contentId]: [...currentAccess, studentId],
          }));
        } else {
          setTheoryAccess((prev) => ({
            ...prev,
            [contentId]: [...currentAccess, studentId],
          }));
        }

        toast.success("Доступ предоставлен");
      }
    } catch (error) {
      console.error("Error toggling access:", error);
      toast.error("Ошибка изменения доступа");
    }
  };

  const handleBulkToggleAccess = async (
    contentId: string,
    studentIds: string[],
    grant: boolean,
    type: "assignment" | "theory"
  ) => {
    if (!user) return;

    try {
      const tableName =
        type === "assignment" ? "assignment_access" : "theory_access";
      const columnName =
        type === "assignment" ? "assignment_id" : "theory_block_id";

      if (grant) {
        // Grant access to multiple students
        const accessRecords = studentIds.map((studentId) => ({
          [columnName]: contentId,
          student_id: studentId,
          granted_by: user.id,
        }));

        const { error } = await supabase.from(tableName).insert(accessRecords);

        if (error) throw error;

        // Update local state immediately
        const currentAccess =
          type === "assignment"
            ? assignmentAccess[contentId] || []
            : theoryAccess[contentId] || [];
        const newAccess = [...new Set([...currentAccess, ...studentIds])];

        if (type === "assignment") {
          setAssignmentAccess((prev) => ({
            ...prev,
            [contentId]: newAccess,
          }));
        } else {
          setTheoryAccess((prev) => ({
            ...prev,
            [contentId]: newAccess,
          }));
        }

        toast.success(`Доступ предоставлен ${studentIds.length} ученикам`);
      } else {
        // Remove access from multiple students
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(columnName, contentId)
          .in("student_id", studentIds);

        if (error) throw error;

        // Update local state immediately
        const currentAccess =
          type === "assignment"
            ? assignmentAccess[contentId] || []
            : theoryAccess[contentId] || [];
        const newAccess = currentAccess.filter(
          (id) => !studentIds.includes(id)
        );

        if (type === "assignment") {
          setAssignmentAccess((prev) => ({
            ...prev,
            [contentId]: newAccess,
          }));
        } else {
          setTheoryAccess((prev) => ({
            ...prev,
            [contentId]: newAccess,
          }));
        }

        toast.success(`Доступ отозван у ${studentIds.length} учеников`);
      }
    } catch (error) {
      console.error("Error bulk toggling access:", error);
      toast.error("Ошибка массового изменения доступа");
    }
  };

  const openAccessControl = (
    contentId: string,
    type: "assignment" | "theory"
  ) => {
    setSelectedContentId(contentId);
    setAccessControlType(type);
    setIsAccessControlOpen(true);
  };

  // Mobile filter functions
  const openMobileFilters = (tabType: "assignments" | "submissions") => {
    setCurrentFilterTab(tabType);
    if (tabType === "assignments") {
      setTempAssignmentFilter(assignmentFilter);
      setTempAssignmentSearch(assignmentSearch);
    } else {
      setTempSubmissionSort(submissionSort);
      setTempSubmissionStudentFilter(submissionStudentFilter);
      setTempSubmissionAssignmentFilter(submissionAssignmentFilter);
    }
    setIsMobileFilterOpen(true);
  };

  const applyMobileFilters = (tabType: "assignments" | "submissions") => {
    if (tabType === "assignments") {
      setAssignmentFilter(tempAssignmentFilter);
      setAssignmentSearch(tempAssignmentSearch);
    } else {
      setSubmissionSort(tempSubmissionSort);
      setSubmissionStudentFilter(tempSubmissionStudentFilter);
      setSubmissionAssignmentFilter(tempSubmissionAssignmentFilter);
    }
    setIsMobileFilterOpen(false);
  };

  const resetMobileFilters = (tabType: "assignments" | "submissions") => {
    if (tabType === "assignments") {
      setTempAssignmentFilter("all");
      setTempAssignmentSearch("");
    } else {
      setTempSubmissionSort("newest");
      setTempSubmissionStudentFilter("");
      setTempSubmissionAssignmentFilter("");
    }
  };

  const handleAIEvaluation = async (submissionId: string) => {
    try {
      setAiEvaluationLoading((prev) => ({ ...prev, [submissionId]: true }));

      // Find submission and assignment data
      const submission = submissions.find((s) => s.id === submissionId);
      const assignment = assignments.find(
        (a) => a.id === submission?.assignment_id
      );

      if (!submission || !assignment) {
        toast.error("Не удалось найти данные задания или работы");
        return;
      }

      // Prepare data for AI evaluation
      const assignmentData = {
        title: assignment.title,
        description: assignment.description,
        maxScore: assignment.max_score,
        imageUrls: assignment.image_urls,
      };

      const submissionData = {
        textContent: submission.content,
        imageUrls: submission.image_urls || [],
      };

      // Call AI evaluation
      const aiResult = await evaluateSubmissionWithAI(
        assignmentData,
        submissionData
      );

      // Store AI result
      setAiEvaluationResults((prev) => ({ ...prev, [submissionId]: aiResult }));

      // Format feedback and update state
      const formattedFeedback = formatAIFeedback(aiResult);

      setTempFeedbacks((prev) => ({
        ...prev,
        [submissionId]: formattedFeedback,
      }));

      setTempScores((prev) => ({
        ...prev,
        [submissionId]: aiResult.suggestedScore.toString(),
      }));

      toast.success("ИИ-анализ завершен!");
    } catch (error) {
      console.error("AI evaluation error:", error);
      toast.error(error instanceof Error ? error.message : "Ошибка ИИ-анализа");
    } finally {
      setAiEvaluationLoading((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleAIEvaluationForEdit = async (submissionId: string) => {
    try {
      setAiEvaluationLoading((prev) => ({ ...prev, [submissionId]: true }));

      // Find submission and assignment data
      const submission = submissions.find((s) => s.id === submissionId);
      const assignment = assignments.find(
        (a) => a.id === submission?.assignment_id
      );

      if (!submission || !assignment) {
        toast.error("Не удалось найти данные задания или работы");
        return;
      }

      // Prepare data for AI evaluation
      const assignmentData = {
        title: assignment.title,
        description: assignment.description,
        maxScore: assignment.max_score,
        imageUrls: assignment.image_urls,
      };

      const submissionData = {
        textContent: submission.content,
        imageUrls: submission.image_urls || [],
      };

      // Call AI evaluation
      const aiResult = await evaluateSubmissionWithAI(
        assignmentData,
        submissionData
      );

      // Store AI result
      setAiEvaluationResults((prev) => ({ ...prev, [submissionId]: aiResult }));

      // Format feedback for editing submission
      const formattedFeedback = formatAIFeedback(aiResult);

      // Update the editing submission state
      if (editingSubmission && editingSubmission.id === submissionId) {
        setEditingSubmission({
          ...editingSubmission,
          feedback: formattedFeedback,
          score: aiResult.suggestedScore,
        });
      }

      toast.success("ИИ-анализ завершен!");
    } catch (error) {
      console.error("AI evaluation error:", error);
      toast.error(error instanceof Error ? error.message : "Ошибка ИИ-анализа");
    } finally {
      setAiEvaluationLoading((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  // Function to detect and fix stuck submissions
  const detectStuckSubmissions = async () => {
    try {
      const { data: allSubmissions, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", "pending");

      if (error) throw error;

      if (!allSubmissions || allSubmissions.length === 0) {
        return { duplicates: [], oldSubmissions: [] };
      }

      // Group by student_id and assignment_id to find duplicates
      const submissionGroups = allSubmissions.reduce((acc, submission) => {
        const key = `${submission.student_id}-${submission.assignment_id}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(submission);
        return acc;
      }, {} as Record<string, Submission[]>);

      // Find duplicates (more than one pending submission per student-assignment pair)
      const duplicates = Object.values(submissionGroups)
        .filter((group) => group.length > 1)
        .flat();

      // Find old submissions (older than 30 days and still pending)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldSubmissions = allSubmissions.filter(
        (submission) => new Date(submission.submitted_at) < thirtyDaysAgo
      );

      return { duplicates, oldSubmissions };
    } catch (error) {
      console.error("Error detecting stuck submissions:", error);
      return { duplicates: [], oldSubmissions: [] };
    }
  };

  const cleanupStuckSubmissions = async () => {
    try {
      const { duplicates, oldSubmissions } = await detectStuckSubmissions();

      // Also check for potentially stuck submissions (more than 1 hour old and still pending)
      const { data: allPendingSubmissions, error: pendingError } =
        await supabase.from("submissions").select("*").eq("status", "pending");

      if (pendingError) throw pendingError;

      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const potentiallyStuck = (allPendingSubmissions || []).filter(
        (submission) => new Date(submission.submitted_at) < oneHourAgo
      );

      let cleanedCount = 0;
      let actionsTaken = [];

      // Handle duplicates - keep the latest one, remove others
      if (duplicates.length > 0) {
        const shouldCleanDuplicates = confirm(
          `Найдено ${duplicates.length} дублированных работ. Удалить дубликаты (оставить только последние)?`
        );

        if (shouldCleanDuplicates) {
          const submissionGroups = duplicates.reduce((acc, submission) => {
            const key = `${submission.student_id}-${submission.assignment_id}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(submission);
            return acc;
          }, {} as Record<string, Submission[]>);

          for (const group of Object.values(submissionGroups)) {
            if (group.length > 1) {
              // Sort by submission time, keep the latest
              group.sort(
                (a, b) =>
                  new Date(b.submitted_at).getTime() -
                  new Date(a.submitted_at).getTime()
              );
              const toDelete = group.slice(1); // Remove all but the latest

              for (const submission of toDelete) {
                const { error } = await supabase
                  .from("submissions")
                  .delete()
                  .eq("id", submission.id);

                if (!error) {
                  cleanedCount++;
                }
              }
            }
          }
          actionsTaken.push(`Удалено ${cleanedCount} дубликатов`);
        }
      }

      // Handle old submissions (older than 30 days and still pending)
      if (oldSubmissions.length > 0) {
        const shouldCleanOld = confirm(
          `Найдено ${oldSubmissions.length} очень старых работ (более 30 дней). Удалить их?`
        );

        if (shouldCleanOld) {
          for (const submission of oldSubmissions) {
            const { error } = await supabase
              .from("submissions")
              .delete()
              .eq("id", submission.id);

            if (!error) {
              cleanedCount++;
            }
          }
          actionsTaken.push(`Удалено ${oldSubmissions.length} старых работ`);
        }
      }

      // Show info about potentially stuck submissions
      if (potentiallyStuck.length > 0) {
        const studentNames = await Promise.all(
          potentiallyStuck.slice(0, 5).map(async (submission) => {
            const student = students.find(
              (s) => s.id === submission.student_id
            );
            const assignment = assignments.find(
              (a) => a.id === submission.assignment_id
            );
            return `${student?.last_name} ${student?.first_name} - "${assignment?.title}"`;
          })
        );

        const shouldShowMore =
          potentiallyStuck.length > 5
            ? `\n...и ещё ${potentiallyStuck.length - 5} работ`
            : "";

        const shouldForceGrade = confirm(
          `Найдено ${
            potentiallyStuck.length
          } работ, которые висят в статусе "На проверке" более 1 часа:\n\n${studentNames.join(
            "\n"
          )}${shouldShowMore}\n\nПеренести все эти работы в архив проверенных с оценкой 0?`
        );

        if (shouldForceGrade) {
          for (const submission of potentiallyStuck) {
            const { error } = await supabase
              .from("submissions")
              .update({
                score: 0,
                feedback: "Автоматически проверено (работа зависла в системе)",
                status: "graded",
              })
              .eq("id", submission.id);

            if (!error) {
              cleanedCount++;
            }
          }
          actionsTaken.push(
            `Обработано ${potentiallyStuck.length} зависших работ`
          );
        }
      }

      if (actionsTaken.length > 0) {
        toast.success(`Очистка завершена: ${actionsTaken.join(", ")}`);
        loadData(); // Reload data after cleanup
      } else {
        toast.info("Никаких действий не было выполнено");
      }

      return cleanedCount;
    } catch (error) {
      console.error("Error cleaning stuck submissions:", error);
      toast.error("Ошибка очистки зависших работ");
      return 0;
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
            <TabsTrigger value="submissions">Проверка</TabsTrigger>
          </TabsList>

          {/* Задания */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              {/* Фильтры для десктопа */}
              {!isMobile && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Select
                      value={assignmentFilter}
                      onValueChange={(
                        value: "all" | "homework" | "classwork"
                      ) => setAssignmentFilter(value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все задания</SelectItem>
                        <SelectItem value="homework">
                          Домашняя работа
                        </SelectItem>
                        <SelectItem value="classwork">
                          Классная работа
                        </SelectItem>
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
              )}

              {/* Кнопка фильтров для мобилки */}
              {isMobile && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMobileFilters("assignments")}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Кнопка создания */}
              <Dialog
                open={isCreateAssignmentOpen}
                onOpenChange={setIsCreateAssignmentOpen}
              >
                <DialogTrigger asChild>
                  <Button className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    {isMobile ? "Создать" : "Создать задание"}
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
                        type="text"
                        value={String(newAssignment.maxScore ?? "")}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          const normalized = digitsOnly.replace(
                            /^0+(?=\d)/,
                            ""
                          );
                          setNewAssignment({
                            ...newAssignment,
                            maxScore: normalized,
                          });
                        }}
                        placeholder="Напр. 100"
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
              {filteredAssignments.map((assignment) => (
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
                          onClick={() =>
                            openAccessControl(assignment.id, "assignment")
                          }
                          title="Управление доступом"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
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
            <div className="flex justify-end">
              <Dialog
                open={isCreateTheoryOpen}
                onOpenChange={setIsCreateTheoryOpen}
              >
                <DialogTrigger asChild>
                  <Button className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    {isMobile ? "Добавить" : "Добавить теорию"}
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
                          onClick={() => openAccessControl(theory.id, "theory")}
                          title="Управление доступом"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
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
                    <p className="text-gray-600 text-sm mb-3">
                      {theory.content.length > 50
                        ? theory.content.substring(0, 50) + "..."
                        : theory.content}
                    </p>
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
            <div className="flex justify-end">
              <Dialog
                open={isAddStudentOpen}
                onOpenChange={setIsAddStudentOpen}
              >
                <DialogTrigger asChild>
                  <Button className="shrink-0">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isMobile ? "Добавить" : "Добавить ученика"}
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
            <div className="flex items-center justify-between gap-4">
              {/* Фильтры для десктопа */}
              {isLargeScreen && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Поиск по ученику..."
                      value={submissionStudentFilter}
                      onChange={(e) =>
                        setSubmissionStudentFilter(e.target.value)
                      }
                      className="w-48"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Поиск по заданию..."
                      value={submissionAssignmentFilter}
                      onChange={(e) =>
                        setSubmissionAssignmentFilter(e.target.value)
                      }
                      className="w-48"
                    />
                  </div>

                  <Select
                    value={submissionSort}
                    onValueChange={(value: "newest" | "oldest") =>
                      setSubmissionSort(value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">От новых к старым</SelectItem>
                      <SelectItem value="oldest">От старых к новым</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Кнопка фильтров для мобилки */}
              {!isLargeScreen && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMobileFilters("submissions")}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Кнопки управления */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAnalyticsDialogOpen(true)}
                  className="shrink-0"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isLargeScreen ? "Аналитика" : ""}
                </Button>

                <Button
                  variant="outline"
                  onClick={cleanupStuckSubmissions}
                  className="shrink-0"
                  title="Очистить зависшие и дублированные работы"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isLargeScreen ? "Очистка" : ""}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowArchive(!showArchive)}
                  className="shrink-0"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {isLargeScreen
                    ? showArchive
                      ? "К проверке"
                      : "Архив"
                    : showArchive
                    ? "Проверка"
                    : "Архив"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredSubmissions.map((submission) => {
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
                        <div className="flex items-center space-x-2">
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
                          {showArchive && submission.status === "graded" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSubmission(submission);
                                setIsEditSubmissionOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Текст задания:</Label>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                            <ContentFormatter
                              content={assignment?.description || ""}
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Ответ ученика:</Label>
                          <div className="bg-gray-50 rounded-lg p-4 mt-2">
                            <ContentFormatter
                              content={submission.content}
                              className="text-sm font-mono"
                            />
                          </div>
                        </div>

                        {submission.status === "pending" && !showArchive && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label htmlFor={`score-${submission.id}`}>
                                Оценка (из {assignment?.max_score})
                              </Label>
                              <Input
                                id={`score-${submission.id}`}
                                type="number"
                                value={tempScores[submission.id] ?? ""}
                                onChange={(e) =>
                                  setTempScores((prev) => ({
                                    ...prev,
                                    [submission.id]: e.target.value,
                                  }))
                                }
                                max={assignment?.max_score}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`feedback-${submission.id}`}>
                                  Комментарий
                                </Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAIEvaluation(submission.id)
                                  }
                                  disabled={aiEvaluationLoading[submission.id]}
                                  className="h-8 px-2"
                                >
                                  {aiEvaluationLoading[submission.id] ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                  )}
                                  <span className="ml-1 text-xs">ИИ</span>
                                </Button>
                              </div>
                              <Textarea
                                id={`feedback-${submission.id}`}
                                value={tempFeedbacks[submission.id] ?? ""}
                                onChange={(e) =>
                                  setTempFeedbacks((prev) => ({
                                    ...prev,
                                    [submission.id]: e.target.value,
                                  }))
                                }
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

                        {submission.status === "pending" && !showArchive && (
                          <div className="flex justify-end">
                            <Button
                              onClick={() => {
                                const score = parseInt(
                                  tempScores[submission.id] || "0"
                                );
                                const feedback =
                                  tempFeedbacks[submission.id] || "";

                                if (!isNaN(score)) {
                                  handleGradeSubmission(
                                    submission.id,
                                    score,
                                    feedback
                                  );
                                }
                              }}
                              disabled={
                                gradingInProgress[submission.id] || false
                              }
                            >
                              {gradingInProgress[submission.id] ? (
                                <>
                                  <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                                  Сохранение...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Сохранить оценку
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Показать сообщение если нет работ */}
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {submissionStudentFilter === "" &&
                  submissionAssignmentFilter === ""
                    ? showArchive
                      ? "Нет проверенных работ"
                      : "Нет работ на проверке"
                    : "Работы не найдены. Попробуйте изменить фильтры."}
                </p>
              </div>
            )}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="editEmail">E-mail</Label>
                  <Input
                    id="editEmail"
                    value={editingStudent.email}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
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

      {/* Edit Submission Dialog */}
      <Dialog
        open={isEditSubmissionOpen}
        onOpenChange={setIsEditSubmissionOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать оценку</DialogTitle>
            <DialogDescription>
              Измените оценку и комментарий для работы
            </DialogDescription>
          </DialogHeader>
          {editingSubmission && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Ученик:</Label>
                <p className="text-sm text-gray-600">
                  {
                    students.find((s) => s.id === editingSubmission.student_id)
                      ?.last_name
                  }{" "}
                  {
                    students.find((s) => s.id === editingSubmission.student_id)
                      ?.first_name
                  }
                </p>
              </div>
              <div className="space-y-3">
                <Label>Задание:</Label>
                <p className="text-sm text-gray-600">
                  {
                    assignments.find(
                      (a) => a.id === editingSubmission.assignment_id
                    )?.title
                  }
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="editScore">
                  Оценка (из{" "}
                  {
                    assignments.find(
                      (a) => a.id === editingSubmission.assignment_id
                    )?.max_score
                  }
                  )
                </Label>
                <Input
                  id="editScore"
                  type="number"
                  value={editingSubmission.score?.toString() ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingSubmission({
                      ...editingSubmission,
                      score: value === "" ? undefined : parseInt(value),
                    });
                  }}
                  max={
                    assignments.find(
                      (a) => a.id === editingSubmission.assignment_id
                    )?.max_score
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="editFeedback">Комментарий</Label>
                  {editingSubmission && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAIEvaluationForEdit(editingSubmission.id)
                      }
                      disabled={aiEvaluationLoading[editingSubmission.id]}
                      className="h-8 px-2"
                    >
                      {aiEvaluationLoading[editingSubmission.id] ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="ml-1 text-xs">ИИ</span>
                    </Button>
                  )}
                </div>
                <Textarea
                  id="editFeedback"
                  value={editingSubmission.feedback || ""}
                  onChange={(e) =>
                    setEditingSubmission({
                      ...editingSubmission,
                      feedback: e.target.value,
                    })
                  }
                  placeholder="Комментарий к работе..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditSubmissionOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleEditSubmissionGrade}>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Access Control Dialog */}
      <Dialog open={isAccessControlOpen} onOpenChange={setIsAccessControlOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Управление доступом -{" "}
              {accessControlType === "assignment" ? "Задание" : "Теория"}
            </DialogTitle>
            <DialogDescription>
              {selectedContentId && (
                <>
                  {accessControlType === "assignment" &&
                    assignments.find((a) => a.id === selectedContentId)?.title}
                  {accessControlType === "theory" &&
                    theoryBlocks.find((t) => t.id === selectedContentId)?.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedContentId && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  onClick={() => {
                    const allStudentIds = students.map((s) => s.id);
                    const accessMap =
                      accessControlType === "assignment"
                        ? assignmentAccess
                        : theoryAccess;
                    const currentAccess = accessMap[selectedContentId] || [];
                    const studentsWithoutAccess = allStudentIds.filter(
                      (id) => !currentAccess.includes(id)
                    );

                    if (studentsWithoutAccess.length > 0) {
                      handleBulkToggleAccess(
                        selectedContentId,
                        studentsWithoutAccess,
                        true,
                        accessControlType
                      );
                    }
                  }}
                >
                  Открыть всем
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const accessMap =
                      accessControlType === "assignment"
                        ? assignmentAccess
                        : theoryAccess;
                    const currentAccess = accessMap[selectedContentId] || [];

                    if (currentAccess.length > 0) {
                      handleBulkToggleAccess(
                        selectedContentId,
                        currentAccess,
                        false,
                        accessControlType
                      );
                    }
                  }}
                >
                  Закрыть всем
                </Button>
              </div>

              <div className="space-y-2">
                {students.map((student) => {
                  const accessMap =
                    accessControlType === "assignment"
                      ? assignmentAccess
                      : theoryAccess;
                  const hasAccess = (
                    accessMap[selectedContentId] || []
                  ).includes(student.id);

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.username} • {student.grade || "Не указан"}{" "}
                            класс
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={hasAccess ? "default" : "outline"}
                        onClick={() =>
                          handleToggleAccess(
                            selectedContentId,
                            student.id,
                            accessControlType
                          )
                        }
                      >
                        {hasAccess ? "Отозвать доступ" : "Предоставить доступ"}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Ученики не найдены
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={isAnalyticsDialogOpen}
        onOpenChange={setIsAnalyticsDialogOpen}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Аналитика успеваемости
            </DialogTitle>
            <DialogDescription>
              Просмотр графика среднего балла ученика для отчётов родителям
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <Label htmlFor="student-select">Ученик</Label>
                <Select
                  value={selectedStudentForAnalytics}
                  onValueChange={setSelectedStudentForAnalytics}
                >
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Выберите ученика..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.last_name} {student.first_name}
                        {student.grade && ` (${student.grade} класс)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Label htmlFor="period-select">Группировка по</Label>
                <Select
                  value={analyticsGroupBy}
                  onValueChange={(value: "day" | "month") =>
                    setAnalyticsGroupBy(value)
                  }
                >
                  <SelectTrigger id="period-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Месяцам</SelectItem>
                    <SelectItem value="day">Дням</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedStudentForAnalytics && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    График успеваемости -{" "}
                    {
                      students.find((s) => s.id === selectedStudentForAnalytics)
                        ?.last_name
                    }{" "}
                    {
                      students.find((s) => s.id === selectedStudentForAnalytics)
                        ?.first_name
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    Средний балл по{" "}
                    {analyticsGroupBy === "month" ? "месяцам" : "дням"} (в
                    процентах от максимальной оценки)
                  </p>
                  {/* Отладочная информация */}
                  <p className="text-xs text-gray-400">
                    Данных для графика: {studentGradeData.length}
                  </p>
                </div>

                {isAnalyticsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : studentGradeData.length > 0 ? (
                  <div className="space-y-6">
                    {/* График успеваемости */}
                    <div className="bg-white rounded-lg border p-6">
                      <h4 className="font-medium mb-4 text-gray-900">
                        График динамики успеваемости
                      </h4>
                      {/* give parent a fixed pixel height so ResponsiveContainer can measure */}
                      <div
                        style={{ width: "100%", height: 320 }}
                        className="w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={studentGradeData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 40,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e0e0e0"
                            />
                            <XAxis
                              dataKey="period"
                              fontSize={11}
                              angle={0}
                              textAnchor="middle"
                              height={40}
                              stroke="#666"
                              interval={0}
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis
                              domain={[0, 100]}
                              label={{
                                value: "Средний балл (%)",
                                angle: -90,
                                position: "insideLeft",
                              }}
                              stroke="#666"
                              fontSize={12}
                            />
                            <Tooltip
                              formatter={(value: any) => [
                                `${value}%`,
                                "Средний балл",
                              ]}
                              labelFormatter={(label, payload) => {
                                if (
                                  payload &&
                                  payload[0] &&
                                  payload[0].payload.fullPeriod
                                ) {
                                  return `Период: ${payload[0].payload.fullPeriod}`;
                                }
                                return `Период: ${label}`;
                              }}
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="averageScore"
                              stroke="#2563eb"
                              strokeWidth={3}
                              dot={{ fill: "#2563eb", strokeWidth: 2, r: 6 }}
                              activeDot={{
                                r: 8,
                                stroke: "#2563eb",
                                strokeWidth: 2,
                                fill: "#ffffff",
                              }}
                              connectNulls={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Всего работ</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {studentGradeData.reduce(
                                (sum, item) => sum + item.submissionsCount,
                                0
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              Средний балл
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {Math.round(
                                studentGradeData.reduce(
                                  (sum, item) => sum + item.averageScore,
                                  0
                                ) / studentGradeData.length
                              )}
                              %
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Периодов</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {studentGradeData.length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      У данного ученика пока нет проверенных работ для анализа
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Filters Dialog */}
      <Dialog open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Фильтры</DialogTitle>
            <DialogDescription>
              Настройте параметры фильтрации
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentFilterTab === "assignments" && (
              <>
                <div className="space-y-2">
                  <Label>Тип задания</Label>
                  <Select
                    value={tempAssignmentFilter}
                    onValueChange={(value: "all" | "homework" | "classwork") =>
                      setTempAssignmentFilter(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все задания</SelectItem>
                      <SelectItem value="homework">Домашняя работа</SelectItem>
                      <SelectItem value="classwork">Классная работа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Поиск по названию</Label>
                  <Input
                    placeholder="Введите название..."
                    value={tempAssignmentSearch}
                    onChange={(e) => setTempAssignmentSearch(e.target.value)}
                  />
                </div>
              </>
            )}

            {currentFilterTab === "submissions" && (
              <>
                <div className="space-y-2">
                  <Label>Поиск по ученику</Label>
                  <Input
                    placeholder="Имя ученика..."
                    value={tempSubmissionStudentFilter}
                    onChange={(e) =>
                      setTempSubmissionStudentFilter(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Поиск по заданию</Label>
                  <Input
                    placeholder="Название задания..."
                    value={tempSubmissionAssignmentFilter}
                    onChange={(e) =>
                      setTempSubmissionAssignmentFilter(e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Сортировка</Label>
                  <Select
                    value={tempSubmissionSort}
                    onValueChange={(value: "newest" | "oldest") =>
                      setTempSubmissionSort(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">От новых к старым</SelectItem>
                      <SelectItem value="oldest">От старых к новым</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => resetMobileFilters(currentFilterTab)}
              className="flex-1"
            >
              Сброс
            </Button>
            <Button
              onClick={() => applyMobileFilters(currentFilterTab)}
              className="flex-1"
            >
              Применить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
