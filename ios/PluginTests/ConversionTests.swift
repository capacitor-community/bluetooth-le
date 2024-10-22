import Foundation
import CoreBluetooth
import XCTest
@testable import Plugin

class ConversionTests: XCTestCase {

    func testDataToString() throws {
        let input = Data([0xA1, 0x2E, 0x38, 0xD4, 0x89, 0xC3])
        let output = dataToString(input)
        XCTAssertEqual(output, "a12e38d489c3")
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
        XCTAssertEqual(output, Data([]))
    }

    func testCbuuidToString() throws {
        XCTAssertEqual(cbuuidToString(CBUUID(string: "180D")), "0000180d-0000-1000-8000-00805f9b34fb")
        XCTAssertEqual(cbuuidToString(CBUUID(string: "AAAA180D")), "aaaa180d-0000-1000-8000-00805f9b34fb")
        XCTAssertEqual(cbuuidToString(CBUUID(string: "fb005c80-02e7-f387-1cad-8acd2d8df0c8")), "fb005c80-02e7-f387-1cad-8acd2d8df0c8")
    }

    func testCbuuidToStringUppercase() throws {
        XCTAssertEqual(cbuuidToStringUppercase(CBUUID(string: "180D")), "0000180D-0000-1000-8000-00805F9B34FB")
        XCTAssertEqual(cbuuidToStringUppercase(CBUUID(string: "fb005c80-02e7-f387-1cad-8acd2d8df0c8")), "FB005C80-02E7-F387-1CAD-8ACD2D8DF0C8")
    }

    func testOptionalStringConversion() throws {
        let str: String? = "180D"
        XCTAssertEqual("\(str)", "Optional(\"180D\")")
        XCTAssertEqual("\(str!)", "180D")
    }

    func testDescriptorValueToString() throws {
        XCTAssertEqual(descriptorValueToString("Hello"), "48656c6c6f")
        XCTAssertEqual(descriptorValueToString(Data([0, 5, 255])), "0005ff")
        XCTAssertEqual(descriptorValueToString(UInt16(258)), "0201")
        XCTAssertEqual(descriptorValueToString(UInt16(1)), "0100")
        XCTAssertEqual(descriptorValueToString(NSNumber(1)), "0100")
        XCTAssertEqual(descriptorValueToString(0), "")
    }

}
