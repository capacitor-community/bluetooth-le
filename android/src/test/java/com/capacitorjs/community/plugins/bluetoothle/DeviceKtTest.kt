package com.capacitorjs.community.plugins.bluetoothle

import java.util.concurrent.ConcurrentHashMap
import junit.framework.TestCase

class DeviceKtTest : TestCase() {

    fun testGattStatusName() {
        assertEquals("GATT_SUCCESS", gattStatusName(0))
        assertEquals("GATT_CONN_TIMEOUT", gattStatusName(8))
        assertEquals("GATT_ERROR", gattStatusName(133))
        assertEquals("unnamed", gattStatusName(42))
    }

    fun testTimeoutHandlerFiresWhileRegistered() {
        val timeoutMap = ConcurrentHashMap<String, TimeoutHandler>()
        var didRun = false
        val timeoutHandler = TimeoutHandler("connect", timeoutMap) {
            didRun = true
        }
        timeoutMap["connect"] = timeoutHandler

        timeoutHandler.run()

        assertTrue(didRun)
        assertFalse(timeoutMap.containsKey("connect"))
    }

    fun testTimeoutHandlerSkipsWhenAlreadySettled() {
        // The operation settled and removed the handler from the map before
        // the looper executed it.
        val timeoutMap = ConcurrentHashMap<String, TimeoutHandler>()
        var didRun = false
        val timeoutHandler = TimeoutHandler("connect", timeoutMap) {
            didRun = true
        }

        timeoutHandler.run()

        assertFalse(didRun)
    }

    fun testTimeoutHandlerSkipsWhenReplacedByNewerOperation() {
        // A newer operation registered its own timeout under the same key.
        // The stale handler must neither fire nor unregister the new one.
        val timeoutMap = ConcurrentHashMap<String, TimeoutHandler>()
        var staleRan = false
        var currentRan = false
        val staleHandler = TimeoutHandler("connect", timeoutMap) {
            staleRan = true
        }
        val currentHandler = TimeoutHandler("connect", timeoutMap) {
            currentRan = true
        }
        timeoutMap["connect"] = currentHandler

        staleHandler.run()

        assertFalse(staleRan)
        assertFalse(currentRan)
        assertSame(currentHandler, timeoutMap["connect"])

        currentHandler.run()

        assertTrue(currentRan)
        assertFalse(timeoutMap.containsKey("connect"))
    }
}
