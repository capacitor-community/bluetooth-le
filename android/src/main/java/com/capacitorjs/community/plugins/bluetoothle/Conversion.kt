package com.capacitorjs.community.plugins.bluetoothle


fun bytesToString(bytes: ByteArray): String {
    val stringBuilder = StringBuilder(bytes.size)
    for (byte in bytes) {
        // byte to hex string
        stringBuilder.append(String.format("%02X ", byte))
    }
    return stringBuilder.toString()
}

fun stringToBytes(value: String): ByteArray {
    if (value == "") {
        return ByteArray(0)
    }
    val hexValues = value.split(" ")
    val bytes = ByteArray(hexValues.size)
    for (i in hexValues.indices) {
        bytes[i] = hexToByte(hexValues[i])
    }
    return bytes
}

fun hexToByte(hexString: String): Byte {
    val firstDigit = toDigit(hexString[0])
    val secondDigit = toDigit(hexString[1])
    return ((firstDigit shl 4) + secondDigit).toByte()
}

private fun toDigit(hexChar: Char): Int {
    val digit = Character.digit(hexChar, 16)
    require(digit != -1) { "Invalid Hexadecimal Character: $hexChar" }
    return digit
}
