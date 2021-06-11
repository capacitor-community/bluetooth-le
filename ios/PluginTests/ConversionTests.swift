import Foundation
import CoreBluetooth
import XCTest
@testable import Plugin

class ConversionTests: XCTestCase {

    func testDataToString() throws {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        let input = Data([0xA1, 0x2E, 0x38, 0xD4, 0x89, 0xC3])
        let output = dataToString(input)
        XCTAssertEqual("a1 2e 38 d4 89 c3 ", output)
    }

    func testStringToData() throws {
        let input = "a1 2e 38 d4 89 c3"
        let output = stringToData(input)
        let expected = Data([0xA1, 0x2E, 0x38, 0xD4, 0x89, 0xC3])
        for (index, byte) in output.enumerated() {
            XCTAssertEqual(byte, expected[index])
        }
    }

    func testEmptyStringToData() throws {
        let input = ""
        let output = stringToData(input)
        let expected = Data([0x00])
        for (index, byte) in output.enumerated() {
            XCTAssertEqual(byte, expected[index])
        }
    }

    func testCbuuidToString() throws {
        XCTAssertEqual("0000180d-0000-1000-8000-00805f9b34fb", cbuuidToString(CBUUID(string: "180D")))
        XCTAssertEqual("fb005c80-02e7-f387-1cad-8acd2d8df0c8", cbuuidToString(CBUUID(string: "fb005c80-02e7-f387-1cad-8acd2d8df0c8")))
    }

}
