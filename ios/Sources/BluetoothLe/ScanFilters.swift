import Foundation
import CoreBluetooth

struct ManufacturerDataFilter {
    let companyIdentifier: UInt16
    let dataPrefix: Data?
    let mask: Data?
}

struct ServiceDataFilter {
    let serviceUuid: CBUUID
    let dataPrefix: Data?
    let mask: Data?
}

class ScanFilterUtils {

    static func passesManufacturerDataFilter(_ advertisementData: [String: Any], filters: [ManufacturerDataFilter]?) -> Bool {
        guard let filters = filters, !filters.isEmpty else {
            return true  // No filters means everything passes
        }

        guard let manufacturerData = advertisementData[CBAdvertisementDataManufacturerDataKey] as? Data,
              manufacturerData.count >= 2 else {
            return false  // If there's no valid manufacturer data, fail
        }

        let companyIdentifier = manufacturerData.prefix(2).withUnsafeBytes {
            $0.load(as: UInt16.self).littleEndian // Manufacturer ID is little-endian
        }

        let payload = Data(manufacturerData.dropFirst(2))

        for filter in filters {
            if filter.companyIdentifier != companyIdentifier {
                continue  // Skip if company ID does not match
            }

            if let dataPrefix = filter.dataPrefix {
                if payload.count < dataPrefix.count {
                    continue // Payload too short, does not match
                }

                if let mask = filter.mask {
                    // Validate that mask length matches dataPrefix length
                    if mask.count != dataPrefix.count {
                        continue // Skip this filter if mask length is invalid
                    }
                    var matches = true
                    for i in 0..<dataPrefix.count {
                        if (payload[i] & mask[i]) != (dataPrefix[i] & mask[i]) {
                            matches = false
                            break
                        }
                    }
                    if matches {
                        return true
                    }
                } else if payload.starts(with: dataPrefix) {
                    return true
                }
            } else {
                return true // Company ID matched, and no dataPrefix required
            }
        }

        return false  // If none matched, return false
    }

    static func passesServiceDataFilter(_ advertisementData: [String: Any], filters: [ServiceDataFilter]?) -> Bool {
        guard let filters = filters, !filters.isEmpty else {
            return true  // No filters means everything passes
        }

        guard let serviceDataDict = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data] else {
            return false  // If there's no service data, fail
        }

        for filter in filters {
            guard let serviceData = serviceDataDict[filter.serviceUuid] else {
                continue  // Skip if service UUID does not match
            }

            if let dataPrefix = filter.dataPrefix {
                if serviceData.count < dataPrefix.count {
                    continue // Service data too short, does not match
                }

                if let mask = filter.mask {
                    // Validate that mask length matches dataPrefix length
                    if mask.count != dataPrefix.count {
                        continue // Skip this filter if mask length is invalid
                    }
                    var matches = true
                    for i in 0..<dataPrefix.count {
                        if (serviceData[i] & mask[i]) != (dataPrefix[i] & mask[i]) {
                            matches = false
                            break
                        }
                    }
                    if matches {
                        return true
                    }
                } else if serviceData.starts(with: dataPrefix) {
                    return true
                }
            } else {
                return true // Service UUID matched, and no dataPrefix required
            }
        }

        return false  // If none matched, return false
    }
}
