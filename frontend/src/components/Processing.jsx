import { Check } from "lucide-react";

export default function Processing({ job }) {
  const { stages, stage_index: current, status } = job;
  const queued = status === "queued";

  return (
    <section className="processing">
      <h1 className="page-title">{queued ? "Waiting for the previous video to finish" : "Analyzing your video"}</h1>
      <p className="lede small">{job.source_label}</p>
      <p className="lede small dim">Long recordings take a while: transcription runs in 10-minute chunks. You can leave this page; the session stays in the sidebar.</p>

      <ol className="steps">
        {stages.map((s, i) => {
          const state = queued ? "todo" : i < current ? "done" : i === current ? "active" : "todo";
          return (
            <li key={s.key} className={`step ${state}`}>
              <span className="step-icon">{state === "done" ? <Check size={14} /> : state === "active" ? <span className="spinner" /> : null}</span>
              <span>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
