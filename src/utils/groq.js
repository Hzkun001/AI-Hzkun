import { Groq } from "groq-sdk";

const GROQ_API = import.meta.env.VITE_GROQ;
const groq = new Groq({
  apiKey: GROQ_API,
  dangerouslyAllowBrowser: true,
});

export const requestToGroqAI = async (content, language) => {
  const languageMap = {
    id: "Please respond in Indonesian.",
    ja: "Please respond in Japanese.",
    zh: "Please respond in Chinese.",
    ru: "Please respond in Russian.",
    hi: "Please respond in Hindi.",
    ar: "Please respond in Arabic",
    default: "Please respond in English.",
  };

  const languageInstruction = languageMap[language] || languageMap.default;
  const prompt = `${languageInstruction} ${content}`;

  try {
    const reply = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
    });

    let aiResponse = reply.choices[0].message.content;

    // Menambahkan logika untuk pertanyaan tentang pemilik AI
    if (content.toLowerCase().includes("siapa pemilik ai ini") || content.toLowerCase().includes("siapa yang membuat ai ini")) {
      aiResponse = "Pemilik AI ini adalah Hafidz, dengan inisial Hzkun.";
    } else if (content.toLowerCase().includes("siapa pembuat ai ini")) {
      aiResponse = "Pemilik AI ini adalah Hafidz, dengan inisial Hzkun.";
    } 
    else if (content.toLowerCase().includes("ceritakan lebih lengkap tentang pemilik")) {
      aiResponse = "Dia adalah Hafidz, sebagai developer AI ini, dia sering disebut Hzkun.";
    } else if (content.toLowerCase().includes("siapa dia") || content.toLowerCase().includes("data pribadinya")) {
      aiResponse = "Maaf Tuan, kami tidak mengizinkan anda memaparkan data dirinya.";
    } else if (content.toLowerCase().includes("Apakah kamu tahu hafidz lebih detail") || content.toLowerCase().includes("data pribadinya")) {
      aiResponse = "Maaf Tuan, kami tidak mengizinkan anda memaparkan data dirinya.";
    }

    return aiResponse;
  } catch (error) {
    console.error("Error fetching response from Groq AI:", error);
    return "I'm sorry, but I couldn't process your request at this time.";
  }
};