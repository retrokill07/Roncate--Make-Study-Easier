
import { SyllabusItem, Exam, AIStudyAdvice } from "../types";

// We use the standard fetch API for OpenRouter, so no external SDK is needed.
// The key must be in .env as REACT_APP_API_KEY
const API_KEY = process.env.REACT_APP_API_KEY;

export const generateStudyStrategy = async (
  syllabus: SyllabusItem[],
  exams: Exam[]
): Promise<AIStudyAdvice> => {
  if (!API_KEY) {
    return {
      message: "API Key missing. Please add REACT_APP_API_KEY to your .env file.",
      priorityTopics: [],
      generatedAt: Date.now()
    };
  }

  const incompleteTopics = syllabus.filter(s => !s.completed).map(s => `${s.topic} (${s.difficulty})`);
  const upcomingExams = exams.map(e => `${e.title} on ${e.date}`);

  const prompt = `
    You are an expert academic study coach. Analyze the student's data and provide a strategy.
    
    Student Data:
    Incomplete Topics: ${incompleteTopics.length > 0 ? incompleteTopics.join(', ') : "None recorded"}
    Upcoming Exams: ${upcomingExams.length > 0 ? upcomingExams.join(', ') : "None scheduled"}

    RESPONSE FORMAT:
    You must respond with valid JSON only. Do not add markdown formatting or text outside the JSON.
    Structure:
    {
      "message": "Motivational advice and brief strategy (max 50 words)",
      "priorityTopics": ["Topic 1", "Topic 2", "Topic 3"]
    }
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
        "X-Title": "Roncate"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct",
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "temperature": 0.7,
        "max_tokens": 500
      })
    });

    const data = await response.json();
    
    if (data.error) {
       throw new Error(data.error.message);
    }

    const content = data.choices[0].message.content;
    
    // Clean up potential markdown code blocks if Llama adds them
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    return {
      message: result.message || "Keep studying consistently!",
      priorityTopics: result.priorityTopics || [],
      generatedAt: Date.now()
    };

  } catch (error) {
    console.error("AI API Error:", error);
    return {
      message: "Unable to generate study plan. Please check your network or OpenRouter API key.",
      generatedAt: Date.now(),
      priorityTopics: []
    };
  }
};

export const parseSyllabusFromText = async (text: string, subjectId: string): Promise<Partial<SyllabusItem>[]> => {
  if (!API_KEY) return [];

  const prompt = `
    Extract syllabus topics from the following text. Assign a difficulty (Easy, Medium, Hard) to each based on complexity.
    
    TEXT: "${text.substring(0, 1000)}"

    You MUST follow these rules:
- Return ONLY a JSON array
- Do NOT include any explanation
- Do NOT include markdown or backticks
- Do NOT include text before or after the JSON
    [
      { "topic": "Topic Name", "difficulty": "Medium" }
    ]
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Roncate"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct",
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "temperature": 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Parsing Error:", error);
    return [];
  }
};
