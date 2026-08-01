package com.capacitorjs.community.plugins.bluetoothle

import java.util.concurrent.ConcurrentLinkedQueue
import junit.framework.TestCase

class DeviceKtTest : TestCase() {

    fun testGattStatusName() {
        assertEquals("GATT_SUCCESS", gattStatusName(0))
        assertEquals("GATT_CONN_TIMEOUT", gattStatusName(8))
        assertEquals("GATT_ERROR", gattStatusName(133))
        assertEquals("unnamed", gattStatusName(42))
    }

    fun testTimeoutHandlerRemovesItselfWhenItRuns() {
        val timeoutQueue = ConcurrentLinkedQueue<TimeoutHandler>()
        var didRun = false
        val timeoutHandler = TimeoutHandler("connect", timeoutQueue) {
            didRun = true
        }
        timeoutQueue.add(timeoutHandler)

        timeoutHandler.run()

        assertTrue(didRun)
        assertFalse(timeoutQueue.contains(timeoutHandler))
    }
}
