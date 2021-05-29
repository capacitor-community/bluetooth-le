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
  /**
   * @since 0.0.1
   * @default "Scanning..."
   * @example "Am Scannen..."
   */
  scanning?: string;

  /**
   * @since 0.0.1
   * @default "Cancel"
   * @example "Abbrechen"
   */
  cancel?: string;

  /**
   * @since 0.0.1
   * @default "Available devices"
   * @example "Verfügbare Geräte"
   */
  availableDevices?: string;

  /**
   * @since 0.0.1
   * @default "No device found"
   * @example "Kein Gerät gefunden"
   */
  noDeviceFound?: string;
}
