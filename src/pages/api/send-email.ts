// Клиентский сервис для отправки email уведомлений через API

export interface EmailNotificationRequest {
  type: "new_submission" | "submission_graded";
  data: {
    adminEmail?: string;
    studentEmail?: string;
    studentName?: string;
    assignmentTitle?: string;
    score?: number;
    maxScore?: number;
    feedback?: string;
  };
}

export async function sendEmailNotification(
  request: EmailNotificationRequest
): Promise<boolean> {
  // Отправляем письма только на продакшене (боевой домен)
  try {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isProdDomain = hostname === "ege100.vercel.app";
      if (!isProdDomain) {
        console.log(
          "Email notification skipped: non-production environment",
          { hostname }
        );
        return true; // тихо пропускаем вне продакшена
      }
    }
  } catch (_) {
    // ignore any window access issues
  }

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Email API error:", errorData);
      return false;
    }

    const result = await response.json().catch(() => ({}));
    console.log("Email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
}
