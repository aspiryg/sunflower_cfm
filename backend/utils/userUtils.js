export function getUserFullName(firstName, lastName) {
  if (!firstName && !lastName) return "";
  return `${firstName || ""} ${lastName || ""}`.trim();
}
