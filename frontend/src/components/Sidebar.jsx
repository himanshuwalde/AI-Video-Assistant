import { Plus, Trash2, X, Film } from "lucide-react";

function when(ts) {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Sidebar({ jobs, activeId, online, open, onNew, onSelect, onDelete, onClose }) {
  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Video Assistant</span>
          <button className="icon-btn close-nav" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <button className="btn new" onClick={onNew}>
          <Plus size={16} /> New analysis
        </button>

        <div className="side-title">Sessions</div>
        <nav className="session-list">
          {jobs.length === 0 && <p className="side-empty">Videos you process appear here until the server restarts.</p>}
          {jobs.map((j) => (
            <div key={j.id} className={`session ${j.id === activeId ? "active" : ""}`}>
              <button className="session-main" onClick={() => onSelect(j.id)}>
                <Film size={15} />
                <span className="session-text">
                  <span className="session-title">{j.title || j.source_label}</span>
                  <span className="session-meta">
                    {j.status === "done" ? "Ready" : j.status === "error" ? "Failed" : "Processing"} · {when(j.created_at)}
                  </span>
                </span>
                {(j.status === "running" || j.status === "queued") && <span className="pulse-dot" />}
              </button>
              <button className="icon-btn del" onClick={() => onDelete(j.id)} aria-label="Delete session">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </nav>

        <div className="side-foot">
          <span className={`status-dot ${online ? "on" : "off"}`} />
          {online ? "API connected" : "API offline"}
        </div>
      </aside>
    </>
  );
}
