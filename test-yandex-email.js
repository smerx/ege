// Тестовый скрипт для проверки Yandex SMTP
// Запуск: node test-yandex-email.js

const nodemailer = require('nodemailer');

// Настройки для тестирования (заполните актуальными данными)
const YANDEX_USER = 'ege100project@yandex.ru';
const YANDEX_PASS = 'ВАЗДЕСЬ_ПАРОЛЬ_ПРИЛОЖЕНИЯ'; // Получите из https://id.yandex.ru/

async function testYandexEmail() {
  console.log('🚀 Тестирование Yandex SMTP...');
  
  // Создаем транспорт
  const transporter = nodemailer.createTransporter({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: YANDEX_USER,
      pass: YANDEX_PASS,
    },
  });

  // Тестовое письмо
  const mailOptions = {
    from: `"Тест сайта преподавателя" <${YANDEX_USER}>`,
    to: 'smerx620@gmail.com', // Замените на свой email для тестирования
    subject: '✅ Тест Yandex SMTP - Работает!',
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
    console.log('📧 Отправляем тестовое письмо...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Письмо отправлено успешно!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('🎯 Проверьте почту smerx620@gmail.com');
  } catch (error) {
    console.error('❌ Ошибка отправки:', error.message);
    console.error('Полная ошибка:', error);
  }
}

// Проверяем наличие пароля
if (YANDEX_PASS === 'ВАЗДЕСЬ_ПАРОЛЬ_ПРИЛОЖЕНИЯ') {
  console.error('❌ Необходимо указать реальный пароль приложения Yandex!');
  console.log('1. Идите на https://id.yandex.ru/');
  console.log('2. Войдите как ege100project@yandex.ru');
  console.log('3. Безопасность → Пароли приложений');
  console.log('4. Создайте пароль для "Почта"');
  console.log('5. Замените YANDEX_PASS в этом файле');
  process.exit(1);
}

testYandexEmail();
