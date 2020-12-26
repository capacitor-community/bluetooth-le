// import { testRunner } from './runner.test';
import { testBleClient } from './bleClient.test';
import { testMultipleDevices } from './multipleDevices.test';
import { printResult, beforeAll } from './testRunner';

export async function runTests() {
  await beforeAll();
  // await testRunner();
  await testBleClient();
  await testMultipleDevices();
  await printResult();
}
