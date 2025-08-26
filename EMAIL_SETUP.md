# Настройка Email уведомлений через Yandex Mail SMTP

## ✅ ГОТОВО К РАБОТЕ

**Yandex аккаунт**: `KasperskyDT@yandex.ru`  
**Пароль приложения**: `wpuobcryeurcgyry`

## 🚀 ОСТАЛОСЬ ТОЛЬКО: Добавить переменные в Vercel

### 1. Откройте Vercel Dashboard

1. Перейдите: https://vercel.com/dashboard
2. Найдите проект `ege100`
3. Кликните на название проекта

### 2. Настройте переменные

1. **Settings** → **Environment Variables**
2. **Удалите старые** (если есть): `GMAIL_USER`, `GMAIL_PASS`, `RESEND_API_KEY`
3. **Добавьте новые**:

```
YANDEX_USER=KasperskyDT@yandex.ru
YANDEX_PASS=wpuobcryeurcgyry
```

**Для каждой переменной:**

- Name: `YANDEX_USER` или `YANDEX_PASS`
- Value: значение выше
- Environments: ✅ Production ✅ Preview ✅ Development
- Нажмите **Save**

### 3. Проверьте результат

После сохранения переменных Vercel автоматически пересоберет проект (2-3 минуты).

**Тест:**

1. Откройте сайт: https://ege100.vercel.app
2. Войдите как студент
3. Отправьте работу
4. Проверьте почту: `smerx620@gmail.com`

## 🔧 Технические детали

**Настроено и готово:**

- ✅ SMTP: `smtp.yandex.ru:465` (SSL)
- ✅ Аккаунт: `KasperskyDT@yandex.ru`
- ✅ Пароль приложения: `wpuobcryeurcgyry`
- ✅ API код обновлен для Yandex
- ✅ Шаблоны писем обновлены
- ✅ Git репозиторий обновлен

**Осталось:**

- 🔄 Добавить `YANDEX_USER` и `YANDEX_PASS` в Vercel

## 🚨 Если есть проблемы

**Проверьте логи Vercel:**

1. Vercel Dashboard → ваш проект
2. **Functions** → **View Function Logs**
3. Ищите вызовы `/api/send-email`

**Должно быть:**

```
hasYandexUser: true
hasYandexPass: true
yandexUser: "KasperskyDT@yandex.ru"
```

**Если false** - переменные не добавлены в Vercel.

---

## ✅ Все готово!

Просто добавьте 2 переменные в Vercel Dashboard - и email система заработает!
