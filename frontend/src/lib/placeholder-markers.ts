// Shared check for unresolved placeholder markers left in content strings —
// used to hide a value in production rather than ship it to real visitors.
export function hasPlaceholderMarker(value: string): boolean {
  return value.includes("[TBD]") || value.includes("[VERIFY]");
}
