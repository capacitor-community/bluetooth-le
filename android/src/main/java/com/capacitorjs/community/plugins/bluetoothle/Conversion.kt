package com.capacitorjs.community.plugins.bluetoothle

// Create a LUT for high performance ByteArray conversion
val HEX_LOOKUP_TABLE = IntArray(256) {
    val hexChars = "0123456789ABCDEF"
    val h: Int = (hexChars[(it shr 4)].code shl 8)
    val l: Int = hexChars[(it and 0x0F)].code
    (h or l)
}

// Custom implementation of ByteArray.toHexString until stdlib stabilizes
private fun ByteArray.toHexString(): String {
    val result = CharArray(this.size * 2);
    var i = 0;
    for (byte in this) {
        val hx = HEX_LOOKUP_TABLE[byte.toInt() and 0xFF]
        result[i]   = (hx shr 8).toChar()
        result[i+1] = (hx and 0xFF).toChar()
        i+=2
    }
    return result.concatToString()
}

fun bytesToString(bytes: ByteArray): String {
    return bytes.toHexString()
}

fun stringToBytes(value: String): ByteArray {
    if (value == "") {
        return ByteArray(0)
    }
    require(value.length % 2 == 0) { "Input string must have an even length, not ${value.length}" }
    val bytes = ByteArray(value.length / 2)
    for (i in bytes.indices) {
        val hexPair = value.substring(i * 2, i * 2 + 2)
        bytes[i] = hexToByte(hexPair)
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
