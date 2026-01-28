import XCTest
import CoreBluetooth
@testable import Plugin

class ScanFiltersTests: XCTestCase {

    // MARK: - Manufacturer Data Filter Tests

    func testManufacturerDataFilter_InvalidMaskLength() {
        // Test that when mask.count != dataPrefix.count, the filter is skipped
        // and returns false (no match)

        // Create manufacturer data: 2 bytes company ID + 4 bytes payload
        var manufacturerData = Data()
        manufacturerData.append(contentsOf: [0x4C, 0x00]) // Apple company ID (0x004C in little-endian)
        manufacturerData.append(contentsOf: [0x01, 0x02, 0x03, 0x04]) // 4 bytes payload

        let advertisementData: [String: Any] = [
            CBAdvertisementDataManufacturerDataKey: manufacturerData
        ]

        // Create filter with dataPrefix of 4 bytes but mask of only 2 bytes
        // This should be skipped due to invalid mask length
        let dataPrefix = Data([0x01, 0x02, 0x03, 0x04]) // 4 bytes
        let mask = Data([0xFF, 0xFF]) // Only 2 bytes - invalid!

        let filter = ManufacturerDataFilter(
            companyIdentifier: 0x004C,
            dataPrefix: dataPrefix,
            mask: mask
        )

        // Should return false because the filter is skipped due to invalid mask
        let result = ScanFilterUtils.passesManufacturerDataFilter(advertisementData, filters: [filter])
        XCTAssertFalse(result, "Should return false when mask length doesn't match dataPrefix length")
    }

    func testManufacturerDataFilter_ValidMaskLength() {
        // Test the valid case where mask and dataPrefix have the same length
        var manufacturerData = Data()
        manufacturerData.append(contentsOf: [0x4C, 0x00]) // Apple company ID
        manufacturerData.append(contentsOf: [0x01, 0x02, 0x03, 0x04])

        let advertisementData: [String: Any] = [
            CBAdvertisementDataManufacturerDataKey: manufacturerData
        ]

        // Mask and dataPrefix have the same length - should work correctly
        let dataPrefix = Data([0x01, 0x02, 0x03, 0x04])
        let mask = Data([0xFF, 0xFF, 0xFF, 0xFF]) // Same length as dataPrefix

        let filter = ManufacturerDataFilter(
            companyIdentifier: 0x004C,
            dataPrefix: dataPrefix,
            mask: mask
        )

        let result = ScanFilterUtils.passesManufacturerDataFilter(advertisementData, filters: [filter])
        XCTAssertTrue(result, "Should match when mask and dataPrefix have same length")
    }

    func testManufacturerDataFilter_NoMask() {
        // Test without a mask - should use simple prefix matching
        var manufacturerData = Data()
        manufacturerData.append(contentsOf: [0x4C, 0x00])
        manufacturerData.append(contentsOf: [0x01, 0x02, 0x03, 0x04])

        let advertisementData: [String: Any] = [
            CBAdvertisementDataManufacturerDataKey: manufacturerData
        ]

        let dataPrefix = Data([0x01, 0x02])
        let filter = ManufacturerDataFilter(
            companyIdentifier: 0x004C,
            dataPrefix: dataPrefix,
            mask: nil // No mask
        )

        let result = ScanFilterUtils.passesManufacturerDataFilter(advertisementData, filters: [filter])
        XCTAssertTrue(result, "Should match with prefix matching when no mask is provided")
    }

    // MARK: - Service Data Filter Tests

    func testServiceDataFilter_InvalidMaskLength() {
        // Test that when mask.count != dataPrefix.count, the filter is skipped
        // and returns false (no match)

        let serviceUUID = CBUUID(string: "1234")
        let serviceData = Data([0x01, 0x02, 0x03, 0x04]) // 4 bytes

        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceDataKey: [serviceUUID: serviceData]
        ]

        // Create filter with dataPrefix of 4 bytes but mask of only 2 bytes
        // This should be skipped due to invalid mask length
        let dataPrefix = Data([0x01, 0x02, 0x03, 0x04]) // 4 bytes
        let mask = Data([0xFF, 0xFF]) // Only 2 bytes - invalid!

        let filter = ServiceDataFilter(
            serviceUuid: serviceUUID,
            dataPrefix: dataPrefix,
            mask: mask
        )

        // Should return false because the filter is skipped due to invalid mask
        let result = ScanFilterUtils.passesServiceDataFilter(advertisementData, filters: [filter])
        XCTAssertFalse(result, "Should return false when mask length doesn't match dataPrefix length")
    }

    func testServiceDataFilter_ValidMaskLength() {
        // Test the valid case where mask and dataPrefix have the same length
        let serviceUUID = CBUUID(string: "1234")
        let serviceData = Data([0x01, 0x02, 0x03, 0x04])

        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceDataKey: [serviceUUID: serviceData]
        ]

        let dataPrefix = Data([0x01, 0x02, 0x03, 0x04])
        let mask = Data([0xFF, 0xFF, 0xFF, 0xFF]) // Same length

        let filter = ServiceDataFilter(
            serviceUuid: serviceUUID,
            dataPrefix: dataPrefix,
            mask: mask
        )

        let result = ScanFilterUtils.passesServiceDataFilter(advertisementData, filters: [filter])
        XCTAssertTrue(result, "Should match when mask and dataPrefix have same length")
    }

    func testServiceDataFilter_NoMask() {
        // Test without a mask
        let serviceUUID = CBUUID(string: "1234")
        let serviceData = Data([0x01, 0x02, 0x03, 0x04])

        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceDataKey: [serviceUUID: serviceData]
        ]

        let dataPrefix = Data([0x01, 0x02])
        let filter = ServiceDataFilter(
            serviceUuid: serviceUUID,
            dataPrefix: dataPrefix,
            mask: nil
        )

        let result = ScanFilterUtils.passesServiceDataFilter(advertisementData, filters: [filter])
        XCTAssertTrue(result, "Should match with prefix matching when no mask is provided")
    }
}
