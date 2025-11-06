/**
 * Parse progress percentage from Wiro API debugoutput
 * Handles various progress formats from different AI models
 */

/**
 * Extract percentage from debugoutput string
 * Examples:
 * - "OpenAI Video Process Status: Processing: [=============-----------------] 44.0%"
 * - "Processing: [================--------------] 56.0%"
 * - "Progress: 75%"
 */
export function parseProgressPercentage(debugoutput?: string): number | null {
  if (!debugoutput) return null;

  // Try to find percentage patterns
  // Pattern 1: "44.0%" or "44%" at the end of a line
  const percentageMatch = debugoutput.match(/(\d+\.?\d*)%\s*$/m);
  if (percentageMatch) {
    const percentage = parseFloat(percentageMatch[1]);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      return percentage;
    }
  }

  // Pattern 2: Look for percentage in middle of string
  const inlinePercentageMatch = debugoutput.match(/(\d+\.?\d*)%/);
  if (inlinePercentageMatch) {
    const percentage = parseFloat(inlinePercentageMatch[1]);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      return percentage;
    }
  }

  // Pattern 3: Extract from progress bar like "[=============-----------------] 44.0%"
  const progressBarMatch = debugoutput.match(/\[.*?\]\s*(\d+\.?\d*)%/);
  if (progressBarMatch) {
    const percentage = parseFloat(progressBarMatch[1]);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      return percentage;
    }
  }

  // Pattern 4: Try to calculate from progress bar visualization
  // Count "=" as filled and "-" as empty
  const barMatch = debugoutput.match(/\[([=\-]+)\]/);
  if (barMatch) {
    const bar = barMatch[1];
    const filled = (bar.match(/=/g) || []).length;
    const total = bar.length;
    if (total > 0) {
      const percentage = (filled / total) * 100;
      return Math.round(percentage * 10) / 10; // Round to 1 decimal
    }
  }

  return null;
}

/**
 * Extract the latest progress message from debugoutput
 * Returns the last meaningful progress line
 */
export function extractLatestProgressMessage(
  debugoutput?: string
): string | null {
  if (!debugoutput) return null;

  const lines = debugoutput.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return null;

  // Look for progress lines (containing "Processing", "Progress", or "%")
  const progressLines = lines.filter(
    (line) =>
      line.includes("Processing") ||
      line.includes("Progress") ||
      line.includes("%") ||
      line.includes("Queued") ||
      line.includes("Downloading")
  );

  if (progressLines.length > 0) {
    // Return the last progress line
    return progressLines[progressLines.length - 1].trim();
  }

  // If no progress lines, return the last line
  return lines[lines.length - 1].trim();
}
