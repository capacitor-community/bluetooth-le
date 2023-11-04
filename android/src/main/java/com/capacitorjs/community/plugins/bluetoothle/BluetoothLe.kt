package com.capacitorjs.community.plugins.bluetoothle

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothAdapter.ACTION_REQUEST_ENABLE
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.ParcelUuid
import android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS
import android.provider.Settings.ACTION_BLUETOOTH_SETTINGS
import android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS
import androidx.activity.result.ActivityResult
import androidx.core.location.LocationManagerCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Logger
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import java.util.UUID


@SuppressLint("MissingPermission")
@CapacitorPlugin(
    name = "BluetoothLe",
    permissions = [
        Permission(
            strings = [
                Manifest.permission.ACCESS_COARSE_LOCATION,
            ], alias = "ACCESS_COARSE_LOCATION"
        ),
        Permission(
            strings = [
                Manifest.permission.ACCESS_FINE_LOCATION,
            ], alias = "ACCESS_FINE_LOCATION"
        ),
        Permission(
            strings = [
                Manifest.permission.BLUETOOTH,
            ], alias = "BLUETOOTH"
        ),
        Permission(
            strings = [
                Manifest.permission.BLUETOOTH_ADMIN,
            ], alias = "BLUETOOTH_ADMIN"
        ),
        Permission(
            strings = [
                // Manifest.permission.BLUETOOTH_SCAN
                "android.permission.BLUETOOTH_SCAN",
            ], alias = "BLUETOOTH_SCAN"
        ),
        Permission(
            strings = [
                // Manifest.permission.BLUETOOTH_ADMIN
                "android.permission.BLUETOOTH_CONNECT",
            ], alias = "BLUETOOTH_CONNECT"
        ),
    ]
)
class BluetoothLe : Plugin() {
    companion object {
        private val TAG = BluetoothLe::class.java.simpleName

        // maximal scan duration for requestDevice
        private const val MAX_SCAN_DURATION: Long = 30000
        private const val CONNECTION_TIMEOUT: Float = 10000.0F
        private const val DEFAULT_TIMEOUT: Float = 5000.0F
    }

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var stateReceiver: BroadcastReceiver? = null
    private var deviceMap = HashMap<String, Device>()
    private var deviceScanner: DeviceScanner? = null
    private var displayStrings: DisplayStrings? = null
    private var aliases: Array<String> = arrayOf()

    override fun load() {
        displayStrings = getDisplayStrings()
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val neverForLocation = call.getBoolean("androidNeverForLocation", false) as Boolean
            aliases = if (neverForLocation) {
                arrayOf(
                    "BLUETOOTH_SCAN",
                    "BLUETOOTH_CONNECT",
                )
            } else {
                arrayOf(
                    "BLUETOOTH_SCAN",
                    "BLUETOOTH_CONNECT",
                    "ACCESS_FINE_LOCATION",
                )
            }
        } else {
            aliases = arrayOf(
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION",
                "BLUETOOTH",
                "BLUETOOTH_ADMIN",
            )
        }
        requestPermissionForAliases(aliases, call, "checkPermission")
    }

    @PermissionCallback
    private fun checkPermission(call: PluginCall) {
        val granted: List<Boolean> = aliases.map { alias ->
            getPermissionState(alias) == PermissionState.GRANTED
        }
        // all have to be true
        if (granted.all { it }) {
            runInitialization(call)
        } else {
            call.reject("Permission denied.")
        }
    }

    private fun runInitialization(call: PluginCall) {
        if (!activity.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            call.reject("BLE is not supported.")
            return
        }

        bluetoothAdapter =
            (activity.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter

        if (bluetoothAdapter == null) {
            call.reject("BLE is not available.")
            return
        }
        call.resolve()
    }

    @PluginMethod
    fun isEnabled(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val enabled = bluetoothAdapter?.isEnabled == true
        val result = JSObject()
        result.put("value", enabled)
        call.resolve(result)
    }

    @PluginMethod
    fun requestEnable(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val intent = Intent(ACTION_REQUEST_ENABLE)
        startActivityForResult(call, intent, "handleRequestEnableResult")
    }

    @ActivityCallback
    private fun handleRequestEnableResult(call: PluginCall, result: ActivityResult) {
        if (result.resultCode == Activity.RESULT_OK) {
            call.resolve()
        } else {
            call.reject("requestEnable failed.")
        }
    }

    @PluginMethod
    fun enable(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val result = bluetoothAdapter?.enable()
        if (result != true) {
            call.reject("Enable failed.")
            return
        }
        call.resolve()
    }

    @PluginMethod
    fun disable(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val result = bluetoothAdapter?.disable()
        if (result != true) {
            call.reject("Disable failed.")
            return
        }
        call.resolve()
    }

    @PluginMethod
    fun startEnabledNotifications(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return

        try {
            createStateReceiver()
        } catch (e: Error) {
            Logger.error(
                TAG, "Error while registering enabled state receiver: ${e.localizedMessage}", e
            )
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
                        val state = intent.getIntExtra(
                            BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR
                        )
                        val enabled = state == BluetoothAdapter.STATE_ON
                        val result = JSObject()
                        result.put("value", enabled)
                        try {
                            notifyListeners("onEnabledChanged", result)
                        } catch (e: ConcurrentModificationException) {
                            Logger.error(TAG, "Error in notifyListeners: ${e.localizedMessage}", e)
                        }
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
    fun isLocationEnabled(call: PluginCall) {
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val enabled = LocationManagerCompat.isLocationEnabled(lm)
        Logger.debug(TAG, "location $enabled")
        val result = JSObject()
        result.put("value", enabled)
        call.resolve(result)
    }

    @PluginMethod
    fun openLocationSettings(call: PluginCall) {
        val intent = Intent(ACTION_LOCATION_SOURCE_SETTINGS)
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun openBluetoothSettings(call: PluginCall) {
        val intent = Intent(ACTION_BLUETOOTH_SETTINGS)
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun openAppSettings(call: PluginCall) {
        val intent = Intent(ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = Uri.parse("package:" + activity.packageName)
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun setDisplayStrings(call: PluginCall) {
        displayStrings = DisplayStrings(
            call.getString(
                "scanning", displayStrings!!.scanning
            ) as String,
            call.getString(
                "cancel", displayStrings!!.cancel
            ) as String,
            call.getString(
                "availableDevices", displayStrings!!.availableDevices
            ) as String,
            call.getString(
                "noDeviceFound", displayStrings!!.noDeviceFound
            ) as String,
        )
        call.resolve()
    }

    @PluginMethod
    fun requestDevice(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val scanFilters = getScanFilters(call) ?: return
        val scanSettings = getScanSettings(call) ?: return
        val namePrefix = call.getString("namePrefix", "") as String

        try {
            deviceScanner?.stopScanning()
        } catch (e: IllegalStateException) {
            Logger.error(TAG, "Error in requestDevice: ${e.localizedMessage}", e)
            call.reject(e.localizedMessage)
            return
        }

        deviceScanner = DeviceScanner(
            context,
            bluetoothAdapter!!,
            scanDuration = MAX_SCAN_DURATION,
            displayStrings = displayStrings!!,
            showDialog = true,
        )
        deviceScanner?.startScanning(
            scanFilters, scanSettings, false, namePrefix, { scanResponse ->
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
            }, null
        )
    }

    @PluginMethod
    fun requestLEScan(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val scanFilters = getScanFilters(call) ?: return
        val scanSettings = getScanSettings(call) ?: return
        val namePrefix = call.getString("namePrefix", "") as String
        val allowDuplicates = call.getBoolean("allowDuplicates", false) as Boolean

        try {
            deviceScanner?.stopScanning()
        } catch (e: IllegalStateException) {
            Logger.error(TAG, "Error in requestLEScan: ${e.localizedMessage}", e)
            call.reject(e.localizedMessage)
            return
        }

        deviceScanner = DeviceScanner(
            context,
            bluetoothAdapter!!,
            scanDuration = null,
            displayStrings = displayStrings!!,
            showDialog = false,
        )
        deviceScanner?.startScanning(scanFilters,
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
                    try {
                        notifyListeners("onScanResult", scanResult)
                    } catch (e: ConcurrentModificationException) {
                        Logger.error(TAG, "Error in notifyListeners: ${e.localizedMessage}", e)
                    }
                }
            })
    }

    @PluginMethod
    fun stopLEScan(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        try {
            deviceScanner?.stopScanning()
        } catch (e: IllegalStateException) {
            Logger.error(TAG, "Error in stopLEScan: ${e.localizedMessage}", e)
        }
        call.resolve()
    }

    @PluginMethod
    fun getDevices(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val deviceIds = (call.getArray("deviceIds", JSArray()) as JSArray).toList<String>()
        val bleDevices = JSArray()
        deviceIds.forEach { deviceId ->
            val bleDevice = JSObject()
            bleDevice.put("deviceId", deviceId)
            bleDevices.put(bleDevice)
        }
        val result = JSObject()
        result.put("devices", bleDevices)
        call.resolve(result)
    }

    @PluginMethod
    fun getConnectedDevices(call: PluginCall) {
        assertBluetoothAdapter(call) ?: return
        val bluetoothManager =
            (activity.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager)
        val devices = bluetoothManager.getConnectedDevices(BluetoothProfile.GATT)
        val bleDevices = JSArray()
        devices.forEach { device ->
            bleDevices.put(getBleDevice(device))
        }
        val result = JSObject()
        result.put("devices", bleDevices)
        call.resolve(result)
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        val device = getOrCreateDevice(call) ?: return
        val timeout = call.getFloat("timeout", CONNECTION_TIMEOUT)!!.toLong()
        device.connect(timeout) { response ->
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
        try {
            notifyListeners("disconnected|${deviceId}", null)
        } catch (e: ConcurrentModificationException) {
            Logger.error(TAG, "Error in notifyListeners: ${e.localizedMessage}", e)
        }
    }

    @PluginMethod
    fun createBond(call: PluginCall) {
        val device = getOrCreateDevice(call) ?: return
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.createBond(timeout) { response ->
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
        val device = getOrCreateDevice(call) ?: return
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.disconnect(timeout) { response ->
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
    fun getServices(call: PluginCall) {
        val device = getDevice(call) ?: return
        val services = device.getServices()
        val bleServices = JSArray()
        services.forEach { service ->
            val bleCharacteristics = JSArray()
            service.characteristics.forEach { characteristic ->
                val bleCharacteristic = JSObject()
                bleCharacteristic.put("uuid", characteristic.uuid)
                bleCharacteristic.put("properties", getProperties(characteristic))
                val bleDescriptors = JSArray()
                characteristic.descriptors.forEach { descriptor ->
                    val bleDescriptor = JSObject()
                    bleDescriptor.put("uuid", descriptor.uuid)
                    bleDescriptors.put(bleDescriptor)
                }
                bleCharacteristic.put("descriptors", bleDescriptors)
                bleCharacteristics.put(bleCharacteristic)
            }
            val bleService = JSObject()
            bleService.put("uuid", service.uuid)
            bleService.put("characteristics", bleCharacteristics)
            bleServices.put(bleService)
        }
        val ret = JSObject()
        ret.put("services", bleServices)
        call.resolve(ret)
    }

    private fun getProperties(characteristic: BluetoothGattCharacteristic): JSObject {
        val properties = JSObject()
        properties.put(
            "broadcast",
            characteristic.properties and BluetoothGattCharacteristic.PROPERTY_BROADCAST > 0
        )
        properties.put(
            "read", characteristic.properties and BluetoothGattCharacteristic.PROPERTY_READ > 0
        )
        properties.put(
            "writeWithoutResponse",
            characteristic.properties and BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE > 0
        )
        properties.put(
            "write", characteristic.properties and BluetoothGattCharacteristic.PROPERTY_WRITE > 0
        )
        properties.put(
            "notify", characteristic.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY > 0
        )
        properties.put(
            "indicate",
            characteristic.properties and BluetoothGattCharacteristic.PROPERTY_INDICATE > 0
        )
        properties.put(
            "authenticatedSignedWrites",
            characteristic.properties and BluetoothGattCharacteristic.PROPERTY_SIGNED_WRITE > 0
        )
        properties.put(
            "extendedProperties",
            characteristic.properties and BluetoothGattCharacteristic.PROPERTY_EXTENDED_PROPS > 0
        )
        return properties
    }

    @PluginMethod
    fun discoverServices(call: PluginCall) {
        val device = getDevice(call) ?: return
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.discoverServices(timeout) { response ->
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
    fun getMtu(call: PluginCall) {
        val device = getDevice(call) ?: return
        val mtu = device.getMtu()
        val ret = JSObject()
        ret.put("value", mtu)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestConnectionPriority(call: PluginCall) {
        val device = getDevice(call) ?: return
        val connectionPriority = call.getInt("connectionPriority", -1) as Int
        if (connectionPriority < BluetoothGatt.CONNECTION_PRIORITY_BALANCED || connectionPriority > BluetoothGatt.CONNECTION_PRIORITY_LOW_POWER) {
            call.reject("Invalid connectionPriority.")
            return
        }

        val result = device.requestConnectionPriority(connectionPriority)
        if (result) {
            call.resolve()
        } else {
            call.reject("requestConnectionPriority failed.")
        }
    }

    @PluginMethod
    fun readRssi(call: PluginCall) {
        val device = getDevice(call) ?: return
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.readRssi(timeout) { response ->
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
    fun read(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.read(characteristic.first, characteristic.second, timeout) { response ->
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
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.write(
            characteristic.first, characteristic.second, value, writeType, timeout
        ) { response ->
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
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.write(
            characteristic.first, characteristic.second, value, writeType, timeout
        ) { response ->
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
    fun readDescriptor(call: PluginCall) {
        val device = getDevice(call) ?: return
        val descriptor = getDescriptor(call) ?: return
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.readDescriptor(
            descriptor.first, descriptor.second, descriptor.third, timeout
        ) { response ->
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
    fun writeDescriptor(call: PluginCall) {
        val device = getDevice(call) ?: return
        val descriptor = getDescriptor(call) ?: return
        val value = call.getString("value", null)
        if (value == null) {
            call.reject("Value required.")
            return
        }
        val timeout = call.getFloat("timeout", DEFAULT_TIMEOUT)!!.toLong()
        device.writeDescriptor(
            descriptor.first, descriptor.second, descriptor.third, value, timeout
        ) { response ->
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
        device.setNotifications(characteristic.first, characteristic.second, true, { response ->
            run {
                val key =
                    "notification|${device.getId()}|${(characteristic.first)}|${(characteristic.second)}"
                val ret = JSObject()
                ret.put("value", response.value)
                try {
                    notifyListeners(key, ret)
                } catch (e: ConcurrentModificationException) {
                    Logger.error(TAG, "Error in notifyListeners: ${e.localizedMessage}", e)
                }
            }
        }, { response ->
            run {
                if (response.success) {
                    call.resolve()
                } else {
                    call.reject(response.value)
                }
            }
        })
    }

    @PluginMethod
    fun stopNotifications(call: PluginCall) {
        val device = getDevice(call) ?: return
        val characteristic = getCharacteristic(call) ?: return
        device.setNotifications(
            characteristic.first, characteristic.second, false, null
        ) { response ->
            run {
                if (response.success) {
                    call.resolve()
                } else {
                    call.reject(response.value)
                }
            }
        }
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

        val services = (call.getArray("services", JSArray()) as JSArray).toList<String>()
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
        val scanMode = call.getInt("scanMode", ScanSettings.SCAN_MODE_BALANCED) as Int
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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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

        scanResult.put("rawAdvertisement", result.scanRecord?.bytes?.let { bytesToString(it) })
        return scanResult
    }

    private fun getDisplayStrings(): DisplayStrings {
        return DisplayStrings(
            config.getString(
                "displayStrings.scanning", "Scanning..."
            ),
            config.getString(
                "displayStrings.cancel", "Cancel"
            ),
            config.getString(
                "displayStrings.availableDevices", "Available devices"
            ),
            config.getString(
                "displayStrings.noDeviceFound", "No device found"
            ),
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
        return try {
            val newDevice = Device(
                activity.applicationContext, bluetoothAdapter!!, deviceId
            ) {
                onDisconnect(deviceId)
            }
            deviceMap[deviceId] = newDevice
            newDevice
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid deviceId")
            null
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

    private fun getDescriptor(call: PluginCall): Triple<UUID, UUID, UUID>? {
        val characteristic = getCharacteristic(call) ?: return null
        val descriptorString = call.getString("descriptor", null)
        val descriptorUUID: UUID?
        try {
            descriptorUUID = UUID.fromString(descriptorString)
        } catch (e: IllegalAccessException) {
            call.reject("Invalid descriptor UUID.")
            return null
        }
        if (descriptorUUID == null) {
            call.reject("Descriptor UUID required.")
            return null
        }
        return Triple(characteristic.first, characteristic.second, descriptorUUID)
    }
}
