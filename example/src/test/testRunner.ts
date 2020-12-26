import { alertController, loadingController } from '@ionic/core';

const initialState = {
  suites: {
    total: 0,
    passed: 0,
  },
  tests: {
    total: 0,
    passed: 0,
  },
  assertions: {
    total: 0,
    passed: 0,
  },
  currentSuite: {
    name: '',
    tests: {
      total: 0,
      passed: 0,
    },
  },
  currentTest: {
    name: '',
    assertions: {
      total: 0,
      passed: 0,
    },
  },
  startTime: 0,
};

let state: typeof initialState;

export async function beforeAll() {
  state = JSON.parse(JSON.stringify(initialState));
  state.startTime = new Date().getTime();
}

export async function printResult() {
  console.log(`Test result:
  Test suites: ${state.suites.passed} / ${state.suites.total} passed
  Tests:       ${state.tests.passed} / ${state.tests.total} passed
  Assertions:  ${state.assertions.passed} / ${state.assertions.total} passed
  Time:        ${(new Date().getTime() - state.startTime) / 1000} seconds
  Result:      ${
    state.suites.passed === state.suites.total ? 'PASSED' : 'FAILED'
  }
  `);
}

export async function describe(name: string, testSuite: () => void) {
  state.currentSuite = JSON.parse(JSON.stringify(initialState.currentSuite));
  state.currentSuite.name = name;
  state.suites.total += 1;

  console.log(name);
  await testSuite();

  if (state.currentSuite.tests.passed === state.currentSuite.tests.total) {
    state.suites.passed += 1;
  }
}

export async function it(message: string, test: () => void | Promise<void>) {
  state.currentTest = JSON.parse(JSON.stringify(initialState.currentTest));
  state.currentTest.name = message;

  state.tests.total += 1;
  state.currentSuite.tests.total += 1;

  try {
    await test();
  } catch (error) {
    console.error(error);
    assert(false);
  }

  if (
    state.currentTest.assertions.passed === state.currentTest.assertions.total
  ) {
    state.tests.passed += 1;
    state.currentSuite.tests.passed += 1;
  }
}

export async function expectError(
  test: () => void | Promise<void>,
  errorMessage?: string,
) {
  try {
    await test();
  } catch (error) {
    if (errorMessage) {
      assert((error.message as string).includes(errorMessage));
    } else {
      assert(true);
    }
    return;
  }
  assert(false);
}

export function assert(condition: boolean): void {
  state.assertions.total += 1;
  state.currentTest.assertions.total += 1;
  if (!condition) {
    console.error(
      `    × ${state.currentTest.name} failed at assertion ${state.currentTest.assertions.total}.`,
    );
  } else {
    state.assertions.passed += 1;
    state.currentTest.assertions.passed += 1;
    console.info(`    √ ${state.currentTest.name}`);
  }
}

export async function sleep(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

/**
 * Some Bluetooth Web APIs need user interaction
 * @param message
 */
export async function showAlert(message: string) {
  const loading = await loadingController.getTop();
  await loading?.dismiss();
  const alert = await alertController.create({
    message,
    buttons: ['OK'],
  });
  await alert.present();
  await alert.onDidDismiss();
}
