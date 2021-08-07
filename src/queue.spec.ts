import { getQueue } from './queue';

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
    await Promise.all([queue(() => job('a')), queue(() => job('b'))]);
    expect(sequenceOfEvents).toEqual(['a started', 'a done', 'b started', 'b done']);
  });
});
