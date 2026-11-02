export function formatRole(value: unknown): string {
  if (typeof value === "object" && value !== null && "name" in value) {
    return (value as { name: string }).name
      .toLowerCase()
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return "";
}
