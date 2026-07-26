import "../shared/page.css";
import "./Placeholder.css";

interface PlaceholderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function Placeholder({ eyebrow, title, subtitle }: PlaceholderProps) {
  return (
    <section className="page">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{subtitle}</p>
      <div className="card placeholder-card">
        <p>This section is under construction — check back soon.</p>
      </div>
    </section>
  );
}
