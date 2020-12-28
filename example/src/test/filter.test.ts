import { Capacitor } from '@capacitor/core';
import {
  BleClient,
  numberToUUID,
  RequestBleDeviceOptions,
  ScanMode,
  ScanResult,
} from '../../../dist/esm';
import { assert, describe, it, showAlert, sleep } from './testRunner';

export async function testFilters() {
  await describe('Scan filters', async () => {
    await it('should find lots of devices without filter', async () => {
      await scan({}, 5);
    });

    await it('should filter by service', async () => {
      await scan(
        {
          services: [numberToUUID(0x1822)],
        },
        1,
      );
      await scan(
        {
          services: [numberToUUID(0x1898)],
        },
        0,
      );
    });

    await it('should filter by name', async () => {
      await scan(
        {
          name: 'zyx',
        },
        1,
      );
      await scan(
        {
          name: 'ZYX',
        },
        0,
      );
    });

    await it('should filter by namePrefix', async () => {
      await scan(
        {
          namePrefix: 'zy',
        },
        1,
      );
      await scan(
        {
          namePrefix: 'ZY',
        },
        0,
      );
    });

    await it('should filter by multiple services', async () => {
      await scan(
        {
          services: [numberToUUID(0x180d), numberToUUID(0x1822)],
        },
        2,
      );
      await scan(
        {
          services: [
            numberToUUID(0x180d),
            numberToUUID(0x1822),
            numberToUUID(0x1823),
          ],
        },
        2,
      );
    });

    await it('should filter by combinations', async () => {
      await scan(
        {
          services: [numberToUUID(0x180d), numberToUUID(0x1822)],
          name: 'zyx',
        },
        1,
      );
      await scan(
        {
          services: [numberToUUID(0x180d), numberToUUID(0x1822)],
          name: 'zyx2',
        },
        0,
      );
      await scan(
        {
          services: [numberToUUID(0x180d), numberToUUID(0x1822)],
          namePrefix: 'zy',
        },
        1,
      );
      await scan(
        {
          services: [numberToUUID(0x180d), numberToUUID(0x1822)],
          namePrefix: 'zyx2',
        },
        0,
      );
    });
  });
}

async function scan(
  options: RequestBleDeviceOptions,
  expectedNumberOfResults: number,
): Promise<void> {
  if (Capacitor.platform === 'web') {
    await showAlert(expectedNumberOfResults.toString());
    try {
      await BleClient.requestDevice(options);
    } catch (error) {
      assert(true);
    }
  } else {
    const results: ScanResult[] = [];
    options.scanMode = ScanMode.SCAN_MODE_LOW_LATENCY;
    await BleClient.requestLEScan(options, result => {
      if (result) {
        results.push(result);
      }
    });
    await sleep(8000);
    await BleClient.stopLEScan();
    await sleep(500);
    if (expectedNumberOfResults >= 5) {
      assert(results.length >= expectedNumberOfResults);
    } else {
      assert(results.length === expectedNumberOfResults);
      if (results.length !== expectedNumberOfResults) {
        console.error(
          'expected',
          expectedNumberOfResults,
          'received',
          results.length,
        );
      }
    }
  }
}
