import { Groq } from "groq-sdk";

const GROQ_API = import.meta.env.VITE_GROQ;
const groq = new Groq({
  apiKey: GROQ_API,
  dangerouslyAllowBrowser: true,
});

// Model production terbaru di Groq
// Lihat: https://console.groq.com/docs/models
export const AVAILABLE_MODELS = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    description: "Paling pintar - untuk reasoning & coding kompleks",
    badge: "🚀 Recommended",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    description: "Cepat & hemat - cocok untuk tanya jawab ringan",
    badge: "⚡ Fast",
  },
];

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const requestToGroqAI = async (
  content,
  language,
  model = DEFAULT_MODEL,
  history = []
) => {
  const languageMap = {
    id: "Please respond in Indonesian.",
    ja: "Please respond in Japanese.",
    zh: "Please respond in Chinese.",
    ru: "Please respond in Russian.",
    hi: "Please respond in Hindi.",
    ar: "Please respond in Arabic.",
    en: "Please respond in English.",
    default: "Please respond in English.",
  };

  const languageInstruction = languageMap[language] || languageMap.default;

  // System prompt: instruksi bahasa + format markdown
  const systemPrompt = `You are Hzkun AI, a helpful assistant for programmers created by Hafidz (Hzkun).
${languageInstruction}
Format your responses using markdown. When showing code, ALWAYS wrap it in fenced code blocks with the proper language tag, e.g. \`\`\`python, \`\`\`javascript, \`\`\`jsx, \`\`\`bash, etc.
Be concise but clear.`;

  // Bangun array pesan: system + history + pesan baru
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content },
  ];

  try {
    const reply = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
      max_tokens: 2048,
    });

    let aiResponse = reply.choices[0].message.content;

    // Override jawaban untuk pertanyaan tentang pemilik AI
    const lower = content.toLowerCase();
    if (
      lower.includes("siapa pemilik ai ini") ||
      lower.includes("siapa yang membuat ai ini") ||
      lower.includes("siapa pembuat ai ini")
    ) {
      aiResponse = "Pemilik AI ini adalah **Hafidz**, dengan inisial _Hzkun_. 👑";
    } else if (lower.includes("ceritakan lebih lengkap tentang pemilik")) {
      aiResponse =
        "Dia adalah **Hafidz**, sebagai developer AI ini, dia sering disebut _Hzkun_.";
    } else if (
      lower.includes("siapa dia") ||
      lower.includes("data pribadinya") ||
      lower.includes("apakah kamu tahu hafidz lebih detail")
    ) {
      aiResponse = "Maaf Tuan, kami tidak mengizinkan anda memaparkan data dirinya. 🙏";
    }

    return aiResponse;
  } catch (error) {
    console.error("Error fetching response from Groq AI:", error);

    // Pesan error yang lebih jelas untuk user
    const status = error?.status || error?.response?.status;
    if (status === 401) {
      throw new Error(
        "API Key tidak valid. Pastikan VITE_GROQ sudah di-set dengan benar di file .env (lokal) atau di Environment Variables (Vercel)."
      );
    }
    if (status === 429) {
      throw new Error(
        "Rate limit tercapai. Coba lagi sebentar atau ganti ke model yang lebih ringan."
      );
    }
    if (status === 404 || error?.message?.includes("model")) {
      throw new Error(
        `Model "${model}" tidak ditemukan atau sudah deprecated. Coba pilih model lain.`
      );
    }

    throw new Error(
      error?.message || "Tidak bisa memproses permintaan Anda saat ini."
    );
  }
};
