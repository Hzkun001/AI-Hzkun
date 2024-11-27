import { useState } from "react";
import './App.css';
import { requestToGroqAI } from "./utils/groq";
import { Light as SyntaxHighLight } from "react-syntax-highlighter";
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

function App() {
  const [data, setData] = useState(""); // Untuk menyimpan respons AI
  const [language, setLanguage] = useState("id"); // Default bahasa Indonesia

  const handleSubmit = async () => {
    const content = document.getElementById("content").value;
    if (content.trim() === "") {
      alert("Input tidak boleh kosong!");
      return;
    }

    // Kirim permintaan ke API dengan bahasa yang dipilih
    const ai = await requestToGroqAI(content, language);
    setData(ai);
  };

  // Tangkap tombol Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Hindari perilaku default (misal submit form)
      handleSubmit();
    }
  };

  return (
    <main className="flex flex-col min-h-[80vh] justify-center items-center max-w-4xl w-full mx-auto">
      <h1 className="text-4xl text-amber-500 font-bold">Hzkun AI</h1>
      <p className="text-md py-2 px-4 text-white font-bold underline underline-offset-4 decoration-amber-500">
        Awesome Fast AI for Programmer.
      </p>

      {/* Form input */}
      <form className="flex flex-col gap-4 py-4 w-full px-4">
        {/* Dropdown untuk memilih bahasa */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="py-1 px-2 text-md rounded-md bg-gray-100 w-1/3 self-start"
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
          <option value="ja">日本語 (Jepang)</option>
          <option value="zh">中文 (China)</option>
          <option value="ru">Русский (Rusia)</option>
          <option value="hi">हिन्दी (India)</option>
        </select>

        {/* Input teks */}
        <input
          placeholder="Ketik permintaan di sini..."
          className="py-2 px-4 text-md rounded-md w-full"
          id="content"
          type="text"
          onKeyDown={handleKeyDown} // Tambahkan handler untuk menangkap tombol Enter
        />

        {/* Tombol Kirim */}
        <button
          onClick={handleSubmit}
          type="button"
          className="bg-amber-500 py-2 px-4 font-bold text-white rounded-md"
        >
          Kirim
        </button>
      </form>

      {/* Hasil respons */}
      <div className="max-w-4xl w-full mx-auto ">
        {data ? (
          <SyntaxHighLight
            language="swift"
            style={darcula}
            wrapLongLines={true}
            customStyle={{
              width: "100%",
              maxWidth: "900px",
              margin: "auto",
            }}
          >
            {data}
          </SyntaxHighLight>
        ) : null}
      </div>
    </main>
  );
}

export default App;
