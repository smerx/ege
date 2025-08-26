// Тестовый скрипт для проверки Yandex SMTP
// Запуск (PowerShell): setx YANDEX_USER "KasperskyDT@yandex.ru"; setx YANDEX_PASS "wpuobcryeurcgyry"; node test-yandex-email.js

const nodemailer = require("nodemailer");

// Берём креды из переменных окружения, чтобы не хранить их в коде
const YANDEX_USER = process.env.YANDEX_USER;
const YANDEX_PASS = process.env.YANDEX_PASS;

async function testYandexEmail() {
  console.log("🚀 Тестирование Yandex SMTP...");

  if (!YANDEX_USER || !YANDEX_PASS) {
    console.error(
      "❌ Не заданы переменные окружения YANDEX_USER / YANDEX_PASS"
    );
    console.log("Пример (PowerShell):");
    console.log('  setx YANDEX_USER "KasperskyDT@yandex.ru"');
    console.log('  setx YANDEX_PASS "wpuobcryeurcgyry"');
    console.log(
      "Затем перезапустите терминал и выполните: node test-yandex-email.js"
    );
    process.exit(1);
  }

  // Создаем транспорт
  const transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: {
      user: YANDEX_USER,
      pass: YANDEX_PASS,
    },
  });

  try {
    console.log("🔎 verify() проверка подключения...");
    await transporter.verify();
    console.log("✅ SMTP авторизация успешна");
  } catch (e) {
    console.error("❌ Ошибка авторизации SMTP:", e.message);
    console.error("Полная ошибка:", e);
    process.exit(1);
  }

  // Тестовое письмо
  const mailOptions = {
    from: `"Тест сайта преподавателя" <${YANDEX_USER}>`,
    to: "smerx620@gmail.com", // Замените на свой email для тестирования
    subject: "✅ Тест Yandex SMTP - Работает!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Yandex SMTP настроен успешно!</h2>
        <p>Это тестовое письмо отправлено с аккаунта <strong>${YANDEX_USER}</strong></p>
        <p>Время отправки: <strong>${new Date().toLocaleString()}</strong></p>
        <hr>
        <p style="color: #666; font-size: 14px;">
          Теперь можно добавлять переменные в Vercel и тестировать на продакшене.
        </p>
      </div>
    `,
  };

  try {
    console.log("📧 Отправляем тестовое письмо...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Письмо отправлено успешно!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("🎯 Проверьте почту smerx620@gmail.com");
  } catch (error) {
    console.error("❌ Ошибка отправки:", error.message);
    console.error("Полная ошибка:", error);
  }
}

testYandexEmail();
