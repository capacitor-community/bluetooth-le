package com.capacitorjs.community.plugins.bluetoothle

import android.bluetooth.*
import android.bluetooth.BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
import android.os.Handler
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import java.util.*
import kotlin.collections.HashMap

class CallbackResponse(
        val success: Boolean,
        val value: String,
) {}

class Device(
        private val activity: AppCompatActivity,
        private val bluetoothAdapter: BluetoothAdapter,
        private val address: String,
) {
    companion object {
        private val TAG = Device::class.java.simpleName
        private const val STATE_DISCONNECTED = 0
        private const val STATE_CONNECTING = 1
        private const val STATE_CONNECTED = 2
        private const val CLIENT_CHARACTERISTIC_CONFIG = "00002902-0000-1000-8000-00805f9b34fb"
    }

    private var connectionState = STATE_DISCONNECTED
    private var device: BluetoothDevice = bluetoothAdapter.getRemoteDevice(address)
    private var bluetoothGatt: BluetoothGatt? = null
    private var callbackMap = HashMap<String, ((CallbackResponse) -> Unit)>()
    private var timeoutMap = HashMap<String, Handler>()

    private val gattCallback: BluetoothGattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(
                gatt: BluetoothGatt,
                status: Int,
                newState: Int
        ) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                connectionState = STATE_CONNECTED
                // service discovery is required to use services
                Log.i(TAG, "Connected to GATT server. Starting service discovery.")
                val result = bluetoothGatt?.discoverServices()
                if (result != true) {
                    reject("connect", "Starting service discovery failed.")
                }
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                connectionState = STATE_DISCONNECTED
                Log.i(TAG, "Disconnected from GATT server.")
                resolve("disconnect", "Disconnected.")
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            super.onServicesDiscovered(gatt, status)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                // Try requesting a larger MTU. Maximally supported MTU will be selected.
                requestMtu(512)
            } else {
                reject("connect", "Service discovery failed.")
            }
        }

        override fun onMtuChanged(gatt: BluetoothGatt?, mtu: Int, status: Int) {
            super.onMtuChanged(gatt, mtu, status)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "MTU changed: " + mtu)
            } else {
                Log.d(TAG, "MTU change failed: " + mtu)
            }
            resolve("connect", "Connected.")
        }

        override fun onCharacteristicRead(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                status: Int
        ) {
            super.onCharacteristicRead(gatt, characteristic, status)
            val key = "read|${characteristic.service.uuid}|${characteristic.uuid}"
            if (status == BluetoothGatt.GATT_SUCCESS) {
                val data = characteristic.value
                if (data != null && data.size > 0) {
                    val value = bytesToString(data)
                    Log.d(TAG, "reading value: " + value)
                    resolve(key, value)
                } else {
                    reject(key, "No data received while reading characteristic.")
                }
            } else {
                reject(key, "Reading characteristic failed.")
            }
        }

        override fun onCharacteristicWrite(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                status: Int
        ) {
            super.onCharacteristicWrite(gatt, characteristic, status)
            val key = "write|${characteristic.service.uuid}|${characteristic.uuid}"
            if (status == BluetoothGatt.GATT_SUCCESS) {
                val data = characteristic.value
                if (data != null && data.size > 0) {
                    val value = bytesToString(data)
                    Log.d(TAG, "current value: " + value)
                }
                resolve(key, "Characteristic successfully written.")
            } else {
                reject(key, "Writing characteristic failed.")
            }

        }

        override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic
        ) {
            super.onCharacteristicChanged(gatt, characteristic)
            val notifyKey = "notification|${characteristic.service.uuid}|${characteristic.uuid}"
            val data = characteristic.value
            if (data != null && data.size > 0) {
                val value = bytesToString(data)
                Log.d(TAG, "characteristic changed, value: " + value)
                callbackMap[notifyKey]?.invoke(CallbackResponse(true, value))
            }
        }
    }

    private fun resolve(key: String, value: String) {
        if (callbackMap.containsKey(key)) {
            Log.d(TAG, "resolve: $key $value")
            callbackMap[key]?.invoke(CallbackResponse(true, value))
            callbackMap.remove(key)
            timeoutMap[key]?.removeCallbacksAndMessages(null)
            timeoutMap.remove(key)
        } else {
            Log.w(TAG, "Resolve callback not registered for key: $key")
        }
    }

    private fun reject(key: String, value: String) {
        if (callbackMap.containsKey(key)) {
            Log.d(TAG, "reject: $key $value")
            callbackMap[key]?.invoke(CallbackResponse(false, value))
            callbackMap.remove(key)
            timeoutMap[key]?.removeCallbacksAndMessages(null)
            timeoutMap.remove(key)
        } else {
            Log.w(TAG, "Reject callback not registered for key: $key")
        }
    }

    private fun bytesToString(bytes: ByteArray): String {
        val stringBuilder = StringBuilder(bytes.size)
        for (byte in bytes) {
            // byte to hex string
            stringBuilder.append(String.format("%02X ", byte))
        }
        return stringBuilder.toString()
    }

    private fun stringToBytes(value: String): ByteArray {
        val hexValues = value.split(" ")
        var bytes = ByteArray(hexValues.size)
        for (i in hexValues.indices) {
            bytes[i] = hexToByte(hexValues[i])
        }
        return bytes
    }

    private fun hexToByte(hexString: String): Byte {
        val firstDigit = toDigit(hexString[0])
        val secondDigit = toDigit(hexString[1])
        return ((firstDigit shl 4) + secondDigit).toByte()
    }

    private fun toDigit(hexChar: Char): Int {
        val digit = Character.digit(hexChar, 16)
        require(digit != -1) { "Invalid Hexadecimal Character: $hexChar" }
        return digit
    }

    private fun setTimeout(key: String, message: String, timeout: Long = 5000) {
        val handler = Handler()
        timeoutMap.put(key, handler)
        handler.postDelayed({
            reject(key, message)
        }, timeout)
    }

    fun getId(): String {
        return address
    }

    /**
     * Async actions that will be executed (see gattCallback)
     * - connect to gatt server
     * - discover services
     * - request MTU
     */
    fun connect(callback: (CallbackResponse) -> Unit) {
        callbackMap.put("connect", callback)
        bluetoothGatt = device.connectGatt(activity.applicationContext, false, gattCallback)
        connectionState = STATE_CONNECTING
        setTimeout("connect", "Connection timeout.", 7500)
    }

    fun isConnected(): Boolean {
        return connectionState == STATE_CONNECTED
    }

    private fun requestMtu(mtu: Int) {
        Log.d(TAG, "requestMtu " + mtu)
        val result = bluetoothGatt?.requestMtu(mtu)
        if (result != true) {
            reject("connect", "Starting requestMtu failed.")
        }
    }

    fun disconnect(callback: (CallbackResponse) -> Unit) {
        callbackMap.put("disconnect", callback)
        if (bluetoothGatt == null) {
            reject("disconnect", "Not connected to any device.")
        }
        bluetoothGatt?.disconnect()
        setTimeout("disconnect", "Disconnection timeout.")
    }

    fun close() {
        bluetoothGatt?.close()
        bluetoothGatt = null
    }

    fun read(serviceUUID: UUID, characteristicUUID: UUID, callback: (CallbackResponse) -> Unit) {
        val key = "read|$serviceUUID|$characteristicUUID"
        callbackMap.put(key, callback)
        val service = bluetoothGatt?.getService(serviceUUID)
        val characteristic = service?.getCharacteristic(characteristicUUID)
        if (characteristic != null) {
            val result = bluetoothGatt?.readCharacteristic(characteristic)
            if (result != true) {
                reject(key, "Reading characteristic failed.")
            }
        } else {
            reject(key, "Characteristic not found.")
        }
        setTimeout(key, "Read timeout.")
    }

    fun write(serviceUUID: UUID, characteristicUUID: UUID, value: String, callback: (CallbackResponse) -> Unit) {
        val key = "write|$serviceUUID|$characteristicUUID"
        callbackMap.put(key, callback)
        val service = bluetoothGatt?.getService(serviceUUID)
        val characteristic = service?.getCharacteristic(characteristicUUID)
        if (characteristic != null) {
            Log.d(TAG, "writing value: " + value)
            val bytes = stringToBytes(value)
            Log.d(TAG, "writing value check: " + bytesToString(bytes))
            characteristic.setValue(bytes)
            characteristic.writeType = WRITE_TYPE_DEFAULT
            val result = bluetoothGatt?.writeCharacteristic(characteristic)
            if (result != true) {
                reject(key, "Writing characteristic failed.")
            }
        } else {
            reject(key, "Characteristic not found.")
        }
        setTimeout(key, "Write timeout.")
    }

    fun setNotifications(
            serviceUUID: UUID,
            characteristicUUID: UUID,
            enable: Boolean,
            notifyCallback: ((CallbackResponse) -> Unit)?,
            callback: (CallbackResponse) -> Unit,
    ) {
        val key = "setNotifications|$serviceUUID|$characteristicUUID"
        val notifyKey = "notification|$serviceUUID|$characteristicUUID"
        callbackMap.put(key, callback)
        if (notifyCallback != null) {
            callbackMap.put(notifyKey, notifyCallback)
        }
        val service = bluetoothGatt?.getService(serviceUUID)
        val characteristic = service?.getCharacteristic(characteristicUUID)
        if (characteristic != null) {
            val result = bluetoothGatt?.setCharacteristicNotification(characteristic, enable)
            val descriptor = characteristic.getDescriptor(UUID.fromString(CLIENT_CHARACTERISTIC_CONFIG))
            if (enable) {
                if ((characteristic.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0) {
                    descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                } else if ((characteristic.properties and BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0) {
                    descriptor.value = BluetoothGattDescriptor.ENABLE_INDICATION_VALUE
                }
            } else {
                descriptor.value = BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE
            }
            val resultDesc = bluetoothGatt?.writeDescriptor(descriptor)
            if (result == true && resultDesc == true) {
                if (enable) {
                    resolve(key, "Notification enabled.")
                } else {
                    resolve(key, "Notification disabled.")
                }
            } else {
                reject(key, "Setting notification failed.")
            }
        } else {
            reject(key, "Characteristic not found.")
        }
        setTimeout(key, "Set notifications timeout.")
    }
}