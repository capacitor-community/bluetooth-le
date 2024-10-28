package com.capacitorjs.community.plugins.bluetoothle

import junit.framework.TestCase

fun byteArrayOfInts(vararg ints: Int) = ByteArray(ints.size) { pos -> ints[pos].toByte() }

class ConversionKtTest : TestCase() {

    fun testBytesToString() {
        val input = byteArrayOfInts(0xA1, 0x2E, 0x38, 0xD4, 0x89, 0xC3)
        val output = bytesToString(input)
        assertEquals("A12E38D489C3", output)
    }

    fun testEmptyBytesToString() {
        val input = ByteArray(0)
        val output = bytesToString(input)
        assertEquals(output, "")
    }

    fun testStringToBytes() {
        val input = "A1 2E 38 D4 89 C3"
        val output = stringToBytes(input)
        val expected = byteArrayOfInts(0xA1, 0x2E, 0x38, 0xD4, 0x89, 0xC3)
        expected.forEachIndexed { index, byte ->
            assertEquals(byte, output[index])
        }
    }

    fun testEmptyStringToBytes() {
        val input = ""
        val output = stringToBytes(input)
        assertEquals(output.size, 0)
    }

    fun testHexToByte() {
        assertEquals(0.toByte(), hexToByte("00"))
        assertEquals(205.toByte(), hexToByte("CD"))
    }
}