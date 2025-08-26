// Vercel API функция для отправки email через Yandex Mail SMTP (CommonJS)
const nodemailer = require("nodemailer");

// Настройка Yandex Mail транспорта
function createYandexTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true, // true для 465, false для других портов
    auth: {
      user: process.env.YANDEX_USER,
      pass: process.env.YANDEX_PASS, // Пароль приложения
    },
  });
}

module.exports = async function handler(req, res) {
  console.log("=== YANDEX EMAIL API START ===");
  console.log("Method:", req.method);
  console.log("Environment:", {
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    hasYandexUser: !!process.env.YANDEX_USER,
    hasYandexPass: !!process.env.YANDEX_PASS,
    yandexUser: process.env.YANDEX_USER || "not set"
  });

  // Устанавливаем CORS заголовки
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("OPTIONS request handled");
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Диагностика окружения
  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || "";
  const isProduction = vercelEnv === "production";
  console.log("Environment check:", { vercelEnv, isProduction });
  
  if (!isProduction) {
    console.log("Skipping email in non-production environment");
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: "Email sending is disabled outside production environment",
      env: vercelEnv,
    });
  }

  // Проверяем Yandex настройки
  if (!process.env.YANDEX_USER || !process.env.YANDEX_PASS) {
    console.error("Yandex credentials missing!", {
      hasUser: !!process.env.YANDEX_USER,
      hasPass: !!process.env.YANDEX_PASS
    });
    return res.status(500).json({ 
      error: "Yandex Mail service configuration missing",
      success: false 
    });
  }

  // Диагностика тела запроса
  console.log("Raw request body type:", typeof req.body);
  console.log("Raw request body:", req.body);

  // Пытаемся безопасно распарсить тело запроса
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
      console.log("Successfully parsed JSON body");
    } catch (e) {
      console.error("Failed to parse JSON body:", e);
      return res.status(400).json({ error: "Invalid JSON body", success: false });
    }
  }
  console.log("Parsed request body:", JSON.stringify(body, null, 2));

  try {
    const { type, data } = body;
    console.log("Processing email type:", type);
    console.log("Email data:", JSON.stringify(data, null, 2));

    if (!type || !data) {
      console.error("Missing type or data in request");
      return res.status(400).json({ 
        error: "Missing required fields: type, data",
        success: false 
      });
    }

    let emailResult;

    switch (type) {
      case "new_submission":
        console.log("Sending new submission email...");
        emailResult = await sendNewSubmissionEmail(
          data.adminEmail,
          data.studentName,
          data.assignmentTitle
        );
        break;

      case "submission_graded":
        console.log("Sending graded submission email...");
        emailResult = await sendGradedSubmissionEmail(
          data.studentEmail,
          data.assignmentTitle,
          data.score,
          data.maxScore,
          data.feedback
        );
        break;

      default:
        console.error("Invalid notification type:", type);
        return res.status(400).json({ 
          error: "Invalid notification type: " + type,
          success: false 
        });
    }

    console.log("Email result:", emailResult);

    if (emailResult.success) {
      console.log("Email sent successfully!");
      res.status(200).json({ 
        success: true, 
        message: "Email sent successfully",
        data: emailResult.data 
      });
    } else {
      console.error("Email sending failed:", emailResult.error);
      res.status(500).json({ 
        success: false, 
        error: emailResult.error 
      });
    }
  } catch (error) {
    console.error("Email API error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Internal server error: " + error.message,
      success: false 
    });
  } finally {
    console.log("=== YANDEX EMAIL API END ===");
  }
};

// Функция отправки уведомления о новой работе
async function sendNewSubmissionEmail(
  adminEmail,
  studentName,
  assignmentTitle
) {
  console.log("sendNewSubmissionEmail called with:", { adminEmail, studentName, assignmentTitle });
  
  if (!adminEmail || !studentName || !assignmentTitle) {
    const error = "Missing required parameters for new submission email";
    console.error(error);
    return { success: false, error };
  }

  try {
    const transporter = createYandexTransporter();
    console.log("Yandex transporter created, attempting to send email...");
    
    const mailOptions = {
      from: `"Сайт преподавателя" <${process.env.YANDEX_USER}>`,
      to: adminEmail,
      subject: `📝 Новая работа от ${studentName}`,
      html: getNewSubmissionTemplate(studentName, assignmentTitle, adminEmail),
    };
    
    console.log("Email options:", JSON.stringify(mailOptions, null, 2));
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("Yandex email sent successfully:", info);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception in sendNewSubmissionEmail:", error);
    return { success: false, error: error.message };
  }
}

// Функция отправки уведомления о проверенной работе
async function sendGradedSubmissionEmail(
  studentEmail,
  assignmentTitle,
  score,
  maxScore,
  feedback
) {
  console.log("sendGradedSubmissionEmail called with:", { 
    studentEmail, assignmentTitle, score, maxScore, feedback 
  });
  
  if (!studentEmail || !assignmentTitle || score === undefined || maxScore === undefined) {
    const error = "Missing required parameters for graded submission email";
    console.error(error);
    return { success: false, error };
  }

  try {
    const transporter = createYandexTransporter();
    console.log("Yandex transporter created, attempting to send graded email...");
    
    const mailOptions = {
      from: `"Сайт преподавателя" <${process.env.YANDEX_USER}>`,
      to: studentEmail,
      subject: `✅ Работа проверена! ${assignmentTitle}`,
      html: getGradedSubmissionTemplate(
        assignmentTitle,
        score,
        maxScore,
        feedback
      ),
    };
    
    console.log("Graded email options:", JSON.stringify(mailOptions, null, 2));
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("Yandex graded email sent successfully:", info);
    return { success: true, data: info };
  } catch (error) {
    console.error("Exception in sendGradedSubmissionEmail:", error);
    return { success: false, error: error.message };
  }
}

// Шаблон для уведомления о новой работе
function getNewSubmissionTemplate(studentName, assignmentTitle, adminEmail) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Новая работа на проверке</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .info { background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Новая работа на проверке</h1>
          </div>
          <div class="content">
            <p>Здравствуйте!</p>
            <p><strong>${studentName}</strong> отправил(а) работу на проверку:</p>
            <p><strong>Задание:</strong> ${assignmentTitle}</p>
            
            <div class="info">
              <strong>Получатель:</strong> ${adminEmail}
            </div>
            
            <p>Перейдите в админ-панель для проверки работы:</p>
            <a href="https://ege100.vercel.app" class="button">Перейти к проверке</a>
          </div>
          <div class="footer">
            <p>Сайт преподавателя информатики<br>
            Дмитрий Андреевич Тепляшин<br>
            Отправлено через Gmail: ${process.env.GMAIL_USER || 'email не настроен'}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Шаблон для уведомления о проверенной работе
function getGradedSubmissionTemplate(
  assignmentTitle,
  score,
  maxScore,
  feedback
) {
  const percentage = Math.round((score / maxScore) * 100);
  const gradeEmoji = percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Работа проверена</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .score { background: #e0f2fe; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0; }
          .score-value { font-size: 24px; font-weight: bold; color: #0277bd; }
          .feedback { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Работа проверена!</h1>
          </div>
          <div class="content">
            <p>Здравствуйте!</p>
            <p>Ваша работа по заданию <strong>"${assignmentTitle}"</strong> проверена:</p>
            
            <div class="score">
              <div class="score-value">${gradeEmoji} ${score} из ${maxScore} баллов</div>
              <div>Результат: ${percentage}%</div>
            </div>

            ${
              feedback
                ? `
              <div class="feedback">
                <strong>Комментарий преподавателя:</strong><br>
                ${feedback}
              </div>
            `
                : ""
            }

            <p>Перейдите в личный кабинет для просмотра подробностей:</p>
            <a href="https://ege100.vercel.app" class="button">Перейти в кабинет</a>
          </div>
          <div class="footer">
            <p>Сайт преподавателя информатики<br>
            Дмитрий Андреевич Тепляшин<br>
            Отправлено через Yandex Mail: ${process.env.YANDEX_USER || 'email не настроен'}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
