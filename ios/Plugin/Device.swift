// swiftlint:disable type_body_length
import Foundation
import CoreBluetooth

class Device: NSObject, CBPeripheralDelegate {
    typealias Callback = (_ success: Bool, _ value: String) -> Void

    private var peripheral: CBPeripheral!
    private var callbackMap = ThreadSafeDictionary<String,Callback>()
    private var timeoutMap = [String: DispatchWorkItem]()
    private var servicesCount = 0
    private var servicesDiscovered = 0
    private var characteristicsCount = 0
    private var characteristicsDiscovered = 0

    init(
        _ peripheral: CBPeripheral
    ) {
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

    func setOnConnected(
        _ connectionTimeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "connect"
        self.callbackMap[key] = callback
        self.setTimeout(key, "Connection timeout", connectionTimeout)
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didDiscoverServices error: Error?
    ) {
        log("didDiscoverServices")
        if error != nil {
            log("Error", error!.localizedDescription)
            return
        }
        self.servicesCount = peripheral.services?.count ?? 0
        self.servicesDiscovered = 0
        self.characteristicsCount = 0
        self.characteristicsDiscovered = 0
        for service in peripheral.services ?? [] {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didDiscoverCharacteristicsFor service: CBService,
        error: Error?
    ) {
        self.servicesDiscovered += 1
        log("didDiscoverCharacteristicsFor", self.servicesDiscovered, self.servicesCount)
        self.characteristicsCount += service.characteristics?.count ?? 0
        for characteristic in service.characteristics ?? [] {
            peripheral.discoverDescriptors(for: characteristic)
        }
        // if the last service does not have characteristics, resolve the connect call now
        if self.servicesDiscovered >= self.servicesCount && self.characteristicsDiscovered >= self.characteristicsCount {
            self.resolve("connect", "Connection successful.")
            self.resolve("discoverServices", "Services discovered.")
        }
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didDiscoverDescriptorsFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        self.characteristicsDiscovered += 1
        if self.servicesDiscovered >= self.servicesCount && self.characteristicsDiscovered >= self.characteristicsCount {
            self.resolve("connect", "Connection successful.")
            self.resolve("discoverServices", "Services discovered.")
        }
    }

    func getServices() -> [CBService] {
        return self.peripheral.services ?? []
    }

    func discoverServices(
        _ timeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "discoverServices"
        self.callbackMap[key] = callback
        self.peripheral.discoverServices(nil)
        self.setTimeout(key, "Service discovery timeout.", timeout)
    }

    func getMtu() -> Int {
        // maximumWriteValueLength is 3 bytes less than ATT MTU
        return self.peripheral.maximumWriteValueLength(for: .withoutResponse) + 3
    }

    func readRssi(
        _ timeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "readRssi"
        self.callbackMap[key] = callback
        log("Reading RSSI value")
        self.peripheral.readRSSI()
        self.setTimeout(key, "Reading RSSI timeout.", timeout)
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didReadRSSI RSSI: NSNumber,
        error: Error?
    ) {
        let key = "readRssi"
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, RSSI.stringValue)
    }

    private func getCharacteristic(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID
    ) -> CBCharacteristic? {
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

    private func getDescriptor(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ descriptorUUID: CBUUID
    ) -> CBDescriptor? {
        guard let characteristic = self.getCharacteristic(serviceUUID, characteristicUUID) else {
            return nil
        }
        for descriptor in characteristic.descriptors ?? [] {
            if descriptor.uuid == descriptorUUID {
                return descriptor
            }
        }
        return nil
    }

    func read(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ timeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "read|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)"
        self.callbackMap[key] = callback
        guard let characteristic = self.getCharacteristic(serviceUUID, characteristicUUID) else {
            self.reject(key, "Characteristic not found.")
            return
        }
        log("Reading value")
        self.peripheral.readValue(for: characteristic)
        self.setTimeout(key, "Read timeout.", timeout)
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didUpdateValueFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        let key = self.getKey("read", characteristic)
        let notifyKey = self.getKey("notification", characteristic)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        if characteristic.value == nil {
            self.reject(key, "Characteristic contains no value.")
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

    func readDescriptor(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ descriptorUUID: CBUUID,
        _ timeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "readDescriptor|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)|\(descriptorUUID.uuidString)"
        self.callbackMap[key] = callback
        guard let descriptor = self.getDescriptor(serviceUUID, characteristicUUID, descriptorUUID) else {
            self.reject(key, "Descriptor not found.")
            return
        }
        log("Reading descriptor value")
        self.peripheral.readValue(for: descriptor)
        self.setTimeout(key, "Read descriptor timeout.", timeout)
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didUpdateValueFor descriptor: CBDescriptor,
        error: Error?
    ) {
        let key = self.getKey("readDescriptor", descriptor)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        if descriptor.value == nil {
            self.reject(key, "Descriptor contains no value.")
            return
        }
        let valueString = descriptorValueToString(descriptor.value!)
        self.resolve(key, valueString)
    }

    func write(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ value: String,
        _ writeType: CBCharacteristicWriteType,
        _ timeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "write|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)"
        self.callbackMap[key] = callback
        guard let characteristic = self.getCharacteristic(serviceUUID, characteristicUUID) else {
            self.reject(key, "Characteristic not found.")
            return
        }
        let data: Data = stringToData(value)
        self.peripheral.writeValue(data, for: characteristic, type: writeType)
        if writeType == CBCharacteristicWriteType.withResponse {
            self.setTimeout(key, "Write timeout.", timeout)
        } else {
            self.resolve(key, "Successfully written value.")
        }
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didWriteValueFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        let key = self.getKey("write", characteristic)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully written value.")
    }

    func writeDescriptor(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ descriptorUUID: CBUUID,
        _ value: String,
        _ timeout: Double,
        _ callback: @escaping Callback
    ) {
        let key = "writeDescriptor|\(serviceUUID.uuidString)|\(characteristicUUID.uuidString)|\(descriptorUUID.uuidString)"
        self.callbackMap[key] = callback
        guard let descriptor = self.getDescriptor(serviceUUID, characteristicUUID, descriptorUUID) else {
            self.reject(key, "Descriptor not found.")
            return
        }
        let data: Data = stringToData(value)
        self.peripheral.writeValue(data, for: descriptor)
        self.setTimeout(key, "Write descriptor timeout.", timeout)
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didWriteValueFor descriptor: CBDescriptor,
        error: Error?
    ) {
        let key = self.getKey("writeDescriptor", descriptor)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully written descriptor value.")
    }

    func setNotifications(
        _ serviceUUID: CBUUID,
        _ characteristicUUID: CBUUID,
        _ enable: Bool,
        _ notifyCallback: Callback?,
        _ timeout: Double,
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
        log("Set notifications", enable)
        self.peripheral.setNotifyValue(enable, for: characteristic)
        self.setTimeout(key, "Set notifications timeout.", timeout)
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didUpdateNotificationStateFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        let key = self.getKey("setNotifications", characteristic)
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully set notifications.")
    }

    private func getKey(
        _ prefix: String,
        _ characteristic: CBCharacteristic?
    ) -> String {
        let serviceUUIDString: String
        let service: CBService? = characteristic?.service
        if service != nil {
            serviceUUIDString = cbuuidToStringUppercase(service!.uuid)
        } else {
            serviceUUIDString = "UNKNOWN-SERVICE"
        }
        let characteristicUUIDString: String
        if characteristic != nil {
            characteristicUUIDString = cbuuidToStringUppercase(characteristic!.uuid)
        } else {
            characteristicUUIDString = "UNKNOWN-CHARACTERISTIC"
        }
        return "\(prefix)|\(serviceUUIDString)|\(characteristicUUIDString)"
    }

    private func getKey(
        _ prefix: String,
        _ descriptor: CBDescriptor
    ) -> String {
        let baseKey = self.getKey(prefix, descriptor.characteristic)
        let descriptorUUIDString = cbuuidToStringUppercase(descriptor.uuid)
        return "\(baseKey)|\(descriptorUUIDString)"
    }

    private func resolve(
        _ key: String,
        _ value: String
    ) {
        let callback = self.callbackMap[key]
        if callback != nil {
            log("Resolve", key, value)
            callback!(true, value)
            self.callbackMap[key] = nil
            self.timeoutMap[key]?.cancel()
            self.timeoutMap[key] = nil
        }
    }

    private func reject(
        _ key: String,
        _ value: String
    ) {
        let callback = self.callbackMap[key]
        if callback != nil {
            log("Reject", key, value)
            callback!(false, value)
            self.callbackMap[key] = nil
            self.timeoutMap[key]?.cancel()
            self.timeoutMap[key] = nil
        }
    }

    private func setTimeout(
        _ key: String,
        _ message: String,
        _ timeout: Double
    ) {
        let workItem = DispatchWorkItem {
            self.reject(key, message)
        }
        self.timeoutMap[key] = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + timeout, execute: workItem)
    }
}
