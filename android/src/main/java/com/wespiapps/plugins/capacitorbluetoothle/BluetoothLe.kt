package com.wespiapps.plugins.capacitorbluetoothle

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanFilter
import android.content.Context
import android.content.pm.PackageManager
import android.os.ParcelUuid
import com.getcapacitor.*
import com.getcapacitor.Logger.config
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.util.*
import kotlin.collections.ArrayList

@NativePlugin(permissions = [
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.BLUETOOTH,
    Manifest.permission.BLUETOOTH_ADMIN
])
class BluetoothLe : Plugin() {
    companion object {
        private val TAG = BluetoothLe::class.java.simpleName
        private val CONFIG_KEY_PREFIX = "plugins.BluetoothLe."
        private val SCAN_DURATION: Long = 30000
    }

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var deviceMap = HashMap<String, Device>()

    @PluginMethod
    fun initialize(call: PluginCall) {
        pluginRequestAllPermissions()
        // Use this check to determine whether BLE is supported on the device. Then
        // you can selectively disable BLE-related features.
        if (!activity.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            call.reject("BLE is not supported")
            return
        }

        // Initializes Bluetooth adapter.
        bluetoothAdapter = (activity.getSystemService(Context.BLUETOOTH_SERVICE)
                as BluetoothManager).adapter

        // Ensures Bluetooth is available on the device and it is enabled.
        if (bluetoothAdapter == null || bluetoothAdapter?.isEnabled != true) {
            bluetoothAdapter = null
            call.reject("BLE is not enabled.")
            return
        }
        call.resolve()
    }

    private fun getScanFilters(call: PluginCall): List<ScanFilter>? {
        val filters: ArrayList<ScanFilter> = ArrayList()

        val services = call.getArray("services", JSArray()).toList<String>()
        try {
            for (service in services) {
                val filter = ScanFilter.Builder()
                filter.setServiceUuid(ParcelUuid.fromString(service))
                filters.add(filter.build())
            }
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid service UUID.")
            return null
        }

        val name = call.getString("name", null)
        if (name != null) {
            val filter = ScanFilter.Builder()
            filter.setDeviceName(name)
            filters.add(filter.build())
        }

        return filters
    }

    @PluginMethod
    fun requestDevice(call: PluginCall) {
        if (bluetoothAdapter == null) {
            call.reject("BluetoothAdapter not initialized")
            return
        }
        val filters = getScanFilters(call) ?: return
        val displayStrings = DisplayStrings(
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.scanning",
                        "Scanning..."),
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.cancel",
                        "Cancel"),
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.availableDevices",
                        "Available devices"),
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.noDeviceFound",
                        "No device found"),
        )
        val deviceScanner = DeviceScanner(
                context,
                bluetoothAdapter!!,
                SCAN_DURATION,
                displayStrings,
        )
        deviceScanner.requestDevice(filters) { scanResponse ->
            run {
                if (!scanResponse.success) {
                    call.reject(scanResponse.message)
                } else {
                    if (scanResponse.device == null) {
                        call.reject("No device found.")
                    } else {
                        val ret = JSObject()
                        ret.put("deviceId", scanResponse.device.address)
                        ret.put("name", scanResponse.device.name)
                        call.resolve(ret)
                    }

                }
            }
        }
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        if (bluetoothAdapter == null) {
            call.reject("BluetoothAdapter not initialized")
            return
        }
        val deviceId = call.getString("deviceId", null)
        if (deviceId == null) {
            call.reject("deviceId required.")
            return
        }
        val device = Device(activity, bluetoothAdapter!!, deviceId)
        deviceMap.put(deviceId, device)
        device.connect() { response ->
            run {
                if (response.success) {
                    call.resolve()
                } else {
                    call.reject(response.value)
                }
            }
        }
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        val deviceId = call.getString("deviceId", null)
        if (deviceId == null) {
            call.reject("deviceId required.")
            return
        }
        val device = deviceMap.get(deviceId)
        if (device == null || !device.isConnected()) {
            call.reject("Not connected to device.")
            return
        }
        device.disconnect() { response ->
            run {
                if (response.success) {
                    device.close()
                    deviceMap.remove(deviceId)
                    call.resolve()
                } else {
                    call.reject(response.value)
                }
            }
        }
    }

    private fun getDevice(call: PluginCall): Device? {
        if (bluetoothAdapter == null) {
            call.reject("BluetoothAdapter not initialized")
            return null
        }
        val deviceId = call.getString("deviceId", null)
        if (deviceId == null) {
            call.reject("deviceId required.")
            return null
        }
        val device = deviceMap.get(deviceId)
        if (device == null || !device.isConnected()) {
            call.reject("Not connected to device.")
            return null
        }
        return device
    }

    private fun getCharacteristic(call: PluginCall): Pair<UUID, UUID>? {
        val serviceString = call.getString("service", null)
        var serviceUUID: UUID?
        try {
            serviceUUID = UUID.fromString(serviceString)
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid service UUID.")
            return null
        }
        if (serviceUUID == null) {
            call.reject("Service UUID required.")
            return null
        }
        val characteristicString = call.getString("characteristic", null)
        var characteristicUUID: UUID?
        try {
            characteristicUUID = UUID.fromString(characteristicString)
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid characteristic UUID.")
            return null
        }
        if (characteristicUUID == null) {
            call.reject("Characteristic UUID required.")
            return null
        }
        return Pair(serviceUUID, characteristicUUID)
    }

    @PluginMethod
    fun read(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        device.read(characteristic.first, characteristic.second) { response ->
            run {
                if (response.success) {
                    val ret = JSObject()
                    ret.put("value", response.value)
                    call.resolve(ret)
                } else {
                    call.reject(response.value)
                }
            }
        }
    }

    @PluginMethod
    fun write(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        val value = call.getString("value", null)
        if (value == null) {
            call.reject("Value required.")
            return
        }
        device.write(characteristic.first, characteristic.second, value) { response ->
            run {
                if (response.success) {
                    val ret = JSObject()
                    call.resolve(ret)
                } else {
                    call.reject(response.value)
                }
            }
        }
    }

    @PluginMethod
    fun startNotifications(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        device.setNotifications(
                characteristic.first,
                characteristic.second,
                true,
                { response ->
                    run {
                        val key = "notification|${device.getId()}|${(characteristic.first)}|${(characteristic.second)}"
                        val ret = JSObject()
                        ret.put("value", response.value)
                        notifyListeners(key, ret)
                    }
                },
                { response ->
                    run {
                        if (response.success) {
                            val ret = JSObject()
                            call.resolve(ret)
                        } else {
                            call.reject(response.value)
                        }
                    }
                }
        )
    }

    @PluginMethod
    fun stopNotifications(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        device.setNotifications(
                characteristic.first,
                characteristic.second,
                false,
                null,
                { response ->
                    run {
                        if (response.success) {
                            val ret = JSObject()
                            call.resolve(ret)
                        } else {
                            call.reject(response.value)
                        }
                    }
                })
    }
}