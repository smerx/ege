import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { AchievementsSection } from "./components/AchievementsSection";
import { PracticeSection } from "./components/PracticeSection";
import { Footer } from "./components/Footer";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { currentView, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case 'login':
      return <LoginForm />;
    
    case 'register':
      return <RegisterForm />;
    
    case 'student-dashboard':
      return <StudentDashboard />;
    
    case 'admin-dashboard':
      return <AdminDashboard />;
    
    case 'home':
    default:
      return (
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <HeroSection />
            <AboutSection />
            <AchievementsSection />
            <PracticeSection />
          </main>
          <Footer />
        </div>
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}