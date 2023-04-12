const makeQueue = (): (<T>(fn: () => Promise<T>) => Promise<T>) => {
  let currentTask: Promise<unknown> = Promise.resolve();
  return (fn) => {
    const task = currentTask.then(() => fn());
    currentTask = task;
    return task;
  };
};

type Queue = <T>(fn: () => Promise<T>) => Promise<T>;

export function getQueue(enabled: boolean): Queue {
  if (enabled) return makeQueue();
  return (fn) => fn();
}
