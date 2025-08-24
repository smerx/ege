// Gemini AI service for automatic assignment evaluation
// Free API - up to 60 requests per minute, 1500 requests per day

import { cleanCodeForAI } from './codeUtils';

interface AssignmentData {
  title: string;
  description: string;
  maxScore: number;
  imageUrls?: string[];
}

interface SubmissionData {
  imageUrls?: string[];
  textContent?: string;
}

interface AIEvaluationResult {
  completionProbability: number; // 0-100%
  suggestedScore: number;
  feedback: string;
  criteriaAnalysis: {
    criterion: string;
    percentage: number;
    reasoning: string;
  }[];
  overallReasoning: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function evaluateSubmissionWithAI(
  assignment: AssignmentData,
  submission: SubmissionData
): Promise<AIEvaluationResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  // Clean and extract the student's code for AI analysis
  const cleanedCode = submission.textContent ? cleanCodeForAI(submission.textContent) : "";
  
  console.log("Original submission:", submission.textContent?.substring(0, 200) + "...");
  console.log("Cleaned code for AI:", cleanedCode);

  const prompt = `
Ты - опытный преподаватель информатики. Оцени выполнение задания учеником.

ВАЖНО: Игнорируй технические артефакты платформы в начале кода (пустые строки, отступы, системную информацию). Оценивай только содержательную часть решения.

ЗАДАНИЕ:
Название: ${assignment.title}
Описание: ${assignment.description}
Максимальный балл: ${assignment.maxScore}
${
  assignment.imageUrls?.length
    ? `Изображения задания: ${assignment.imageUrls.length} шт.`
    : ""
}

РАБОТА УЧЕНИКА:
${submission.textContent ? `Исходный ответ: ${submission.textContent}` : ""}
${cleanedCode ? `
Извлеченный код для анализа:
\`\`\`
${cleanedCode}
\`\`\`
` : ""}
${
  submission.imageUrls?.length
    ? `Изображения работы: ${submission.imageUrls.length} шт.`
    : ""
}

ТРЕБОВАНИЯ К ОЦЕНКЕ:
1. Оцени вероятность корректного выполнения задания (0-100%)
2. Предложи оценку от 0 до ${assignment.maxScore}
3. Дай краткий комментарий (2-3 предложения)
4. Проанализируй выполнение по критериям
5. Укажи основные причины оценки

ФОРМАТ ОТВЕТА (строго JSON):
{
  "completionProbability": число от 0 до 100,
  "suggestedScore": число от 0 до ${assignment.maxScore},
  "feedback": "краткий комментарий от учителя прямо, пиши ученику на ТЫ",
  "criteriaAnalysis": [
    {
      "criterion": "название критерия",
      "percentage": число от 0 до 100,
      "reasoning": "краткое обоснование"
    }
  ],
  "overallReasoning": "общее обоснование оценки"
}

Будь объективным, но конструктивным, на мелкие неточности первых трёх строк внимания не обращай, это нюансы платфомы, они так приходят, это не ошибки учеников. Отвечай только JSON без дополнительного текста.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid API response format");
    }

    const aiText = data.candidates[0].content.parts[0].text;

    // Clean up the response and parse JSON
    const cleanJson = aiText
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const result: AIEvaluationResult = JSON.parse(cleanJson);

      // Validate the result
      if (
        typeof result.completionProbability !== "number" ||
        typeof result.suggestedScore !== "number" ||
        typeof result.feedback !== "string" ||
        !Array.isArray(result.criteriaAnalysis) ||
        typeof result.overallReasoning !== "string"
      ) {
        throw new Error("Invalid result format from AI");
      }

      // Ensure values are within bounds
      result.completionProbability = Math.max(
        0,
        Math.min(100, result.completionProbability)
      );
      result.suggestedScore = Math.max(
        0,
        Math.min(assignment.maxScore, result.suggestedScore)
      );

      return result;
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanJson);
      throw new Error("Failed to parse AI evaluation result");
    }
  } catch (error) {
    console.error("AI evaluation error:", error);
    throw error;
  }
}

// Helper function to format AI feedback for display
export function formatAIFeedback(evaluation: AIEvaluationResult): string {
  let feedback = `🤖 ИИ-анализ:\n\n`;
  feedback += `📊 Вероятность корректного выполнения: ${evaluation.completionProbability}%\n`;
  feedback += `🎯 Рекомендуемая оценка: ${evaluation.suggestedScore}\n\n`;
  feedback += `💬 Комментарий: ${evaluation.feedback}\n\n`;

  if (evaluation.criteriaAnalysis.length > 0) {
    feedback += `📋 Анализ по критериям:\n`;
    evaluation.criteriaAnalysis.forEach((criterion, index) => {
      feedback += `${index + 1}. ${criterion.criterion}: ${
        criterion.percentage
      }% - ${criterion.reasoning}\n`;
    });
    feedback += `\n`;
  }

  feedback += `🔍 Обоснование: ${evaluation.overallReasoning}`;

  return feedback;
}
