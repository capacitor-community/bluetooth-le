package com.capacitorjs.community.plugins.bluetoothle

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.ArrayAdapter
import com.getcapacitor.Logger


class ScanResponse(
    val success: Boolean,
    val message: String?,
    val device: BluetoothDevice?,
)

class DisplayStrings(
    val scanning: String,
    val cancel: String,
    val availableDevices: String,
    val noDeviceFound: String,
)

@SuppressLint("MissingPermission")
class DeviceScanner(
    private val context: Context,
    bluetoothAdapter: BluetoothAdapter,
    private val scanDuration: Long?,
    private val displayStrings: DisplayStrings,
    private val showDialog: Boolean,
) {
    companion object {
        private val TAG = DeviceScanner::class.java.simpleName
    }

    private var isScanning = false
    private val bluetoothLeScanner = bluetoothAdapter.bluetoothLeScanner
    private var savedCallback: ((ScanResponse) -> Unit)? = null
    private var scanResultCallback: ((ScanResult) -> Unit)? = null
    private var adapter: ArrayAdapter<String>? = null
    private val deviceList = DeviceList()
    private var deviceStrings: ArrayList<String> = ArrayList()
    private var dialog: AlertDialog? = null
    private var dialogHandler: Handler? = null
    private var stopScanHandler: Handler? = null
    private var allowDuplicates: Boolean = false
    private var namePrefix: String = ""

    private val scanCallback: ScanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            super.onScanResult(callbackType, result)
            if (namePrefix.isNotEmpty()) {
                if (result.device.name == null || !result.device.name.startsWith(namePrefix)) {
                    return
                }
            }
            val isNew = deviceList.addDevice(result.device)
            if (showDialog) {
                if (isNew) {
                    dialogHandler?.post {
                        deviceStrings.add("[${result.device.address}] ${result.device.name ?: "Unknown"}")
                        adapter?.notifyDataSetChanged()
                    }
                }
            } else {
                if (allowDuplicates || isNew) {
                    scanResultCallback?.invoke(result)
                }
            }
        }
    }

    fun startScanning(
        scanFilters: List<ScanFilter>,
        scanSettings: ScanSettings,
        allowDuplicates: Boolean,
        namePrefix: String,
        callback: (ScanResponse) -> Unit,
        scanResultCallback: ((ScanResult) -> Unit)?
    ) {
        this.savedCallback = callback
        this.scanResultCallback = scanResultCallback
        this.allowDuplicates = allowDuplicates
        this.namePrefix = namePrefix

        deviceStrings.clear()
        deviceList.clear()
        if (!isScanning) {
            setTimeoutForStopScanning()
            Logger.debug(TAG, "Start scanning.")
            isScanning = true
            bluetoothLeScanner?.startScan(scanFilters, scanSettings, scanCallback)
            if (showDialog) {
                dialogHandler = Handler(Looper.getMainLooper())
                showDeviceList()
            } else {
                savedCallback?.invoke(
                    ScanResponse(
                        true, "Started scanning.", null
                    )
                )
                savedCallback = null
            }
        } else {
            stopScanning()
            savedCallback?.invoke(
                ScanResponse(
                    false, "Already scanning. Stopping now.", null
                )
            )
            savedCallback = null
        }
    }

    fun stopScanning() {
        stopScanHandler?.removeCallbacksAndMessages(null)
        stopScanHandler = null
        if (showDialog) {
            dialogHandler?.post {
                if (deviceList.getCount() == 0) {
                    dialog?.setTitle(displayStrings.noDeviceFound)
                } else {
                    dialog?.setTitle(displayStrings.availableDevices)
                }
            }
        }
        Logger.debug(TAG, "Stop scanning.")
        isScanning = false
        bluetoothLeScanner?.stopScan(scanCallback)
    }

    private fun showDeviceList() {
        dialogHandler?.post {
            val builder = AlertDialog.Builder(context)
            builder.setTitle(displayStrings.scanning)
            builder.setCancelable(true)
            adapter = ArrayAdapter(
                context, android.R.layout.simple_selectable_list_item, deviceStrings
            )
            builder.setAdapter(adapter) { dialog, index ->
                stopScanning()
                dialog.dismiss()
                val device = deviceList.getDevice(index)
                savedCallback?.invoke(ScanResponse(true, device.address, device))
                savedCallback = null
            }
            builder.setNegativeButton(displayStrings.cancel) { dialog, _ ->
                stopScanning()
                dialog.cancel()
                savedCallback?.invoke(
                    ScanResponse(
                        false, "requestDevice cancelled.", null
                    )
                )
                savedCallback = null
            }
            builder.setOnCancelListener { dialog ->
                stopScanning()
                dialog.cancel()
                savedCallback?.invoke(
                    ScanResponse(
                        false, "requestDevice cancelled.", null
                    )
                )
                savedCallback = null
            }
            dialog = builder.create()
            dialog?.show()
        }
    }

    private fun setTimeoutForStopScanning() {
        if (scanDuration != null) {
            stopScanHandler = Handler(Looper.getMainLooper())
            stopScanHandler?.postDelayed(
                {
                    stopScanning()
                }, scanDuration
            )
        }
    }

}