export interface Progress {
  /** How many are finished. */
  done: number;
  total: number;
  /** The one being worked on. */
  current: string;
}

/** Runs `step` for each name in turn and reports where it is. One that throws becomes `failed(name, message)` and the rest still run. */
export async function inSequence<T>(names: string[], step: (name: string) => Promise<T[]>, failed: (name: string, error: string) => T, onProgress: (progress: Progress | null) => void): Promise<T[]> {
  const results: T[] = [];
  try {
    for (const [done, name] of names.entries()) {
      onProgress({ done, total: names.length, current: name });
      try {
        results.push(...(await step(name)));
      } catch (error) {
        results.push(failed(name, error instanceof Error ? error.message : String(error)));
      }
    }
  } finally {
    onProgress(null);
  }
  return results;
}
