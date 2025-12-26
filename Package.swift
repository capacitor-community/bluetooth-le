// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityBluetoothLe",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorCommunityBluetoothLe",
            targets: ["CapacitorCommunityBluetoothLe"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "CapacitorCommunityBluetoothLe",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin",
            exclude: ["Plugin.m", "Plugin.h", "Info.plist"]
        )
    ],
    swiftLanguageVersions: [.v5]
)
