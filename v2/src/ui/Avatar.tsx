/* eslint-disable @next/next/no-img-element -- avatar src is a same-origin
   presigned redirect; next/image optimization would break the auth cookie. */
/** Initials avatar (reusable); renders the profile picture when one exists. */
export function Avatar({
  firstName,
  lastName,
  src,
  size = 3.6,
}: {
  firstName: string;
  lastName: string;
  /** Optional image URL (e.g. /api/profile/picture). */
  src?: string | null;
  size?: number; // rem
}) {
  if (src) {
    return (
      <img
        className="avatar avatar--img"
        src={src}
        alt=""
        style={{ width: `${size}rem`, height: `${size}rem` }}
      />
    );
  }
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
