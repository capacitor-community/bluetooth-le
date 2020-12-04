import Foundation
import Capacitor
import CoreBluetooth

class DeviceManager: NSObject, CBCentralManagerDelegate {
    typealias Callback = (_ success: Bool, _ message: String) -> Void

    private var centralManager: CBCentralManager!
    private var bridge: CAPBridge!
    private var displayStrings: [String: String]!
    private var callbackMap = [String: Callback]()
    private var timeoutMap = [String: DispatchWorkItem]()
    private var stopScanWorkItem: DispatchWorkItem?
    private var alertController: UIAlertController?
    private let scanDuration: Double = 30
    private var discoveredDevices = [String: Device]()
    private var deviceNameFilter: String?

    init(_ bridge: CAPBridge, _ displayStrings: [String: String], _ callback: @escaping Callback) {
        super.init()
        self.bridge = bridge
        self.displayStrings = displayStrings
        self.callbackMap["initialize"] = callback
        self.centralManager = CBCentralManager(delegate: self, queue: DispatchQueue.main)
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        let key = "initialize"
        switch central.state {
        case .poweredOn:
            self.resolve(key, "BLE powered on")
        case .poweredOff:
            central.stopScan()
            self.reject(key, "BLE powered off")
        case .unsupported:
            self.reject(key, "BLE unsupported")
        default: break
        }
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
    
    private func setTimeout(_ key: String, _ message: String, _ timeout: Double = 5) {
        let workItem = DispatchWorkItem {
            self.reject(key, message)
        }
        self.timeoutMap[key] = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + timeout, execute: workItem)
    }

    func requestDevice(_ serviceUUIDs: [CBUUID], _ name: String?, _ callback: @escaping Callback) {
        self.callbackMap["requestDevice"] = callback
        print("serviceUUIDs", serviceUUIDs)
        if self.centralManager.isScanning == false {
            self.discoveredDevices = [String: Device]()
            self.deviceNameFilter = name
            self.showDeviceList()
            self.stopScanWorkItem = DispatchWorkItem {
                self.stopScan()
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + self.scanDuration, execute: self.stopScanWorkItem!)
            self.centralManager.scanForPeripherals(withServices: serviceUUIDs, options: [CBCentralManagerScanOptionAllowDuplicatesKey: false])
        } else {
            self.stopScan()
            self.reject("requestDevice", "Already scanning. Stopping now.")
        }
    }

    func stopScan() {
        print("Stop scanning.")
        self.centralManager.stopScan()
        self.stopScanWorkItem?.cancel()
        self.stopScanWorkItem = nil
        DispatchQueue.main.async { [weak self] in
            if self?.discoveredDevices.count == 0 {
                self?.alertController?.title = self?.displayStrings["noDeviceFound"] ?? "No device found"
            } else {
                self?.alertController?.title = self?.displayStrings["availableDevices"] ?? "Available devices"
            }
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
        guard peripheral.state != CBPeripheralState.connected else {
            print("found connected device", peripheral.name ?? "Unknown")
            // make sure we do not touch connected devices
            return
        }
        let device = Device(peripheral)
        guard self.discoveredDevices[device.getId()] == nil else {
            print("Device already known", device.getName())
            // overwrite previous device
            self.discoveredDevices[device.getId()] = device
            return
        }
        if self.deviceNameFilter != nil && self.deviceNameFilter != device.getName() {
            print("Device does not match name filter: ", device.getName())
            return
        }
        print("New device found: ", device.getName())
        self.discoveredDevices[device.getId()] = device

        DispatchQueue.main.async { [weak self] in
            self?.alertController?.addAction(UIAlertAction(title: device.getName(), style: UIAlertAction.Style.default, handler: { (_) -> Void in
                print("Selected device")
                self?.stopScan()
                self?.resolve("requestDevice", device.getId())
            }))
        }
    }

    func getDevice(_ deviceId: String) -> Device? {
        return self.discoveredDevices[deviceId]
    }

    func showDeviceList() {
        DispatchQueue.main.async { [weak self] in
            self?.alertController = UIAlertController(title: self?.displayStrings["scanning"] ?? "Scanning...", message: nil, preferredStyle: UIAlertController.Style.alert)
            self?.alertController?.addAction(UIAlertAction(title: self?.displayStrings["cancel"] ?? "Cancel", style: UIAlertAction.Style.cancel, handler: { (_) -> Void in
                print("Cancelled request device.")
                self?.stopScan()
                self?.reject("requestDevice", "requestDevice cancelled.")
            }))
            self?.bridge.viewController.present((self?.alertController)!, animated: true, completion: nil)
        }
    }

    func connect(_ device: Device, _ callback: @escaping Callback) {
        let key = "connect|\(device.getPeripheral().identifier.uuidString)"
        self.callbackMap[key] = callback
        print("Connecting to peripheral", device.getPeripheral())
        self.centralManager.connect(device.getPeripheral(), options: nil)
        self.setTimeout(key, "Connection timeout.", 7.5)
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("Connected to device", peripheral)
        let key = "connect|\(peripheral.identifier.uuidString)"
        peripheral.discoverServices(nil)
        self.resolve(key, "Successfully connected.")
        // will wait for services in plugin call
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        let key = "connect|\(peripheral.identifier.uuidString)"
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.reject(key, "Failed to connect.")
    }

    func disconnect(_ device: Device, _ callback: @escaping Callback) {
        let key = "disconnect|\(device.getPeripheral().identifier.uuidString)"
        self.callbackMap[key] = callback
        print("Disconnecting from peripheral", device.getPeripheral())
        self.centralManager.cancelPeripheralConnection(device.getPeripheral())
        self.setTimeout(key, "Disconnection timeout.")
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        let key = "disconnect|\(peripheral.identifier.uuidString)"
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully disconnected.")
    }
}
