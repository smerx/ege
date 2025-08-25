// Vercel API функция для отправки email
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Устанавливаем CORS заголовки
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Диагностика
  console.log("API Key exists:", !!process.env.RESEND_API_KEY);
  console.log("Request body:", req.body);

  try {
    const { type, data } = req.body;

    let emailResult;

    switch (type) {
      case "new_submission":
        emailResult = await sendNewSubmissionEmail(
          data.adminEmail,
          data.studentName,
          data.assignmentTitle
        );
        break;

      case "submission_graded":
        emailResult = await sendGradedSubmissionEmail(
          data.studentEmail,
          data.assignmentTitle,
          data.score,
          data.maxScore,
          data.feedback
        );
        break;

      default:
        return res.status(400).json({ error: "Invalid notification type" });
    }

    if (emailResult.success) {
      res
        .status(200)
        .json({ success: true, message: "Email sent successfully" });
    } else {
      res.status(500).json({ success: false, error: emailResult.error });
    }
  } catch (error) {
    console.error("Email API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Функция отправки уведомления о новой работе
async function sendNewSubmissionEmail(
  adminEmail,
  studentName,
  assignmentTitle
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Сайт преподавателя <onboarding@resend.dev>",
      to: adminEmail,
      subject: "📝 Новая работа на проверке",
      html: getNewSubmissionTemplate(studentName, assignmentTitle),
    });

    if (error) {
      console.error("Error sending new submission email:", error);
      return { success: false, error: error.message };
    }

    console.log("New submission email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
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
  try {
    const { data, error } = await resend.emails.send({
      from: "Сайт преподавателя <onboarding@resend.dev>",
      to: studentEmail,
      subject: "✅ Работа проверена!",
      html: getGradedSubmissionTemplate(
        assignmentTitle,
        score,
        maxScore,
        feedback
      ),
    });

    if (error) {
      console.error("Error sending graded submission email:", error);
      return { success: false, error: error.message };
    }

    console.log("Graded submission email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

// Шаблон для уведомления о новой работе
function getNewSubmissionTemplate(studentName, assignmentTitle) {
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
            <p>Перейдите в админ-панель для проверки работы:</p>
            <a href="https://ege100.vercel.app" class="button">Перейти к проверке</a>
          </div>
          <div class="footer">
            <p>Сайт преподавателя информатики<br>
            Дмитрий Андреевич Тепляшин</p>
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
            Дмитрий Андреевич Тепляшин</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
