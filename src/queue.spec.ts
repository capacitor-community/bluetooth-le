import { getQueue } from './queue';

async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

describe('queue', () => {
  let sequenceOfEvents: string[] = [];

  const job = (name: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      sequenceOfEvents.push(`${name} started`);
      setTimeout(() => {
        sequenceOfEvents.push(`${name} done`);
        resolve();
      }, 50);
    });
  };

  beforeEach(() => {
    sequenceOfEvents = [];
  });

  it('should run jobs in parallel without queue', async () => {
    const queue = getQueue(false);
    await Promise.all([queue(() => job('a')), queue(() => job('b'))]);
    expect(sequenceOfEvents).toEqual(['a started', 'b started', 'a done', 'b done']);
  });

  it('should run jobs in sequence with queue', async () => {
    const queue = getQueue(true);
    await Promise.all([queue(() => job('a')), queue(() => job('b')), queue(() => job('c'))]);
    expect(sequenceOfEvents).toEqual(['a started', 'a done', 'b started', 'b done', 'c started', 'c done']);
  });

  it('should bubble up promise rejections without breaking the queue', async () => {
    expect.assertions(2);
    const queue = getQueue(true);
    try {
      await Promise.all([
        queue(() => job('a')),
        queue(() => {
          return Promise.reject('failed');
        }),
        queue(() => job('c')),
      ]);
    } catch (error) {
      expect(error).toEqual('failed');
    }
    await sleep(50);
    expect(sequenceOfEvents).toEqual(['a started', 'a done', 'c started', 'c done']);
  });

  it('should bubble up errors without breaking the queue', async () => {
    expect.assertions(2);
    const queue = getQueue(true);
    try {
      await Promise.all([
        queue(() => job('a')),
        queue(async () => {
          throw new Error('failed');
        }),
        queue(() => job('c')),
      ]);
    } catch (error) {
      expect((error as Error).message).toEqual('failed');
    }
    await sleep(50);
    expect(sequenceOfEvents).toEqual(['a started', 'a done', 'c started', 'c done']);
  });
});
