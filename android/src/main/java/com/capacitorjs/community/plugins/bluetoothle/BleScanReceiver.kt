package com.capacitorjs.community.plugins.bluetoothle

import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.annotation.RequiresApi

@RequiresApi(Build.VERSION_CODES.O)
class BleScanReceiver : BroadcastReceiver() {
    companion object {
        var scanCallback: ScanCallback? = null  // Reference to the existing ScanCallback
        private val TAG = BleScanReceiver::class.java.simpleName
    }


    override fun onReceive(context: Context, intent: Intent) {
        val results = intent.getScanResults()


        results.forEach { result ->
                // Forward the results to the ScanCallback
                scanCallback?.onScanResult(ScanSettings.CALLBACK_TYPE_ALL_MATCHES, result)
            }
        }

    private fun Intent.getScanResults(): List<ScanResult> =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getParcelableArrayListExtra(
                BluetoothLeScanner.EXTRA_LIST_SCAN_RESULT,
                ScanResult::class.java,
            )
        } else {
            @Suppress("DEPRECATION")
            getParcelableArrayListExtra(BluetoothLeScanner.EXTRA_LIST_SCAN_RESULT)
        } ?: emptyList()
}
