"use client";

export function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function areTagsEqual(
  prevTags: { id: string }[],
  nextTags: { id: string }[],
): boolean {
  if (prevTags.length !== nextTags.length) return false;
  return prevTags.every((tag, index) => tag.id === nextTags[index]?.id);
}
