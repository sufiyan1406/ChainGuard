let introDone = false;
const introDoneListeners = new Set<() => void>();

export function isIntroDone(): boolean {
  return introDone;
}

export function onIntroDone(cb: () => void): () => void {
  if (introDone) {
    cb();
    return () => {};
  }
  introDoneListeners.add(cb);
  return () => {
    introDoneListeners.delete(cb);
  };
}

export function markIntroDone(): void {
  introDone = true;
  introDoneListeners.forEach((cb) => cb());
  introDoneListeners.clear();
}
