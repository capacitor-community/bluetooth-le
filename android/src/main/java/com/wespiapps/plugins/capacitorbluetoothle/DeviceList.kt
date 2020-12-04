package com.wespiapps.plugins.capacitorbluetoothle

import android.bluetooth.BluetoothDevice
import java.util.ArrayList

class DeviceList {
    private val devices: ArrayList<BluetoothDevice> = ArrayList()

    fun addDevice(device: BluetoothDevice): Boolean {
        if (!devices.contains(device)) {
            devices.add(device)
            return true
        } else {
            return false
        }
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