import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, hashPassword, verifyPassword, initializeDatabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'student';
  username?: string;
  grade?: string;
  parentPhone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentView: 'home' | 'login' | 'register' | 'student-dashboard' | 'admin-dashboard';
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  setView: (view: 'home' | 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'register' | 'student-dashboard' | 'admin-dashboard'>('home');

  useEffect(() => {
    // Initialize database with sample data if needed
    initializeDatabase().catch(console.error);
    
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView(userData.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Query user by email or username
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
        .limit(1);

      if (error) {
        console.error('Login query error:', error);
        setLoading(false);
        return false;
      }

      if (!users || users.length === 0) {
        setLoading(false);
        return false;
      }

      const foundUser = users[0];
      
      // Verify password
      const passwordValid = await verifyPassword(password, foundUser.password_hash);
      
      if (!passwordValid) {
        setLoading(false);
        return false;
      }

      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.first_name,
        lastName: foundUser.last_name,
        role: foundUser.role,
        username: foundUser.username,
        grade: foundUser.grade,
        parentPhone: foundUser.parent_phone
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentView(userData.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const passwordHash = await hashPassword(password);
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          username,
          first_name: firstName,
          last_name: lastName,
          role: 'student',
          password_hash: passwordHash
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        setLoading(false);
        return false;
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        username: data.username,
        grade: data.grade,
        parentPhone: data.parent_phone
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentView('student-dashboard');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('home');
  };

  const setView = (view: 'home' | 'login' | 'register') => {
    setCurrentView(view);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      currentView,
      login,
      register,
      logout,
      setView
    }}>
      {children}
    </AuthContext.Provider>
  );
}