import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Menu } from "lucide-react";
import { api } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./components/Home.jsx";
import Processing from "./components/Processing.jsx";
import Results from "./components/Results.jsx";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [job, setJob] = useState(null);
  const [online, setOnline] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  const refreshJobs = useCallback(async () => {
    try {
      setJobs(await api.listJobs());
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    refreshJobs();
    const t = setInterval(refreshJobs, 4000);
    return () => clearInterval(t);
  }, [refreshJobs]);

  // Poll the open job until it finishes.
  useEffect(() => {
    setJob(null);
    if (!activeId) return;
    let stopped = false;
    let timer;
    const tick = async () => {
      try {
        const j = await api.getJob(activeId);
        if (stopped) return;
        setJob(j);
        if (j.status === "queued" || j.status === "running") timer = setTimeout(tick, 1500);
        else refreshJobs();
      } catch (e) {
        if (stopped) return;
        if (e.status === 404) setActiveId(null); // server restarted, session is gone
        else timer = setTimeout(tick, 3000);
      }
    };
    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [activeId, refreshJobs]);

  const open = (id) => {
    setActiveId(id);
    setNavOpen(false);
  };

  const remove = async (id) => {
    try {
      await api.deleteJob(id);
    } catch {}
    if (id === activeId) setActiveId(null);
    refreshJobs();
  };

  let main;
  if (!activeId) main = <Home onCreated={open} />;
  else if (!job) main = <div className="center-note">Loading session…</div>;
  else if (job.status === "error")
    main = (
      <div className="center-note error-state">
        <AlertTriangle size={22} />
        <h2>This video couldn't be processed</h2>
        <p className="mono-error">{job.error}</p>
        <button className="btn primary" onClick={() => setActiveId(null)}>
          Try another video
        </button>
      </div>
    );
  else if (job.status !== "done") main = <Processing job={job} />;
  else main = <Results key={job.id} job={job} />;

  return (
    <div className="shell">
      <Sidebar
        jobs={jobs}
        activeId={activeId}
        online={online}
        open={navOpen}
        onNew={() => open(null)}
        onSelect={open}
        onDelete={remove}
        onClose={() => setNavOpen(false)}
      />
      <main className="main">
        <button className="menu-btn" onClick={() => setNavOpen(true)} aria-label="Open sessions">
          <Menu size={20} />
        </button>
        {!online && (
          <div className="banner">
            Can't reach the API. Start it with <code>uvicorn server:app --port 8000</code>.
          </div>
        )}
        {main}
      </main>
    </div>
  );
}
