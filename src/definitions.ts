declare module '@capacitor/core' {
  interface PluginRegistry {
    BluetoothLe: BluetoothLePlugin;
  }
}

export interface BluetoothLePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
