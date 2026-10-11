import { createClient } from "../../lib/supabase/server";
import Link from "next/link";

export default async function AilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <main className="shell"><section className="panel narrow"><h1 className="title">AIL Hunter</h1><p className="muted">Sign in to access your security workspace.</p><Link className="btn primary" href="/login">Sign in</Link></section></main>;
  }

  const { data: reports, error } = await supabase
    .from("ail_threat_reports")
    .select("id,severity,title,summary,source,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">SOLVIX · AIL HUNTER</p>
        <h1 className="title">Threat intelligence workspace.</h1>
        <p className="muted">Review sanitized security findings and investigation notes. This page does not scan systems by itself and does not store raw credentials or secret tokens.</p>
        <div className="card" style={{ marginTop: 24 }}>
          <p className="eyebrow">REPORT FEED</p>
          {error ? (
            <p className="muted">Report storage is not ready yet. Apply the dual-core database migration to enable this feed.</p>
          ) : reports?.length ? (
            <div className="stack" style={{ marginTop: 16 }}>
              {reports.map((report) => (
                <article className="card" key={report.id}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                    <strong>{report.title}</strong>
                    <span className="eyebrow">{report.severity.toUpperCase()}</span>
                  </div>
                  <p className="muted" style={{ marginTop: 8 }}>{report.summary}</p>
                  <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                    {(report.source || "Unspecified source")} · {new Date(report.created_at).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 12 }}>No stored reports yet. No threat status is inferred when the feed is empty.</p>
          )}
        </div>
        <div className="row" style={{ marginTop: 20, gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/dashboard">Back to dashboard</Link>
          <Link className="btn" href="/billing?vertical=AIL">Manage access</Link>
        </div>
      </section>
    </main>
  );
}
