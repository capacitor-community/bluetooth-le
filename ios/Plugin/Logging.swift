import Capacitor

func log(_ items: Any..., separator: String = " ", terminator: String = "\n") {
    CAPLog.print("⚡️  BluetoothLe -", terminator: separator)
    for (itemIndex, item) in items.enumerated() {
        CAPLog.print(item, terminator: itemIndex == items.count - 1 ? terminator : separator)
    }
}
