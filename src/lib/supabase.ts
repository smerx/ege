// Подключение к реальному Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iuicdelwovufbwmeeeth.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aWNkZWx3b3Z1ZmJ3bWVlZXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTQzMDUsImV4cCI6MjA3MTM3MDMwNX0.NcFymxWFOA865rFz-SxBBuHsFzPr5mPDoktXOcAwcA4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Универсальный интерфейс для работы с Supabase, повторяющий mock-цепочки
function selectBuilder(table, columns) {
  let builder = supabase.from(table).select(columns);
  const chain = {
    eq: (column, value) => {
      builder = builder.eq(column, value);
      return chain;
    },
    or: (queryStr) => {
      builder = builder.or(queryStr);
      return chain;
    },
    order: (column, options) => {
      builder = builder.order(column, options);
      return chain;
    },
    limit: (count) => {
      builder = builder.limit(count);
      return chain;
    },
    single: () => {
      builder = builder.single();
      return chain;
    },
    then: async (callback) => {
      const { data, error } = await builder;
      callback({ data, error });
      return { data, error };
    },
  };
  return chain;
}

export const db = {
  from: (table) => ({
    select: (columns) => selectBuilder(table, columns),
    insert: (data) => ({
      then: async (callback) => {
        const { data: d, error } = await supabase.from(table).insert(data);
        callback({ data: d, error });
        return { data: d, error };
      },
    }),
    update: (data) => ({
      then: async (callback) => {
        const { data: d, error } = await supabase.from(table).update(data);
        callback({ data: d, error });
        return { data: d, error };
      },
    }),
    delete: () => ({
      then: async (callback) => {
        const { data: d, error } = await supabase.from(table).delete();
        callback({ data: d, error });
        return { data: d, error };
      },
    }),
    upsert: (data) => ({
      then: async (callback) => {
        const { data: d, error } = await supabase.from(table).upsert(data);
        callback({ data: d, error });
        return { data: d, error };
      },
    }),
  }),
  storage: supabase.storage,
  _wrap: (builder) => {
    return {
      then: async (callback) => {
        const { data, error } = await builder;
        callback({ data, error });
        return { data, error };
      },
    };
  },
};

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

// Функция для загрузки файла в Supabase Storage
export const uploadFile = async (
  file: File,
  bucket: string = "images"
): Promise<string | null> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  if (error) return null;
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  return publicUrlData?.publicUrl || null;
};

// Функция-заглушка для совместимости с прежним кодом
export const initializeDatabase = async () => {
  // Теперь инициализация не требуется, данные берутся из Supabase
  return Promise.resolve();
};
