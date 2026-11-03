export function formatRole(value: unknown): string {
  let roleName = "";

  if (typeof value === "string") {
    roleName = value;
  } else if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  ) {
    roleName = value.name;
  }

  return roleName
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
