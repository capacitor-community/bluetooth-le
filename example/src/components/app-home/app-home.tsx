import { loadingController } from '@ionic/core';
import {
  BleDevice,
  BleClient,
  numbersToDataView,
} from '@capacitor-community/bluetooth-le';
import { Component, h, State } from '@stencil/core';
import { handleError } from '../../helpers/error';
import { main } from '../../helpers/usage';
import { resultToString, Target } from '../../helpers/helpers';

@Component({
  tag: 'app-home',
})
export class AppHome {
  @State() result: string;
  @State() notification1: string;
  @State() notification2: string;
  @State() heartRate: [string, number][] = [];

  DEVICE_ID = 'E5:A3:06:72:5B:E9';
  HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
  HEART_RATE_MEASUREMENT_CHARACTERISTIC =
    '00002a37-0000-1000-8000-00805f9b34fb';
  BODY_SENSOR_LOCATION_CHARACTERISTIC = '00002a38-0000-1000-8000-00805f9b34fb';
  POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
  POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';
  POLAR_PMD_DATA = 'fb005c82-02e7-f387-1cad-8acd2d8df0c8';

  device: BleDevice;

  actions: { label: string; action: () => Promise<any> }[] = [
    {
      label: 'initialize',
      action: () => {
        return BleClient.initialize();
      },
    },
    {
      label: 'run usage',
      action: () => {
        return main();
      },
    },
    {
      label: 'request device (all)',
      action: async () => {
        const result = await BleClient.requestDevice();
        this.device = result;
        return result;
      },
    },
    {
      label: 'request device (HR)',
      action: async () => {
        const result = await BleClient.requestDevice({
          services: [this.HEART_RATE_SERVICE],
          optionalServices: [this.POLAR_PMD_SERVICE],
        });
        this.device = result;
        return result;
      },
    },
    {
      label: 'request device (fail)',
      action: async () => {
        const result = await BleClient.requestDevice({
          services: ['0000'],
        });
        this.device = result;
        return result;
      },
    },
    {
      label: 'connect',
      action: () => {
        return BleClient.connect(this.device?.deviceId);
      },
    },
    {
      label: 'connect directly',
      action: async () => {
        const result = await BleClient.connect(this.DEVICE_ID);
        this.device = { deviceId: this.DEVICE_ID };
        return result;
      },
    },
    {
      label: 'read body sensor location',
      action: () => {
        return BleClient.read(
          this.device?.deviceId,
          this.HEART_RATE_SERVICE,
          this.BODY_SENSOR_LOCATION_CHARACTERISTIC,
        );
      },
    },
    {
      label: 'read (fail)',
      action: () => {
        return BleClient.read(
          this.device?.deviceId,
          this.HEART_RATE_SERVICE,
          '0000',
        );
      },
    },
    {
      label: 'read HR (fail)',
      action: () => {
        return BleClient.read(
          this.device?.deviceId,
          this.HEART_RATE_SERVICE,
          this.HEART_RATE_MEASUREMENT_CHARACTERISTIC,
        );
      },
    },
    {
      label: 'start notifications HR',
      action: () => {
        this.heartRate = [];
        return BleClient.startNotifications(
          this.device?.deviceId,
          this.HEART_RATE_SERVICE,
          this.HEART_RATE_MEASUREMENT_CHARACTERISTIC,
          value => {
            const timestamp = new Date().toLocaleTimeString();
            this.heartRate.push([timestamp, this.parseHeartRate(value)]);
            console.log(timestamp);
            this.showResult(value, Target.NOTIFICATION_1);
          },
        );
      },
    },
    {
      label: 'stop notifications HR',
      action: () => {
        return BleClient.stopNotifications(
          this.device?.deviceId,
          this.HEART_RATE_SERVICE,
          this.HEART_RATE_MEASUREMENT_CHARACTERISTIC,
        );
      },
    },
    {
      label: 'start notifications control',
      action: () => {
        return BleClient.startNotifications(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_CONTROL_POINT,
          value => this.showResult(value, Target.NOTIFICATION_2),
        );
      },
    },
    {
      label: 'stop notifications control',
      action: () => {
        return BleClient.stopNotifications(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_CONTROL_POINT,
        );
      },
    },
    {
      label: 'write control (get ecg settings)',
      action: () => {
        return BleClient.write(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_CONTROL_POINT,
          numbersToDataView([1, 0]),
        );
      },
    },
    {
      label: 'write control (start stream)',
      action: () => {
        return BleClient.write(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_CONTROL_POINT,
          numbersToDataView([2, 0, 0, 1, 130, 0, 1, 1, 14, 0]),
        );
      },
    },
    {
      label: 'write control (stop stream)',
      action: () => {
        return BleClient.write(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_CONTROL_POINT,
          numbersToDataView([3, 0]),
        );
      },
    },
    {
      label: 'read control',
      action: () => {
        return BleClient.read(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_CONTROL_POINT,
        );
      },
    },
    {
      label: 'start notifications data',
      action: () => {
        return BleClient.startNotifications(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_DATA,
          value => this.showResult(value, Target.NOTIFICATION_1),
        );
      },
    },
    {
      label: 'stop notifications data',
      action: () => {
        return BleClient.stopNotifications(
          this.device?.deviceId,
          this.POLAR_PMD_SERVICE,
          this.POLAR_PMD_DATA,
        );
      },
    },
    {
      label: 'disconnect',
      action: () => {
        return BleClient.disconnect(this.device?.deviceId);
      },
    },
  ];

  async runAction(action: () => Promise<any>): Promise<void> {
    const loading = await loadingController.create({});
    await loading.present();
    try {
      const result = await action();
      this.showResult(result);
    } catch (error) {
      handleError(error);
    }
    loading.dismiss();
  }

  showResult(result: any, target: Target = Target.RESULT): void {
    console.log(result);
    const resultString = resultToString(result);
    if (target === Target.RESULT) {
      this.result = resultString;
    } else if (target === Target.NOTIFICATION_1) {
      this.notification1 = resultString;
    } else if (target === Target.NOTIFICATION_2) {
      this.notification2 = resultString;
    }
  }

  parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRate: number;
    if (rate16Bits) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }
    return heartRate;
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Heart Rate Monitor</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <div class="ion-margin">Result: {this.result}</div>
        <div class="ion-margin">Notification1: {this.notification1}</div>
        <div class="ion-margin">Notification2: {this.notification2}</div>

        {this.actions.map(action => (
          <ion-button onClick={() => this.runAction(action.action)}>
            {action.label}
          </ion-button>
        ))}
        {this.heartRate.map(hr => (
          <div>
            {hr[0]}: {hr[1]}
          </div>
        ))}
      </ion-content>,
    ];
  }
}
