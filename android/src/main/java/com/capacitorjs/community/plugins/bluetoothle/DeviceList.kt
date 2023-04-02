package com.capacitorjs.community.plugins.bluetoothle

import android.bluetooth.BluetoothDevice

class DeviceList {
    private val devices: ArrayList<BluetoothDevice> = ArrayList()

    fun addDevice(device: BluetoothDevice): Boolean {
        // contains compares devices by their address
        if (!devices.contains(device)) {
            devices.add(device)
            return true
        }
        return false
    }

    fun getDevice(index: Int): BluetoothDevice {
        return devices[index]
    }

    fun getCount(): Int {
        return devices.size
    }

    fun clear() {
        devices.clear()
    }
}
