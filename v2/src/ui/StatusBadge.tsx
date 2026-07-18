/**
 * Colored badge for reference-data values (status/priority/category). Uses the
 * row's stored hex color as a soft tint so it works in light and dark themes.
 */
export function StatusBadge({
  name,
  color,
}: {
  name: string;
  color?: string | null;
}) {
  if (!color) return <span className="badge">{name}</span>;
  return (
    <span
      className="badge"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {name}
    </span>
  );
}
