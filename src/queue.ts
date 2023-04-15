type Queue = <T>(fn: () => Promise<T>) => Promise<T>;

const makeQueue = (): Queue => {
  let currentTask: Promise<unknown> = Promise.resolve();
  // create a new promise so that errors can be bubbled
  // up to the caller without being caught by the queue
  return (fn) =>
    new Promise((resolve, reject) => {
      currentTask = currentTask
        .then(() => fn())
        .then(resolve)
        .catch(reject);
    });
};

export function getQueue(enabled: boolean): Queue {
  if (enabled) {
    return makeQueue();
  }
  return (fn) => fn();
}
