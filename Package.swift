// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityBluetoothLe",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "CapacitorCommunityBluetoothLe",
            targets: ["BluetoothLe"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "9.0.0-alpha.6")
    ],
    targets: [
        .target(
            name: "BluetoothLe",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/BluetoothLe"),
        .testTarget(
            name: "BluetoothLeTests",
            dependencies: ["BluetoothLe"],
            path: "ios/Tests/BluetoothLeTests")
    ]
)