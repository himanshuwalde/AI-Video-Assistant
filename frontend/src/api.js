const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail || detail;
    } catch {}
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  listJobs: () => request("/jobs"),
  getJob: (id) => request(`/jobs/${id}`),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),
  createJob: ({ url, file, language }) => {
    const form = new FormData();
    form.append("language", language);
    if (file) form.append("file", file);
    else form.append("url", url);
    return request("/jobs", { method: "POST", body: form });
  },
  chat: (id, question) =>
    request(`/jobs/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }),
};
