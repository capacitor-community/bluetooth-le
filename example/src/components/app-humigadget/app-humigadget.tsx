import { loadingController } from '@ionic/core';
import {
  BleDevice,
  BleClient,
  dataViewToText,
  numberToUUID,
} from 'capacitor-bluetooth-le';
import { Component, h, State } from '@stencil/core';
import { Target, resultToString } from '../../helpers/helpers';
import { handleError } from '../../helpers/error';

@Component({
  tag: 'app-humigadget',
})
export class AppHumigadget {
  @State() result: string;
  @State() notification1: string;
  @State() notification2: string;

  DEVICE_ID = 'DA:8F:8E:31:DC:48';

  GENERIC_SERVICE = numberToUUID(0x1800);
  DEVICE_NAME_CHARACTERISTIC = numberToUUID(0x2a00);
  BATTERY_SERVICE = numberToUUID(0x180f);
  BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
  TEMPERATURE_SERVICE = '00002234-b38d-4985-720e-0f993a68ee41';
  TEMPERATURE_CHARACTERISTIC = '00002235-b38d-4985-720e-0f993a68ee41';
  HUMIDITY_SERVICE = '00001234-b38d-4985-720e-0f993a68ee41';
  HUMIDITY_CHARACTERISTIC = '00001235-b38d-4985-720e-0f993a68ee41';

  device: BleDevice;

  actions: { label: string; action: () => Promise<any> }[] = [
    {
      label: 'request device',
      action: async () => {
        const result = await BleClient.requestDevice({
          optionalServices: [
            this.GENERIC_SERVICE,
            this.BATTERY_SERVICE,
            this.TEMPERATURE_SERVICE,
            this.HUMIDITY_SERVICE,
          ],
        });
        this.device = result;
        return result;
      },
    },
    {
      label: 'request device (by name)',
      action: async () => {
        const result = await BleClient.requestDevice({
          name: 'Smart Humigadget',
          optionalServices: [
            this.GENERIC_SERVICE,
            this.BATTERY_SERVICE,
            this.TEMPERATURE_SERVICE,
            this.HUMIDITY_SERVICE,
          ],
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
      label: 'read device name',
      action: async () => {
        const result = await BleClient.read(
          this.device?.deviceId,
          this.GENERIC_SERVICE,
          this.DEVICE_NAME_CHARACTERISTIC,
        );
        return dataViewToText(result);
      },
    },
    {
      label: 'read battery',
      action: async () => {
        const value = await BleClient.read(
          this.device?.deviceId,
          this.BATTERY_SERVICE,
          this.BATTERY_CHARACTERISTIC,
        );
        return value.getUint8(0);
      },
    },
    {
      label: 'read temperature',
      action: async () => {
        const value = await BleClient.read(
          this.device?.deviceId,
          this.TEMPERATURE_SERVICE,
          this.TEMPERATURE_CHARACTERISTIC,
        );
        return value.getFloat32(0, true);
      },
    },
    {
      label: 'read humidity',
      action: async () => {
        const value = await BleClient.read(
          this.device?.deviceId,
          this.HUMIDITY_SERVICE,
          this.HUMIDITY_CHARACTERISTIC,
        );
        return value.getFloat32(0, true);
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

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Humigadget</ion-title>
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
      </ion-content>,
    ];
  }
}
