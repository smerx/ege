# 🚀 Руководство по публикации сайта-портфолио

## 📋 Содержание
1. [Подготовка к публикации](#подготовка-к-публикации)
2. [Замена изображений](#замена-изображений)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Варианты публикации](#варианты-публикации)
5. [Редактирование сайта](#редактирование-сайта)
6. [Переход на независимую версию](#переход-на-независимую-версию)

---

## 🛠 Подготовка к публикации

### 1. Замена тестовых данных на реальные

Откройте файл `/constants/mockData.ts` и обновите:

```typescript
export const CONTACT_INFO = {
  name: 'Дмитрий Андреевич Тепляшин',
  phone: '+7 904 123-75-34',
  telegram: '@IRK_Dmitry_Teplyashin',
  email: 'smerx620@gmail.com', // Замените на реальный email
  company: 'ГК Форус',
  location: 'Иркутск',
  consultationPrice: 1000, // Укажите реальную стоимость
  availableSlots: 3 // Количество свободных мест
};
```

### 2. Обновление учетных данных

В файле `/lib/supabase.ts` в разделе `mockData.users` замените:
- Email администратора на ваш реальный
- Пароли по умолчанию на более безопасные

---

## 🖼 Замена изображений

### Текущие placeholder изображения:
1. **Профильное фото** (`PHOTOS.profile`) - замените на ваше фото
2. **Фото с Байкала** (`PHOTOS.baikal`) - ваше фото с отдыха
3. **Фото из Владивостока** (`PHOTOS.vladivostok`) - ваше путешествие

### Как заменить:
1. Загрузите ваши фото на любой хостинг изображений:
   - [Imgur](https://imgur.com) (бесплатно)
   - [Cloudinary](https://cloudinary.com) (бесплатный план)
   - [ImageBB](https://imgbb.com) (бесплатно)

2. Обновите URLs в `/constants/mockData.ts`:
```typescript
export const PHOTOS = {
  profile: "https://your-hosting.com/your-profile-photo.jpg",
  baikal: "https://your-hosting.com/your-baikal-photo.jpg", 
  vladivostok: "https://your-hosting.com/your-vladivostok-photo.jpg"
};
```

---

## 🗄 Настройка базы данных

### Вариант 1: Продолжить с Mock данными (простой)
- Текущая система работает полностью без внешних зависимостей
- Все данные хранятся в браузере пользователя
- Подходит для демонстрации и тестирования

### Вариант 2: Подключить реальную Supabase (рекомендуется)

1. **Создайте проект в Supabase:**
   - Зайдите на [supabase.com](https://supabase.com)
   - Создайте бесплатный аккаунт
   - Создайте новый проект

2. **Настройте таблицы базы данных:**
```sql
-- Таблица пользователей
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('admin', 'student')) NOT NULL,
  grade VARCHAR,
  parent_phone VARCHAR,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица заданий
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  max_score INTEGER NOT NULL,
  image_urls TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица теории
CREATE TABLE theory_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица отправленных работ
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  score INTEGER,
  feedback TEXT,
  status VARCHAR CHECK (status IN ('pending', 'graded')) DEFAULT 'pending'
);
```

3. **Обновите конфигурацию:**
Замените mock-клиент в `/lib/supabase.ts` на реальный:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🌐 Варианты публикации

### 1. Vercel (рекомендуется - простой и бесплатный)

1. **Подготовка:**
   - Создайте аккаунт на [vercel.com](https://vercel.com)
   - Установите Git, если не установлен

2. **Развертывание:**
   ```bash
   # Скачайте код проекта
   # Создайте репозиторий на GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   
   # Импортируйте проект в Vercel
   # Vercel автоматически развернет сайт
   ```

3. **Настройка домена:**
   - В панели Vercel добавьте свой домен
   - Или используйте бесплатный поддомен vercel.app

### 2. Netlify

1. Зайдите на [netlify.com](https://netlify.com)
2. Подключите GitHub репозиторий
3. Настройте автоматическое развертывание

### 3. GitHub Pages

1. Активируйте GitHub Pages в настройках репозитория
2. Выберите ветку для публикации
3. Получите URL вида: `username.github.io/repository-name`

### 4. Хостинг провайдеры (платные)

- **TimeWeb** - российский хостинг
- **Reg.ru** - поддержка доменов .ru
- **DigitalOcean** - для более сложных проектов

---

## ✏️ Редактирование сайта

### Локальное редактирование

1. **Установите Node.js:**
   - Скачайте с [nodejs.org](https://nodejs.org)
   - Установите LTS версию

2. **Настройте проект:**
   ```bash
   npm install
   npm run dev
   ```

3. **Редактируйте файлы:**
   - `/constants/mockData.ts` - контактные данные
   - `/components/` - компоненты сайта
   - `/styles/globals.css` - стили

### Онлайн редактирование

1. **StackBlitz** (рекомендуется):
   - Зайдите на [stackblitz.com](https://stackblitz.com)
   - Импортируйте проект из GitHub
   - Редактируйте прямо в браузере

2. **CodeSandbox**:
   - [codesandbox.io](https://codesandbox.io)
   - Поддерживает React проекты

3. **Replit**:
   - [replit.com](https://replit.com)
   - Простой в использовании

---

## 🚀 Переход на независимую версию

### Шаг 1: Экспорт кода

1. **Скачайте весь код проекта**
2. **Создайте новый React проект:**
   ```bash
   npx create-react-app my-portfolio
   cd my-portfolio
   npm install @supabase/supabase-js lucide-react sonner
   ```

3. **Скопируйте файлы:**
   - Все компоненты из `/components/`
   - Стили из `/styles/`
   - Константы из `/constants/`

### Шаг 2: Настройка зависимостей

```bash
# Установите необходимые пакеты
npm install @supabase/supabase-js
npm install lucide-react
npm install sonner
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
```

### Шаг 3: Настройка Tailwind CSS

1. **Установите Tailwind:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Обновите конфигурацию** в `tailwind.config.js`

### Шаг 4: Замена компонентов

1. **Замените Figma-специфичные компоненты:**
   - Уберите зависимости от `ImageWithFallback`
   - Используйте обычные `<img>` теги

2. **Обновите импорты:**
   - Замените относительные пути на правильные

### Шаг 5: Тестирование

```bash
npm start
# Проверьте, что все работает корректно
```

---

## 📝 Рекомендации

### Безопасность
- Используйте HTTPS для продакшена
- Никогда не храните пароли в открытом виде
- Ограничьте доступ к админ-панели

### SEO оптимизация
- Добавьте meta теги
- Оптимизируйте изображения
- Используйте семантическую разметку

### Производительность
- Сжимайте изображения
- Используйте lazy loading
- Минифицируйте CSS/JS

### Мониторинг
- Настройте Google Analytics
- Используйте Yandex.Metrica для российской аудитории
- Добавьте форму обратной связи

---

## 🆘 Помощь и поддержка

Если возникнут вопросы:
1. Проверьте документацию используемых технологий
2. Обратитесь к сообществу разработчиков
3. Рассмотрите найм фрилансера для сложных задач

**Успехов с запуском вашего портфолио! 🎉**