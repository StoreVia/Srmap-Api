"use client";
import { useEffect, useState } from "react";

const REPOSITORY_URL = "https://github.com/StoreVia/Srmap-Api";

type RepositoryStats = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
};

const GitHubMark = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.02c0 4.428 2.865 8.184 6.839 9.51.5.093.682-.217.682-.483 0-.237-.009-.868-.014-1.704-2.782.605-3.369-1.342-3.369-1.342-.455-1.158-1.11-1.467-1.11-1.467-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.531 2.341 1.089 2.91.833.091-.647.349-1.089.635-1.34-2.22-.253-4.555-1.112-4.555-4.946 0-1.092.39-1.985 1.029-2.685-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.748-1.026 2.748-1.026.546 1.377.203 2.394.1 2.647.64.7 1.028 1.593 1.028 2.685 0 3.843-2.339 4.69-4.566 4.938.359.31.678.921.678 1.855 0 1.34-.012 2.421-.012 2.75 0 .269.18.581.688.482A10.02 10.02 0 0022 12.02C22 6.486 17.523 2 12 2Z" clipRule="evenodd" />
  </svg>
);

const Star = () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>;
const Fork = () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="6" cy="4" r="2" /><circle cx="18" cy="20" r="2" /><circle cx="6" cy="20" r="2" /><path d="M6 6v12M18 18v-3a4 4 0 0 0-4-4H6" /></svg>;
const ArrowUpRight = () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>;

export default function GitHubPage() {
  const [stats, setStats] = useState<RepositoryStats | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/StoreVia/Srmap-Api")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const statItems = [
    { label: "Stars", value: stats?.stargazers_count, icon: <Star /> },
    { label: "Forks", value: stats?.forks_count, icon: <Fork /> },
    { label: "Open issues", value: stats?.open_issues_count, icon: <span className="text-lg font-bold">#</span> },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:p-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg"><GitHubMark className="h-7 w-7" /></div>
          <p className="text-sm font-medium text-blue-200">Open source</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Help build Srmapi</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">Srmapi is built in the open. Report a bug, suggest an improvement, improve the UI, or contribute code to make the student portal better for everyone.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"><GitHubMark className="h-4 w-4" />View repository <ArrowUpRight /></a>
            <a href={`${REPOSITORY_URL}/issues`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Open an issue <ArrowUpRight /></a>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statItems.map((item) => <div key={item.label} className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex items-center gap-2 text-muted-foreground">{item.icon}<span className="text-sm">{item.label}</span></div><p className="mt-3 text-3xl font-bold tabular-nums">{typeof item.value === "number" ? item.value.toLocaleString() : "—"}</p></div>)}
      </section>

      <section className="rounded-2xl border bg-card p-6 sm:p-8">
        <h3 className="text-xl font-semibold">Want to contribute?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Start with an issue or discussion, fork the repository, make your change, and open a pull request. Small fixes, documentation improvements, and accessibility work are all valuable contributions.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Browse issues", "Fork the project", "Open a pull request"].map((step, index) => <div key={step} className="rounded-lg bg-muted/60 p-4"><span className="text-xs font-semibold text-primary">0{index + 1}</span><p className="mt-1 text-sm font-medium">{step}</p></div>)}
        </div>
      </section>
    </div>
  );
}