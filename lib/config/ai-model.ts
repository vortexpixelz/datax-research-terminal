export const AI_CONFIG = {
  provider: "groq",
  model: "llama-3.3-70b-versatile", // Fast and powerful Groq model
  temperature: 0.7,
  maxTokens: 8000,
}

export const getModelString = () => {
  return AI_CONFIG.model
}
