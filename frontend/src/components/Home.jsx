import { useRef, useState } from "react";
import { Link2, UploadCloud, ArrowRight, FileAudio } from "lucide-react";
import { api } from "../api.js";

const LANGS = [
  { id: "english", name: "English", note: "Whisper, runs locally" },
  { id: "hinglish", name: "Hinglish", note: "Sarvam, translated to English" },
];

export default function Home({ onCreated }) {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("english");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  const ready = mode === "url" ? /^https?:\/\//i.test(url.trim()) : !!file;

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const { id } = await api.createJob({
        url: mode === "url" ? url.trim() : null,
        file: mode === "file" ? file : null,
        language,
      });
      onCreated(id);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <section className="home">
      <h1 className="hero">
        Every meeting,
        <br />
        searchable.
      </h1>
      <p className="lede">
        Paste a YouTube link or upload a recording. You get a transcript, a summary, action items, decisions and open
        questions, then you can ask it anything.
      </p>

      <form className="card compose" onSubmit={submit}>
        <div className="seg" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "url"} className={mode === "url" ? "on" : ""} onClick={() => setMode("url")}>
            <Link2 size={15} /> YouTube link
          </button>
          <button type="button" role="tab" aria-selected={mode === "file"} className={mode === "file" ? "on" : ""} onClick={() => setMode("file")}>
            <UploadCloud size={15} /> Upload file
          </button>
        </div>

        {mode === "url" ? (
          <input
            className="field"
            type="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
        ) : (
          <div
            className={`drop ${drag ? "drag" : ""} ${file ? "has" : ""}`}
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
          >
            <input ref={input} type="file" accept="audio/*,video/*" hidden onChange={(e) => setFile(e.target.files[0] || null)} />
            {file ? (
              <>
                <FileAudio size={20} />
                <strong>{file.name}</strong>
                <span>{(file.size / 1024 / 1024).toFixed(1)} MB · click to replace</span>
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                <strong>Drop an audio or video file</strong>
                <span>or click to browse</span>
              </>
            )}
          </div>
        )}

        <div className="lang-row">
          <span className="label">Spoken language</span>
          <div className="lang-opts">
            {LANGS.map((l) => (
              <button type="button" key={l.id} className={`lang ${language === l.id ? "on" : ""}`} onClick={() => setLanguage(l.id)}>
                <span>{l.name}</span>
                <small>{l.note}</small>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn primary wide" disabled={!ready || busy}>
          {busy ? "Starting…" : "Analyze video"} {!busy && <ArrowRight size={16} />}
        </button>
      </form>
    </section>
  );
}
