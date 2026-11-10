import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { api } from "../api.js";
import Markdown from "./Markdown.jsx";

const SUGGESTIONS = ["What were the main topics?", "Who is responsible for what?", "Were any deadlines mentioned?"];

export default function Chat({ jobId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (q) => {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    setText("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const { answer } = await api.chat(jobId, question);
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "ai", text: e.message, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="chat">
      <div className="chat-head">
        <h2>Ask this video</h2>
        <p>Answers come only from the transcript.</p>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <div className="suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role} ${m.error ? "err" : ""}`}>
            {m.role === "ai" && !m.error ? <Markdown>{m.text}</Markdown> : m.text}
          </div>
        ))}
        {busy && (
          <div className="msg ai typing">
            <i />
            <i />
            <i />
          </div>
        )}
        <div ref={end} />
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about the video…" />
        <button className="send" disabled={!text.trim() || busy} aria-label="Send">
          <SendHorizontal size={16} />
        </button>
      </form>
    </aside>
  );
}
