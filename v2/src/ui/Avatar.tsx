/** Initials avatar (reusable). Deterministic hue from the name. */
export function Avatar({
  firstName,
  lastName,
  size = 3.6,
}: {
  firstName: string;
  lastName: string;
  size?: number; // rem
}) {
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  let h = 0;
  for (const ch of `${firstName}${lastName}`) h = (h * 31 + ch.charCodeAt(0)) % 360;

  return (
    <span
      className="avatar"
      aria-hidden
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        fontSize: `${size * 0.38}rem`,
        background: `hsl(${h} 65% 42%)`,
      }}
    >
      {initials}
    </span>
  );
}
