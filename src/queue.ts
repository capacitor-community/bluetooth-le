import throat from 'throat';

type Queue = <T>(fn: () => Promise<T>) => Promise<T>;

export function getQueue(enabled: boolean): Queue {
  if (enabled) {
    return throat(1);
  } else {
    return fn => fn();
  }
}
