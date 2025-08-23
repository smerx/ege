// Подключение к реальному Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iuicdelwovufbwmeeeth.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aWNkZWx3b3Z1ZmJ3bWVlZXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTQzMDUsImV4cCI6MjA3MTM3MDMwNX0.NcFymxWFOA865rFz-SxBBuHsFzPr5mPDoktXOcAwcA4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
          role: "admin" | "student";
          grade?: string;
          parent_phone?: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
          role: "admin" | "student";
          grade?: string;
          parent_phone?: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          first_name?: string;
          last_name?: string;
          role?: "admin" | "student";
          grade?: string;
          parent_phone?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          title: string;
          description: string;
          max_score: number;
          image_urls: string[];
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          max_score: number;
          image_urls?: string[];
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          max_score?: number;
          image_urls?: string[];
          created_at?: string;
          created_by?: string;
        };
      };
      theory_blocks: {
        Row: {
          id: string;
          title: string;
          content: string;
          image_urls: string[];
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          image_urls?: string[];
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          image_urls?: string[];
          created_at?: string;
          created_by?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          content: string;
          submitted_at: string;
          score?: number;
          feedback?: string;
          status: "pending" | "graded";
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          content: string;
          submitted_at?: string;
          score?: number;
          feedback?: string;
          status?: "pending" | "graded";
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          content?: string;
          submitted_at?: string;
          score?: number;
          feedback?: string;
          status?: "pending" | "graded";
        };
      };
    };
  };
}

// Utility functions
export const hashPassword = async (password: string): Promise<string> => {
  // Simple base64 encoding for demo purposes
  // In production, use proper password hashing like bcrypt
  return btoa(password);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return btoa(password) === hash;
};

// Функция для конвертации файла в base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Альтернативная функция загрузки через base64 (более простая)
export const uploadFileAsBase64 = async (
  file: File
): Promise<string | null> => {
  try {
    console.log('Converting file to base64:', file.name, 'Size:', file.size);
    
    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return null;
    }
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      console.error('Not an image file:', file.type);
      return null;
    }
    
    const base64String = await fileToBase64(file);
    console.log('File converted to base64 successfully');
    
    return base64String;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    return null;
  }
};

// Функция для загрузки файла в Supabase Storage
export const uploadFile = async (
  file: File,
  bucket: string = "images"
): Promise<string | null> => {
  try {
    console.log('Starting file upload:', file.name, 'Size:', file.size);
    
    // Сначала пробуем загрузить в Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    console.log('Generated filename:', fileName);
    
    // Загружаем файл в Supabase Storage
    let { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Storage upload failed:', error);
      console.log('Falling back to base64...');
      
      // Если Storage не работает, используем base64
      return await uploadFileAsBase64(file);
    }
    
    // Получаем публичный URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    const publicUrl = publicUrlData?.publicUrl;
    console.log('File uploaded to storage successfully:', publicUrl);
    
    return publicUrl || null;
  } catch (error) {
    console.error('Upload function error, trying base64:', error);
    return await uploadFileAsBase64(file);
  }
};
