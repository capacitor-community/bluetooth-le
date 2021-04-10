package com.capacitorjs.community.plugins.bluetoothle

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.ParcelUuid
import android.util.Log
import com.getcapacitor.*
import com.getcapacitor.Logger.config
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
        private const val CONFIG_KEY_PREFIX = "plugins.BluetoothLe."

        // maximal scan duration for requestDevice
        private const val MAX_SCAN_DURATION: Long = 30000
    }

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var stateReceiver: BroadcastReceiver? = null
    private var deviceMap = HashMap<String, Device>()
    private var deviceScanner: DeviceScanner? = null

    @PluginMethod
    fun initialize(call: PluginCall) {
        pluginRequestAllPermissions()
        // Use this check to determine whether BLE is supported on the device.
        if (!activity.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            call.reject("BLE is not supported.")
            return
        }

        // Initializes Bluetooth adapter.
        bluetoothAdapter = (activity.getSystemService(Context.BLUETOOTH_SERVICE)
                as BluetoothManager).adapter

        if (bluetoothAdapter == null) {
            call.reject("BLE is not available.")
            return
        }
        call.resolve()
    }

    @PluginMethod
    fun getEnabled(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val enabled = bluetoothAdapter?.isEnabled == true
        val result = JSObject()
        result.put("value", enabled)
        call.resolve(result)
    }

    @PluginMethod
    fun startEnabledNotifications(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return

        try {
            createStateReceiver()
        } catch (e: Error) {
            Log.e(TAG, "Error while registering enabled state receiver: ${e.localizedMessage}")
            call.reject("startEnabledNotifications failed.")
            return
        }
        call.resolve()
    }

    private fun createStateReceiver() {
        if (stateReceiver == null) {
            stateReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    val action = intent.action
                    if (action == BluetoothAdapter.ACTION_STATE_CHANGED) {
                        val state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE,
                                BluetoothAdapter.ERROR)
                        val enabled = state == BluetoothAdapter.STATE_ON
                        val result = JSObject()
                        result.put("value", enabled)
                        notifyListeners("onEnabledChanged", result)
                    }
                }
            }
            val intentFilter = IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED)
            context.registerReceiver(stateReceiver, intentFilter)
        }
    }

    @PluginMethod
    fun stopEnabledNotifications(call: PluginCall) {
        if (stateReceiver != null) {
            context.unregisterReceiver(stateReceiver)
        }
        stateReceiver = null
        call.resolve()
    }

    @PluginMethod
    fun requestDevice(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val scanFilters = getScanFilters(call) ?: return
        val scanSettings = getScanSettings(call) ?: return
        val namePrefix = call.getString("namePrefix", "")
        val displayStrings = getDisplayStrings()

        deviceScanner?.stopScanning()
        deviceScanner = DeviceScanner(
                context,
                bluetoothAdapter!!,
                MAX_SCAN_DURATION,
                displayStrings,
                showDialog = true,
        )
        deviceScanner?.startScanning(
                scanFilters,
                scanSettings,
                false,
                namePrefix,
                { scanResponse ->
                    run {
                        if (scanResponse.success) {
                            if (scanResponse.device == null) {
                                call.reject("No device found.")
                            } else {
                                val bleDevice = getBleDevice(scanResponse.device)
                                call.resolve(bleDevice)
                            }
                        } else {
                            call.reject(scanResponse.message)

                        }
                    }
                },
                null
        )
    }

    @PluginMethod
    fun requestLEScan(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val scanFilters = getScanFilters(call) ?: return
        val scanSettings = getScanSettings(call) ?: return
        val namePrefix = call.getString("namePrefix", "")
        val allowDuplicates = call.getBoolean("allowDuplicates", false)

        deviceScanner?.stopScanning()
        deviceScanner = DeviceScanner(
                context,
                bluetoothAdapter!!,
                scanDuration = null,
                displayStrings = null,
                showDialog = false,
        )
        deviceScanner?.startScanning(
                scanFilters,
                scanSettings,
                allowDuplicates,
                namePrefix,
                { scanResponse ->
                    run {
                        if (scanResponse.success) {
                            call.resolve()
                        } else {
                            call.reject(scanResponse.message)
                        }
                    }
                },
                { result ->
                    run {
                        val scanResult = getScanResult(result)
                        notifyListeners("onScanResult", scanResult)
                    }
                }
        )
    }

    @PluginMethod
    fun stopLEScan(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        deviceScanner?.stopScanning()
        call.resolve()
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        val device = getOrCreateDevice(call) ?: return
        device.connect { response ->
            run {
                if (response.success) {
                    call.resolve()
                } else {
                    call.reject(response.value)
                }
            }
        }
    }

    private fun onDisconnect(deviceId: String) {
        notifyListeners("disconnected|${deviceId}", null)
    }

    @PluginMethod
    fun createBond(call: PluginCall) {
        val device = getOrCreateDevice(call) ?: return
        device.createBond { response ->
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
    fun isBonded(call: PluginCall) {
        val device = getOrCreateDevice(call) ?: return
        val isBonded = device.isBonded()
        val result = JSObject()
        result.put("value", isBonded)
        call.resolve(result)
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        val device = getDevice(call) ?: return
        device.disconnect { response ->
            run {
                if (response.success) {
                    deviceMap.remove(device.getId())
                    call.resolve()
                } else {
                    call.reject(response.value)
                }
            }
        }
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
        val writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
        device.write(characteristic.first, characteristic.second, value, writeType) { response ->
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
    fun writeWithoutResponse(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        val value = call.getString("value", null)
        if (value == null) {
            call.reject("Value required.")
            return
        }
        val writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
        device.write(characteristic.first, characteristic.second, value, writeType) { response ->
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
                            call.resolve()
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
                            call.resolve()
                        } else {
                            call.reject(response.value)
                        }
                    }
                })
    }

    private fun assertBluetoothAdapter(call: PluginCall): Boolean? {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth LE not initialized.")
            return null
        }
        return true
    }

    private fun getScanFilters(call: PluginCall): List<ScanFilter>? {
        val filters: ArrayList<ScanFilter> = ArrayList()

        val services = call.getArray("services", JSArray()).toList<String>()
        val name = call.getString("name", null)
        try {
            for (service in services) {
                val filter = ScanFilter.Builder()
                filter.setServiceUuid(ParcelUuid.fromString(service))
                if (name != null) {
                    filter.setDeviceName(name)
                }
                filters.add(filter.build())
            }
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid service UUID.")
            return null
        }

        if (name != null && filters.isEmpty()) {
            val filter = ScanFilter.Builder()
            filter.setDeviceName(name)
            filters.add(filter.build())
        }

        return filters
    }

    private fun getScanSettings(call: PluginCall): ScanSettings? {
        val scanSettings = ScanSettings.Builder()
        val scanMode = call.getInt("scanMode", ScanSettings.SCAN_MODE_BALANCED)
        try {
            scanSettings.setScanMode(scanMode)
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid scan mode.")
            return null
        }
        return scanSettings.build()
    }

    private fun getBleDevice(device: BluetoothDevice): JSObject {
        val bleDevice = JSObject()
        bleDevice.put("deviceId", device.address)
        if (device.name != null) {
            bleDevice.put("name", device.name)
        }

        val uuids = JSArray()
        device.uuids?.forEach { uuid -> uuids.put(uuid.toString()) }
        if (uuids.length() > 0) {
            bleDevice.put("uuids", uuids)
        }

        return bleDevice
    }

    private fun getScanResult(result: ScanResult): JSObject {
        val scanResult = JSObject()

        val bleDevice = getBleDevice(result.device)
        scanResult.put("device", bleDevice)

        if (result.device.name != null) {
            scanResult.put("localName", result.device.name)
        }

        scanResult.put("rssi", result.rssi)

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            scanResult.put("txPower", result.txPower)
        } else {
            scanResult.put("txPower", 127)
        }

        val manufacturerData = JSObject()
        val manufacturerSpecificData = result.scanRecord?.manufacturerSpecificData
        if (manufacturerSpecificData != null) {
            for (i in 0 until manufacturerSpecificData.size()) {
                val key = manufacturerSpecificData.keyAt(i)
                val bytes = manufacturerSpecificData.get(key)
                manufacturerData.put(key.toString(), bytesToString(bytes))
            }
        }
        scanResult.put("manufacturerData", manufacturerData)

        val serviceDataObject = JSObject()
        val serviceData = result.scanRecord?.serviceData
        serviceData?.forEach {
            serviceDataObject.put(it.key.toString(), bytesToString(it.value))
        }
        scanResult.put("serviceData", serviceDataObject)

        val uuids = JSArray()
        result.scanRecord?.serviceUuids?.forEach { uuid -> uuids.put(uuid.toString()) }
        scanResult.put("uuids", uuids)

        scanResult.put("rawAdvertisement",
                result.scanRecord?.bytes?.let { bytesToString(it) })
        return scanResult
    }

    private fun getDisplayStrings(): DisplayStrings {
        return DisplayStrings(
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.scanning",
                        "Scanning..."),
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.cancel",
                        "Cancel"),
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.availableDevices",
                        "Available devices"),
                config.getString(CONFIG_KEY_PREFIX + "displayStrings.noDeviceFound",
                        "No device found"),
        )
    }

    private fun getDeviceId(call: PluginCall): String? {
        val deviceId = call.getString("deviceId", null)
        if (deviceId == null) {
            call.reject("deviceId required.")
            return null
        }
        return deviceId
    }

    private fun getOrCreateDevice(call: PluginCall): Device? {
        assertBluetoothAdapter(call) ?: return null
        val deviceId = getDeviceId(call) ?: return null
        val device = deviceMap[deviceId]
        if (device != null) {
            return device
        }
        try {
            val newDevice = Device(
                    activity.applicationContext,
                    bluetoothAdapter!!,
                    deviceId
            ) { ->
                onDisconnect(deviceId)
            }
            deviceMap[deviceId] = newDevice
            return newDevice
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid deviceId")
            return null
        }
    }

    private fun getDevice(call: PluginCall): Device? {
        assertBluetoothAdapter(call) ?: return null
        val deviceId = getDeviceId(call) ?: return null
        val device = deviceMap[deviceId]
        if (device == null || !device.isConnected()) {
            call.reject("Not connected to device.")
            return null
        }
        return device
    }

    private fun getCharacteristic(call: PluginCall): Pair<UUID, UUID>? {
        val serviceString = call.getString("service", null)
        val serviceUUID: UUID?
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
        val characteristicUUID: UUID?
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
}