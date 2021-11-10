import Foundation
import CoreBluetooth

func descriptorValueToString(_ value: Any) -> String {
    if let str = value as? String {
        return str
    }
    if let data = value as? Data {
        return dataToString(data)
    }
    if let uuid = value as? CBUUID {
        return uuid.uuidString
    }
    return ""
}

func dataToString(_ data: Data) -> String {
    var valueString = ""
    for byte in data {
        valueString += String(format: "%02hhx ", byte)
    }
    return valueString
}

func stringToData(_ dataString: String) -> Data {
    let hexValues = dataString.split(separator: " ")
    var data = Data(capacity: hexValues.count)
    for hex in hexValues {
        data.append(UInt8(hex, radix: 16)!)
    }
    return data
}

func cbuuidToString(_ uuid: CBUUID) -> String {
    // declare as optional because of https://github.com/capacitor-community/bluetooth-le/issues/170
    let uuidString: String? = uuid.uuidString
    var str = uuidString!.lowercased()
    if str.count == 4 {
        str = "0000\(str)-0000-1000-8000-00805f9b34fb"
    } else if str.count == 8 {
        str = "\(str)-0000-1000-8000-00805f9b34fb"
    }
    return str
}

func cbuuidToStringUppercase(_ uuid: CBUUID) -> String {
    let str = cbuuidToString(uuid)
    return str.uppercased()
}
