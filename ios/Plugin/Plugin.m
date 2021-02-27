#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(BluetoothLe, "BluetoothLe",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getEnabled, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startEnabledNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopEnabledNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestDevice, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestLEScan, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopLEScan, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(connect, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disconnect, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(read, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(write, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(writeWithoutResponse, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startNotifications, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopNotifications, CAPPluginReturnPromise);
)
