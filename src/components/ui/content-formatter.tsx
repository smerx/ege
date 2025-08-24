import React from "react";
import { ExternalLink } from "lucide-react";

interface ContentFormatterProps {
  content: string;
  className?: string;
}

interface TextPart {
  type: "text";
  content: string;
}

interface CodePart {
  type: "code";
  start: number;
  end: number;
  content: string;
  full: string;
}

interface LinkPart {
  type: "link";
  start: number;
  end: number;
  content: string;
  full: string;
}

type ContentPart = TextPart | CodePart | LinkPart;

export function ContentFormatter({
  content,
  className = "",
}: ContentFormatterProps) {
  const formatContent = (text: string): ContentPart[] => {
    // Разбиваем текст на части для обработки
    const parts: ContentPart[] = [];
    let lastIndex = 0;

    // Регулярное выражение для поиска блоков кода $(...)
    const codeBlockRegex = /\$\(([\s\S]*?)\)/g;
    // Регулярное выражение для поиска ссылок
    const linkRegex = /(https?:\/\/[^\s]+)/g;

    // Собираем все совпадения (блоки кода и ссылки) с их позициями
    const matches: (CodePart | LinkPart)[] = [];

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        type: "code",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        full: match[0],
      } as CodePart);
    }

    // Сбрасываем lastIndex для поиска ссылок
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(text)) !== null) {
      // Проверяем, что ссылка не находится внутри блока кода
      const isInsideCodeBlock = matches.some(
        (codeMatch) =>
          codeMatch.type === "code" &&
          match.index >= codeMatch.start &&
          match.index < codeMatch.end
      );

      if (!isInsideCodeBlock) {
        matches.push({
          type: "link",
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          full: match[0],
        } as LinkPart);
      }
    }

    // Сортируем совпадения по позиции
    matches.sort((a, b) => a.start - b.start);

    // Формируем части текста
    matches.forEach((match, index) => {
      // Добавляем текст до совпадения
      if (match.start > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.start),
        } as TextPart);
      }

      // Добавляем само совпадение
      parts.push(match);
      lastIndex = match.end;
    });

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
      } as TextPart);
    }

    return parts;
  };

  const handleLinkClick = (url: string) => {
    // Убеждаемся, что URL начинается с протокола
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(formattedUrl, "_blank", "noopener,noreferrer");
  };

  const parts = formatContent(content);

  return (
    <div className={`formatted-content ${className}`}>
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <div key={index} className="my-2">
              <code
                className="bg-gray-800 text-green-400 px-3 py-2 rounded text-sm font-mono block whitespace-pre-wrap"
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                }}
              >
                {part.content}
              </code>
            </div>
          );
        } else if (part.type === "link") {
          return (
            <button
              key={index}
              onClick={() => handleLinkClick(part.content)}
              className="text-blue-600 hover:text-blue-800 underline decoration-1 hover:decoration-2 transition-all duration-200 inline-flex items-center gap-1 mx-1"
              title={`Открыть ссылку: ${part.content}`}
            >
              {part.content}
              <ExternalLink className="w-3 h-3" />
            </button>
          );
        } else {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {part.content}
            </span>
          );
        }
      })}
    </div>
  );
}
