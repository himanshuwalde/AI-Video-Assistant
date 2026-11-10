import { useState } from "react";
import { Sparkles, ListChecks, Scale, HelpCircle, ScrollText, Copy, Check, Download } from "lucide-react";
import Markdown from "./Markdown.jsx";
import Chat from "./Chat.jsx";

const TABS = [
  { id: "summary", label: "Summary", icon: Sparkles, key: "summary" },
  { id: "actions", label: "Action items", icon: ListChecks, key: "action_items" },
  { id: "decisions", label: "Decisions", icon: Scale, key: "key_decisions" },
  { id: "questions", label: "Open questions", icon: HelpCircle, key: "open_questions" },
  { id: "transcript", label: "Transcript", icon: ScrollText, key: "transcript" },
];

function exportMarkdown(r) {
  return (
    `# ${r.title}\n\n## Summary\n${r.summary}\n\n## Action items\n${r.action_items}\n\n` +
    `## Key decisions\n${r.key_decisions}\n\n## Open questions\n${r.open_questions}\n\n## Transcript\n${r.transcript}\n`
  );
}

export default function Results({ job }) {
  const r = job.result;
  const [tab, setTab] = useState("summary");
  const [copied, setCopied] = useState(false);
  const active = TABS.find((t) => t.id === tab);
  const body = r[active.key];

  const copy = async () => {
    await navigator.clipboard.writeText(body || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const download = () => {
    const blob = new Blob([exportMarkdown(r)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(r.title || "meeting").replace(/[^\w\- ]+/g, "").trim() || "meeting"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="results">
      <div className="results-main">
        <header className="res-head">
          <div>
            <h1 className="res-title">{r.title}</h1>
            <p className="res-sub">{job.source_label}</p>
          </div>
          <button className="btn ghost" onClick={download}>
            <Download size={15} /> Export .md
          </button>
        </header>

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <article className="card panel">
          <button className="icon-btn copy" onClick={copy} aria-label="Copy this section">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          {tab === "transcript" ? <p className="transcript">{body}</p> : <Markdown>{body}</Markdown>}
        </article>
      </div>

      <Chat jobId={job.id} />
    </section>
  );
}
