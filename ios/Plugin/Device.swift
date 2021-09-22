import Foundation
import CoreBluetooth

class Device: NSObject, CBPeripheralDelegate {
    typealias Callback = (_ success: Bool, _ value: String) -> Void

    private var peripheral: CBPeripheral!
    private var callbackMap = [String: Callback]()
    private var timeoutMap = [String: DispatchWorkItem]()
    private var servicesCount = 0
    private var servicesDiscovered = 0

    init(_ peripheral: CBPeripheral) {
        super.init()
        self.peripheral = peripheral
        self.peripheral.delegate = self
    }

    func getName() -> String? {
        return self.peripheral.name
    }

    func getId() -> String {
        return self.peripheral.identifier.uuidString
    }

    func isConnected() -> Bool {
        return self.peripheral.state == CBPeripheralState.connected
    }

    func getPeripheral() -> CBPeripheral {
        return self.peripheral
    }

    func setOnConnected(_ callback: @escaping Callback) {
        let key = "connect"
        self.callbackMap[key] = callback
        self.setTimeout(key, "Connection timeout", connectionTimeout)
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        print("didDiscoverServices")
        if error != nil {
            print("Error", error!.localizedDescription)
            return
        }
        self.servicesCount = peripheral.services?.count ?? 0
        self.servicesDiscovered = 0
        for service in peripheral.services! {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        self.servicesDiscovered += 1
        print("didDiscoverCharacteristicsFor", self.servicesDiscovered, self.servicesCount)
        if self.servicesDiscovered >= self.servicesCount {
            self.resolve("connect", "Connection successful.")
        }
    }

    func readRssi(_ callback: @escaping Callback) {
        let key = "readRssi"
        self.callbackMap[key] = callback
        print("Reading RSSI value")
        self.peripheral.readRSSI()
        self.setTimeout(key, "Reading RSSI timeout.")
    }

    func peripheral(_ peripheral: CBPeripheral, didReadRSSI RSSI: NSNumber, error: Error?) {
        let key = "readRssi"
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, RSSI.stringValue)
    }

    private func getCharacteristic(_ serviceUUID: CBUUID, _ characteristicUUID: CBUUID) -> CBCharacteristic? {
        for service in peripheral.services ?? [] {
            if service.uuid == serviceUUID {
                for characteristic in service.characteristics ?? [] {
                    if characteristic.uuid == characteristicUUID {
                        return characteristic
                    }
                }
            }
        }
        return nil
    }

    func read(_ serviceUUID: CBUUID, _ characteristicUUID: CBUUID, _ callback: @escaping Callback) {
        let key = "read|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)"
        self.callbackMap[key] = callback
        guard let characteristic = self.getCharacteristic(serviceUUID, characteristicUUID) else {
            self.reject(key, "Characteristic not found.")
            return
        }
        print("Reading value")
        self.peripheral.readValue(for: characteristic)
        self.setTimeout(key, "Read timeout.")
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        let key = self.getKey("read", characteristic)
        let notifyKey = self.getKey("notification", characteristic)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        if characteristic.value == nil {
            self.reject(key, "Characterisitc contains no value.")
            return
        }
        // reading
        let valueString = dataToString(characteristic.value!)
        self.resolve(key, valueString)

        // notifications
        let callback = self.callbackMap[notifyKey]
        if callback != nil {
            callback!(true, valueString)
        }
    }

    func write(_ serviceUUID: CBUUID, _ characteristicUUID: CBUUID, _ value: String, _ writeType: CBCharacteristicWriteType, _ callback: @escaping Callback) {
        let key = "write|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)"
        self.callbackMap[key] = callback
        guard let characteristic = self.getCharacteristic(serviceUUID, characteristicUUID) else {
            self.reject(key, "Characteristic not found.")
            return
        }
        if value == "" {
            self.reject(key, "Invalid data.")
            return
        }
        let data: Data = stringToData(value)
        self.peripheral.writeValue(data, for: characteristic, type: writeType)
        if writeType == CBCharacteristicWriteType.withResponse {
            self.setTimeout(key, "Write timeout.")
        } else {
            self.resolve(key, "Successfully written value.")
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
        let key = self.getKey("write", characteristic)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully written value.")
    }

    func setNotifications(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ enable: Bool,
        _ notifyCallback: Callback?,
        _ callback: @escaping Callback
    ) {
        let key = "setNotifications|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)"
        let notifyKey = "notification|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)"
        self.callbackMap[key] = callback
        if notifyCallback != nil {
            self.callbackMap[notifyKey] = notifyCallback
        }
        guard let characteristic = self.getCharacteristic(serviceUUID, characteristicUUID) else {
            self.reject(key, "Characteristic not found.")
            return
        }
        print("Set notifications", enable)
        self.peripheral.setNotifyValue(enable, for: characteristic)
        self.setTimeout(key, "Set notifications timeout.")
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateNotificationStateFor characteristic: CBCharacteristic, error: Error?) {
        let key = self.getKey("setNotifications", characteristic)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully set notifications.")
    }

     private func getKey(_ prefix: String, _ characteristic: CBCharacteristic) -> String {
        let serviceUUIDString: String
        if (characteristic.service?.uuid == nil) {
            serviceUUIDString = "UNKNOWN-SERVICE"
        } else {
            serviceUUIDString = cbuuidToStringUppercase(characteristic.service!.uuid)
        }
        let characteristicUUIDString = cbuuidToStringUppercase(characteristic.uuid)
        return "\(prefix)|\(serviceUUIDString)|\(characteristicUUIDString)"
    }

    private func resolve(_ key: String, _ value: String) {
        let callback = self.callbackMap[key]
        if callback != nil {
            print("Resolve", key, value)
            callback!(true, value)
            self.callbackMap[key] = nil
            self.timeoutMap[key]?.cancel()
            self.timeoutMap[key] = nil
        } else {
            print("Resolve callback not registered for key: ", key)
        }
    }

    private func reject(_ key: String, _ value: String) {
        let callback = self.callbackMap[key]
        if callback != nil {
            print("Reject", key, value)
            callback!(false, value)
            self.callbackMap[key] = nil
            self.timeoutMap[key]?.cancel()
            self.timeoutMap[key] = nil
        } else {
            print("Reject callback not registered for key: ", key)
        }
    }

    private func setTimeout(_ key: String, _ message: String, _ timeout: Double = defaultTimeout) {
        let workItem = DispatchWorkItem {
            self.reject(key, message)
        }
        self.timeoutMap[key] = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + timeout, execute: workItem)
    }
}
