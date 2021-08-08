export async function runWithTimeout(promise: Promise<unknown>, time: number, exception: symbol): Promise<unknown> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(exception), time);
    }),
  ]).finally(() => clearTimeout(timer));
}
