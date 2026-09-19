export async function copyText(text: string): Promise<void> {
  if (!globalThis.navigator?.clipboard?.writeText)
    throw new Error(
      "Clipboard access is unavailable. Select the text and copy it manually.",
    );
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new Error("Could not copy. Select the text and copy it manually.");
  }
}
