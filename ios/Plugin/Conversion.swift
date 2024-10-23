import Foundation
import CoreBluetooth

func descriptorValueToString(_ value: Any) -> String {
    // https://developer.apple.com/documentation/corebluetooth/cbdescriptor
    if let str = value as? String {
        return dataToString(Data(str.utf8))
    }
    if let data = value as? Data {
        return dataToString(data)
    }
    if let num = value as? UInt16 {
        return dataToString(Data([UInt8(truncatingIfNeeded: num), UInt8(truncatingIfNeeded: num >> 8)]))
    }
    return ""
}

extension Data {
    func toHexString() -> String {
        let hexChars = Array("0123456789abcdef".utf8)
        if #available(iOS 14, *) {
            return String(unsafeUninitializedCapacity: self.count*2) { (ptr) -> Int in
                var strp = ptr.baseAddress!
                for byte in self {
                    strp[0] = hexChars[Int(byte >> 4)]
                    strp[1] = hexChars[Int(byte & 0xF)]
                    strp += 2
                }
                return 2 * self.count
            }
        } else {
            // Fallback implementation for iOS < 14, a bit slower
            var result = ""
            result.reserveCapacity(self.count * 2)
            for byte in self {
                let high = Int(byte >> 4)
                let low  = Int(byte & 0xF)
                result.append(Character(UnicodeScalar(hexChars[high])))
                result.append(Character(UnicodeScalar(hexChars[low])))
            }
            return result
        }
    }
}

func dataToString(_ data: Data) -> String {
    return data.toHexString()
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
