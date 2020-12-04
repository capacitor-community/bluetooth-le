package com.wespiapps.plugins.capacitorbluetoothle

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Handler
import android.util.Log
import android.widget.ArrayAdapter
import androidx.appcompat.app.AlertDialog


class ScanResponse(
        val success: Boolean,
        val message: String?,
        val device: BluetoothDevice?,
) {}

class DisplayStrings(
        val scanning: String,
        val cancel: String,
        val availableDevices: String,
        val noDeviceFound: String,
) {}

class DeviceScanner(
        private val context: Context,
        private val bluetoothAdapter: BluetoothAdapter,
        private val scanDuration: Long,
        private val displayStrings: DisplayStrings
) {
    companion object {
        private val TAG = DeviceScanner::class.java.simpleName
    }

    private var isScanning = false
    private val bluetoothLeScanner = bluetoothAdapter.bluetoothLeScanner
    private var savedCallback: ((ScanResponse) -> Unit)? = null
    private var adapter: ArrayAdapter<String>? = null
    private val deviceList = DeviceList()
    private var deviceStrings: ArrayList<String> = ArrayList()
    private var dialog: AlertDialog? = null
    private var dialogHandler = Handler()
    private var stopScanHandler: Handler? = null

    private val scanCallback: ScanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            super.onScanResult(callbackType, result)
            val isAdded = deviceList.addDevice(result.device)
            if (isAdded) {
                dialogHandler.post() {
                    deviceStrings.add("[${result.device.address}] ${result.device.name}")
                    adapter?.notifyDataSetChanged()
                }
            }
        }
    }

    private fun showDeviceList() {
        dialogHandler.post() {
            val builder = AlertDialog.Builder(context)
            builder.setTitle(displayStrings.scanning)
            builder.setCancelable(true)
            adapter = ArrayAdapter(
                    context,
                    android.R.layout.simple_selectable_list_item,
                    deviceStrings
            )
            builder.setAdapter(adapter) { dialog, index ->
                stopScanning()
                dialog.dismiss()
                val device = deviceList.getDevice(index)
                savedCallback?.invoke(ScanResponse(true, device.name, device))
                savedCallback = null
            }
            builder.setNegativeButton(displayStrings.cancel) { dialog, _ ->
                stopScanning()
                dialog.cancel()
                savedCallback?.invoke(ScanResponse(false,
                        "requestDevice cancelled.",
                        null))
                savedCallback = null
            }
            builder.setOnCancelListener() { dialog ->
                stopScanning()
                dialog.cancel()
                savedCallback?.invoke(ScanResponse(false,
                        "requestDevice cancelled.",
                        null))
                savedCallback = null
            }
            dialog = builder.create()
            dialog?.show()
        }
    }

    fun stopScanning() {
        stopScanHandler?.removeCallbacksAndMessages(null)
        stopScanHandler = null
        dialogHandler.post() {
            if (deviceList.getCount() == 0) {
                dialog?.setTitle(displayStrings.noDeviceFound)
            } else {
                dialog?.setTitle(displayStrings.availableDevices)
            }
        }
        Log.d(TAG, "Stop scanning.")
        isScanning = false
        bluetoothLeScanner?.stopScan(scanCallback)
    }

    fun requestDevice(filters: List<ScanFilter>, callback: (ScanResponse) -> Unit) {
        savedCallback = callback
        deviceList.clear()
        if (!isScanning) {
            stopScanHandler = Handler()
            stopScanHandler?.postDelayed(
                    {
                        stopScanning()
                    },
                    scanDuration
            )
            Log.d(TAG, "Start scanning.")
            isScanning = true
            if (filters.isNotEmpty()) {
                val settings = ScanSettings.Builder().build()
                bluetoothLeScanner?.startScan(filters, settings, scanCallback)
            } else {
                bluetoothLeScanner?.startScan(scanCallback)
            }
            showDeviceList()
        } else {
            stopScanning()
            savedCallback?.invoke(ScanResponse(
                    false,
                    "Already scanning. Stopping now.",
                    null
            ))
            savedCallback = null
        }

    }
}