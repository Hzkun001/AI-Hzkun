import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

/**
 * Tombol copy untuk code block
 */
function CopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy gagal:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-btn flex items-center gap-1 text-[11px] text-gray-300 px-2 py-1 rounded-md border border-white/10 bg-white/5"
      title="Salin kode"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Tersalin
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Salin
        </>
      )}
    </button>
  );
}

/**
 * Render konten pesan AI sebagai Markdown:
 * - Heading, bold, italic, list, link, table
 * - Code block dengan syntax highlighter & deteksi bahasa otomatis
 * - Inline code dengan styling
 */
export default function MessageContent({ content }) {
  return (
    <div className="markdown-body p-4 sm:p-5 text-[14px] sm:text-[15px] leading-relaxed text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code block & inline code
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            // Inline code
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[0.875em] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Code block dengan deteksi bahasa
            const language = match ? match[1] : "text";

            return (
              <div className="my-3 rounded-lg overflow-hidden border border-white/10 bg-[#1e1e2e]">
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wide">
                    {language}
                  </span>
                  <CopyCodeButton code={codeString} />
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  PreTag="div"
                  wrapLongLines={true}
                  customStyle={{
                    margin: 0,
                    padding: "12px 16px",
                    background: "transparent",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                  codeTagProps={{
                    style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Paragraf
          p: ({ children }) => <p className="my-2">{children}</p>,

          // Headings
          h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-amber-300">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 text-amber-300">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1 text-amber-200">{children}</h3>,

          // Lists
          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-200">{children}</li>,

          // Bold & italic
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-200">{children}</em>,

          // Link
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300 transition-colors"
            >
              {children}
            </a>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-500 pl-4 my-2 italic text-gray-300">
              {children}
            </blockquote>
          ),

          // Table
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-white/10 rounded-md text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left border border-white/10 font-semibold text-amber-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border border-white/10 text-gray-200">{children}</td>
          ),

          // Horizontal rule
          hr: () => <hr className="my-4 border-white/10" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
