export const SPEAKING_PRECHECK_INSTRUCTIONS = [
  "Ensure you are in a quiet environment",
  "Make sure your microphone and speakers are working",
  "Test your microphone before starting",
  "Close other applications that might use your microphone",
  "Ensure you have a stable internet connection",
  "Speak clearly and naturally",
  "Listen carefully to the examiner's questions",
] as const;

export function speakingPrecheckDurationLine(estimatedMinutes: number): string {
  return `The session will take approximately ${estimatedMinutes} minutes`;
}
