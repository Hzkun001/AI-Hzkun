import { Groq } from "groq-sdk";

const GROQ_API = import.meta.env.VITE_GROQ;
const groq = new Groq({
  apiKey: GROQ_API,
  dangerouslyAllowBrowser: true,
});

export const requestToGroqAI = async (content, language) => {
    let languageInstruction = "";
  
    switch (language) {
      case "id":
        languageInstruction = "Please respond in Indonesian.";
        break;
      case "ja":
        languageInstruction = "Please respond in Japanese.";
        break;
      case "zh":
        languageInstruction = "Please respond in Chinese.";
        break;
      case "ru":
        languageInstruction = "Please respond in Russian.";
        break;
      case "hi":
        languageInstruction = "Please respond in Hindi.";
        break;
      default:
        languageInstruction = "Please respond in English.";
    }
  
    const prompt = languageInstruction + " " + content;
  
    const reply = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
    });
  
    return reply.choices[0].message.content;
  };
  
