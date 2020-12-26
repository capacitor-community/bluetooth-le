import { assert, describe, expectError, it, sleep } from './testRunner';

export async function testRunner() {
  await describe('Custom test runner', async () => {
    await it('should show error on false', async () => {
      assert(false);
    });

    await it('should not show error on true', () => {
      assert(true);
    });

    await it('should wait for async code', async () => {
      await sleep(500);
      assert(true);
    });

    await it('should wait for async code then detect false', async () => {
      await sleep(500);
      assert(false);
    });

    await it('should catch errors', async () => {
      const test = async () => {
        throw new Error('some message');
      };
      await expectError(test);
      await expectError(test, 'some message');
      await expectError(test, 'some other message');

      const test2 = () => {
        // I don't throw
      };
      await expectError(test2);
    });

    await it('should show uncaught errors', async () => {
      const test = async () => {
        throw new Error('some message');
      };
      await test();
      await assert(true);
    });
  });
}
