#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(BluetoothLe, "BluetoothLe",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isEnabled, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestEnable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(enable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startEnabledNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopEnabledNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isLocationEnabled, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openLocationSettings, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openBluetoothSettings, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openAppSettings, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setDisplayStrings, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestDevice, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestLEScan, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopLEScan, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getDevices, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(discoverServices, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getConnectedDevices, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(connect, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createBond, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isBonded, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disconnect, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getServices, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getMtu, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestConnectionPriority, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(readRssi, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(read, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(write, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(writeWithoutResponse, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(readDescriptor, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(writeDescriptor, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopNotifications, CAPPluginReturnPromise);
)
