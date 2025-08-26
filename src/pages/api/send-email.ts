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
  console.log("=== CLIENT EMAIL START ===");
  console.log("Request:", JSON.stringify(request, null, 2));

  // Отправляем письма только на продакшене (боевой домен)
  try {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isProdDomain = hostname === "ege100.vercel.app";
      console.log("Environment check:", { hostname, isProdDomain });

      if (!isProdDomain) {
        console.log("Email notification skipped: non-production environment", {
          hostname,
        });
        return true; // тихо пропускаем вне продакшена
      }
    }
  } catch (err) {
    console.error("Window access error:", err);
  }

  try {
    console.log("Sending POST request to /api/send-email...");
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    let responseData;
    try {
      responseData = await response.json();
      console.log("Response data:", responseData);
    } catch (jsonError) {
      console.error("Failed to parse response JSON:", jsonError);
      responseData = {};
    }

    if (!response.ok) {
      console.error("Email API error:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      return false;
    }

    console.log("Email sent successfully:", responseData);
    return true;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  } finally {
    console.log("=== CLIENT EMAIL END ===");
  }
}
