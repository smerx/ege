// Utility functions for cleaning and processing student code

export function cleanStudentCode(content: string): string {
  if (!content) return content;

  // Extract code from $(код) format
  const codeMatch = content.match(/\$\(([\s\S]*?)\)/);
  if (codeMatch) {
    content = codeMatch[1];
  }

  // Split into lines for processing
  const lines = content.split("\n");
  const cleanedLines: string[] = [];

  let skipFirstLines = true;
  let linesSkipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and platform artifacts at the beginning
    if (skipFirstLines && linesSkipped < 3) {
      // Common platform artifacts to skip
      const isArtifact =
        trimmed === "" ||
        trimmed.includes("platform") ||
        trimmed.includes("system") ||
        trimmed.includes("version") ||
        trimmed.includes("python") ||
        trimmed.includes(">>>") ||
        trimmed.includes("...") ||
        trimmed.length < 3 ||
        /^[^a-zA-Zа-яА-Я0-9]*$/.test(trimmed); // Only special characters

      if (isArtifact) {
        linesSkipped++;
        continue;
      } else {
        skipFirstLines = false;
      }
    }

    // Add the line if it contains actual content
    if (trimmed.length > 0) {
      cleanedLines.push(line);
    }
  }

  // Remove common leading whitespace (dedent)
  if (cleanedLines.length > 0) {
    const nonEmptyLines = cleanedLines.filter((line) => line.trim().length > 0);
    if (nonEmptyLines.length > 0) {
      // Find minimum indentation
      let minIndent = Infinity;
      for (const line of nonEmptyLines) {
        const match = line.match(/^(\s*)/);
        if (match) {
          minIndent = Math.min(minIndent, match[1].length);
        }
      }

      // Remove common indentation
      if (minIndent > 0 && minIndent !== Infinity) {
        return cleanedLines
          .map((line) => {
            if (line.trim().length === 0) return "";
            return line.substring(minIndent);
          })
          .join("\n")
          .trim();
      }
    }
  }

  return cleanedLines.join("\n").trim();
}

export function extractCodeFromSubmission(content: string): string {
  if (!content) return "";

  console.log("Extracting code from:", content.substring(0, 100) + "...");

  // Try to extract code from various formats
  let extractedCode = content;

  // Format 1: $(код)
  const dollarMatch = content.match(/\$\(([\s\S]*?)\)/);
  if (dollarMatch) {
    console.log("Found $() format");
    extractedCode = dollarMatch[1];
    return cleanStudentCode(extractedCode);
  }

  // Format 2: ```код```
  const codeBlockMatch = content.match(/```(?:python|code)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    console.log("Found ``` format");
    extractedCode = codeBlockMatch[1];
    return cleanStudentCode(extractedCode);
  }

  // Format 3: Look for code patterns in the entire text
  const lines = content.split("\n");
  const codeLines: string[] = [];
  let foundCodePattern = false;
  let codeStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line looks like code
    const isCodeLine =
      (trimmed.includes("=") && /^[a-zA-Zа-яА-Я_]/.test(trimmed)) ||
      trimmed.includes("print(") ||
      trimmed.includes("input(") ||
      trimmed.startsWith("if ") ||
      trimmed.startsWith("for ") ||
      trimmed.startsWith("while ") ||
      trimmed.startsWith("def ") ||
      trimmed.startsWith("import ") ||
      trimmed.startsWith("from ") ||
      /^[a-zA-Zа-яА-Я_][a-zA-Zа-яА-Я0-9_]*\s*=/.test(trimmed) ||
      /^[a-zA-Zа-яА-Я_][a-zA-Zа-яА-Я0-9_]*\(/.test(trimmed);

    if (isCodeLine && !foundCodePattern) {
      console.log("Found code pattern at line", i);
      foundCodePattern = true;
      codeStartIndex = i;
    }

    if (foundCodePattern) {
      codeLines.push(line);
    }
  }

  if (foundCodePattern && codeLines.length > 0) {
    console.log("Extracted code lines:", codeLines.length);
    return cleanStudentCode(codeLines.join("\n"));
  }

  console.log("No specific code pattern found, returning original");
  // If no clear code pattern found, return original content
  return content;
}

// Special function for cleaning code specifically for AI analysis
export function cleanCodeForAI(content: string): string {
  if (!content) return content;

  console.log("Original content for AI:", content.substring(0, 200) + "...");

  // First extract the code
  let code = extractCodeFromSubmission(content);

  console.log("Extracted code:", code.substring(0, 200) + "...");

  // Then clean it
  code = cleanStudentCode(code);

  console.log("Cleaned code:", code.substring(0, 200) + "...");

  // Additional AI-specific cleaning
  const lines = code.split("\n");
  const cleanedLines: string[] = [];

  let foundMeaningfulCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines at the beginning
    if (!foundMeaningfulCode && trimmed.length === 0) continue;

    // Skip obvious platform artifacts
    if (
      trimmed.includes(">>>") ||
      trimmed.includes("...") ||
      trimmed.match(/^[\s\-\=\+\*\>\<]*$/) ||
      (trimmed.includes("python") && trimmed.length < 10) ||
      trimmed.includes("version") ||
      trimmed.includes("platform")
    ) {
      continue;
    }

    // Check if this looks like meaningful code
    const isMeaningfulLine =
      trimmed.includes("=") ||
      trimmed.includes("print") ||
      trimmed.includes("input") ||
      trimmed.includes("if ") ||
      trimmed.includes("for ") ||
      trimmed.includes("while ") ||
      trimmed.includes("def ") ||
      trimmed.includes("import ") ||
      trimmed.includes("from ") ||
      /^[a-zA-Zа-яА-Я_]/.test(trimmed) ||
      trimmed.length > 5;

    if (isMeaningfulLine || foundMeaningfulCode) {
      foundMeaningfulCode = true;
      // Keep original indentation for code structure
      cleanedLines.push(line);
    }
  }

  const result = cleanedLines.join("\n").trim();
  console.log("Final AI code:", result);

  return result || code; // Fallback to original cleaned code if nothing found
}
