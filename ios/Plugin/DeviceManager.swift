import Foundation
import CoreBluetooth

class DeviceManager: NSObject, CBCentralManagerDelegate {
    typealias Callback = (_ success: Bool, _ message: String) -> Void
    typealias StateReceiver = (_ enabled: Bool) -> Void
    typealias ScanResultCallback = (_ device: Device, _ advertisementData: [String: Any], _ rssi: NSNumber) -> Void

    private var centralManager: CBCentralManager!
    private var viewController: UIViewController?
    private var displayStrings: [String: String]!
    private var callbackMap = [String: Callback]()
    private var scanResultCallback: ScanResultCallback?
    private var stateReceiver: StateReceiver?
    private var timeoutMap = [String: DispatchWorkItem]()
    private var stopScanWorkItem: DispatchWorkItem?
    private var alertController: UIAlertController?
    private var discoveredDevices = [String: Device]()
    private var deviceNameFilter: String?
    private var deviceNamePrefixFilter: String?
    private var shouldShowDeviceList = false
    private var allowDuplicates = false

    init(_ viewController: UIViewController?, _ displayStrings: [String: String], _ callback: @escaping Callback) {
        super.init()
        self.viewController = viewController
        self.displayStrings = displayStrings
        self.callbackMap["initialize"] = callback
        self.centralManager = CBCentralManager(delegate: self, queue: DispatchQueue.main)
    }

    // initialize
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        let initializeKey = "initialize"
        switch central.state {
        case .poweredOn:
            self.resolve(initializeKey, "BLE powered on")
            self.emitState(enabled: true)
        case .poweredOff:
            self.stopScan()
            self.resolve(initializeKey, "BLE powered off")
            self.emitState(enabled: false)
        case .resetting:
            self.emitState(enabled: false)
        case .unauthorized:
            self.emitState(enabled: false)
        case .unsupported:
            self.reject(initializeKey, "BLE unsupported")
            self.emitState(enabled: false)
        case .unknown:
            self.emitState(enabled: false)
        default: break
        }
    }

    func getEnabled() -> Bool {
        return self.centralManager.state == CBManagerState.poweredOn
    }

    func registerStateReceiver( _ stateReceiver: @escaping StateReceiver) {
        self.stateReceiver = stateReceiver
    }

    func unregisterStateReceiver() {
        self.stateReceiver = nil
    }

    func emitState(enabled: Bool) {
        guard let stateReceiver = self.stateReceiver else { return }
        stateReceiver(enabled)
    }

    func startScanning(
        _ serviceUUIDs: [CBUUID],
        _ name: String?,
        _ namePrefix: String?,
        _ allowDuplicates: Bool,
        _ shouldShowDeviceList: Bool,
        _ scanDuration: Double?,
        _ callback: @escaping Callback,
        _ scanResultCallback: @escaping ScanResultCallback
    ) {
        self.callbackMap["startScanning"] = callback
        self.scanResultCallback = scanResultCallback

        if self.centralManager.isScanning == false {
            self.discoveredDevices = [String: Device]()
            self.shouldShowDeviceList = shouldShowDeviceList
            self.allowDuplicates = allowDuplicates
            self.deviceNameFilter = name
            self.deviceNamePrefixFilter = namePrefix

            if shouldShowDeviceList {
                self.showDeviceList()
            }

            if scanDuration != nil {
                self.stopScanWorkItem = DispatchWorkItem {
                    self.stopScan()
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + scanDuration!, execute: self.stopScanWorkItem!)
            }
            self.centralManager.scanForPeripherals(withServices: serviceUUIDs, options: [CBCentralManagerScanOptionAllowDuplicatesKey: allowDuplicates])

            if shouldShowDeviceList == false {
                self.resolve("startScanning", "Scan started.")
            }
        } else {
            self.stopScan()
            self.reject("startScanning", "Already scanning. Stopping now.")
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

    // didDiscover
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {

        guard peripheral.state != CBPeripheralState.connected else {
            print("found connected device", peripheral.name ?? "Unknown")
            // make sure we do not touch connected devices
            return
        }

        let isNew = self.discoveredDevices[peripheral.identifier.uuidString] == nil
        guard isNew || self.allowDuplicates else { return }

        guard self.passesNameFilter(peripheralName: peripheral.name) else { return }
        guard self.passesNamePrefixFilter(peripheralName: peripheral.name) else { return }

        let device = Device(peripheral)
        print("New device found: ", device.getName())
        self.discoveredDevices[device.getId()] = device

        if shouldShowDeviceList {
            DispatchQueue.main.async { [weak self] in
                self?.alertController?.addAction(UIAlertAction(title: device.getName(), style: UIAlertAction.Style.default, handler: { (_) -> Void in
                    print("Selected device")
                    self?.stopScan()
                    self?.resolve("startScanning", device.getId())
                }))
            }
        } else {
            if self.scanResultCallback != nil {
                self.scanResultCallback!(device, advertisementData, RSSI)
            }
        }
    }

    func showDeviceList() {
        DispatchQueue.main.async { [weak self] in
            self?.alertController = UIAlertController(title: self?.displayStrings["scanning"] ?? "Scanning...", message: nil, preferredStyle: UIAlertController.Style.alert)
            self?.alertController?.addAction(UIAlertAction(title: self?.displayStrings["cancel"] ?? "Cancel", style: UIAlertAction.Style.cancel, handler: { (_) -> Void in
                print("Cancelled request device.")
                self?.stopScan()
                self?.reject("startScanning", "requestDevice cancelled.")
            }))
            self?.viewController?.present((self?.alertController)!, animated: true, completion: nil)
        }
    }

    func getDevice(_ deviceId: String) -> Device? {
        return self.discoveredDevices[deviceId]
    }

    func connect(_ device: Device, _ callback: @escaping Callback) {
        let key = "connect|\(device.getId())"
        self.callbackMap[key] = callback
        print("Connecting to peripheral", device.getPeripheral())
        self.centralManager.connect(device.getPeripheral(), options: nil)
        self.setTimeout(key, "Connection timeout.", 7.5)
    }

    // didConnect
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("Connected to device", peripheral)
        let key = "connect|\(peripheral.identifier.uuidString)"
        peripheral.discoverServices(nil)
        self.resolve(key, "Successfully connected.")
        // will wait for services in plugin call
    }

    // didFailToConnect
    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        let key = "connect|\(peripheral.identifier.uuidString)"
        if error != nil {
            self.reject(key, error!.localizedDescription)
            return
        }
        self.reject(key, "Failed to connect.")
    }

    func setOnDisconnected(_ device: Device, _ callback: @escaping Callback) {
        let key = "onDisconnected|\(device.getId())"
        self.callbackMap[key] = callback
    }

    func disconnect(_ device: Device, _ callback: @escaping Callback) {
        let key = "disconnect|\(device.getId())"
        self.callbackMap[key] = callback
        print("Disconnecting from peripheral", device.getPeripheral())
        self.centralManager.cancelPeripheralConnection(device.getPeripheral())
        self.setTimeout(key, "Disconnection timeout.")
    }

    // didDisconnectPeripheral
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        let key = "disconnect|\(peripheral.identifier.uuidString)"
        let keyOnDisconnected = "onDisconnected|\(peripheral.identifier.uuidString)"
        self.resolve(keyOnDisconnected, "Disconnected.")
        if error != nil {
            print(error!.localizedDescription)
            self.reject(key, error!.localizedDescription)
            return
        }
        self.resolve(key, "Successfully disconnected.")
    }

    private func passesNameFilter(peripheralName: String?) -> Bool {
        guard let nameFilter = self.deviceNameFilter else { return true }
        guard let name = peripheralName else { return false }
        return name == nameFilter
    }

    private func passesNamePrefixFilter(peripheralName: String?) -> Bool {
        guard let prefix = self.deviceNamePrefixFilter else { return true }
        guard let name = peripheralName else { return false }
        return name.hasPrefix(prefix)
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
}
