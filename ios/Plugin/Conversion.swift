import Foundation
import CoreBluetooth

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
    var str = uuid.uuidString.lowercased()
    if str.count == 4 {
        str = "0000" + str + "-0000-1000-8000-00805f9b34fb"
    }
    return str
}
