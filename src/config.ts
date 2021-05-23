/// <reference types="@capacitor/cli" />

declare module '@capacitor/cli' {
  export interface PluginsConfig {
    /**
     * These config values are available:
     */
    BluetoothLe?: {
      /**
       * The strings that are displayed in the device selection dialog on iOS and Android when using `requestDevice()`.
       *
       * @since 0.0.1
       * @default {
          "scanning": "Scanning...",
          "cancel": "Cancel",
          "availableDevices": "Available devices",
          "noDeviceFound": "No device found"
        }
       * @example {
          scanning: "Am Scannen...",
          cancel: "Abbrechen",
          availableDevices: "Verfügbare Geräte",
          noDeviceFound: "Kein Gerät gefunden",
        }
       */
      displayStrings?: DisplayStrings;
    };
  }
}

export interface DisplayStrings {
  scanning: string;
  cancel: string;
  availableDevices: string;
  noDeviceFound: string;
}
