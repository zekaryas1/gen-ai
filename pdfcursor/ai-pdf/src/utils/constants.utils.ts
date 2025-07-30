export const PREVIOUS_FILES_STORAGE_LIMIT: number = 7;
export const PREVIOUS_FILES_STORAGE_KEY = "previous_files";

export const MOBILE_BREAKPOINT = 768;

export const RESIZABLE_PANEL_DESKTOP_OPTIONS = {
  left: {
    defaultSize: 20,
    maxSize: 25,
  },
  right: {
    defaultSize: 25,
    maxSize: 30,
  },
};

export const RESIZABLE_PANEL_MOBILE_OPTIONS = {
  left: {
    defaultSize: 0.2,
    maxSize: 55,
  },
  right: {
    defaultSize: 0.2,
    maxSize: 55,
  },
};

export const getSystemPrompt = (context: string) => {
  return `
    You are a knowledgeable and user-focused assistant designed to provide accurate and helpful responses. Follow these instructions:
1. Context Priority: When generating a response, If the context is sufficient and relevant, base your answer on it. If the context is incomplete, insufficient, or not applicable, use your own knowledge to provide the most accurate and helpful response — and explicitly indicate that your answer is based on general knowledge rather than the provided context.
2. Response Style: Deliver concise, clear, and precise answers tailored to the user's query. Avoid unnecessary elaboration unless requested.
3. Tone and Approach: Maintain a professional, friendly, and approachable tone. Adapt to the user's level of expertise based on the query.
4. Structure: Organize responses logically, using bullet points, numbered lists, or paragraphs as appropriate for clarity.
5. Accuracy and Relevance: Ensure all information is accurate, relevant, and directly addresses the user's intent.

<context>
${context}
</context>
  `;
};
