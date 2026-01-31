import Foundation

class ThreadSafeDictionary<K: Hashable, T> {
    private var dictionary: [K: T] = [:]
    private let queue = DispatchQueue(label: "threadSafeDictionaryQueue", attributes: .concurrent)

    subscript(key: K) -> T? {
        get {
            return queue.sync { dictionary[key] }
        }
        set {
            queue.async(flags: .barrier) { self.dictionary[key] = newValue }
        }
    }

    func removeValue(forKey key: K) -> T? {
        return queue.sync(flags: .barrier) {
            return dictionary.removeValue(forKey: key)
        }
    }

    var count: Int {
        return queue.sync { dictionary.count }
    }

    func removeAll() {
        queue.async(flags: .barrier) {
            self.dictionary.removeAll()
        }
    }

    /// Atomically gets existing value or inserts and returns new value
    /// The create closure is only called if the key doesn't exist
    /// Returns tuple of (value, wasInserted) where wasInserted indicates if a new value was created
    func getOrInsert(key: K, create: () -> T) -> (value: T, wasInserted: Bool) {
        return queue.sync(flags: .barrier) {
            if let existing = dictionary[key] {
                return (existing, false)
            }
            let newValue = create()
            dictionary[key] = newValue
            return (newValue, true)
        }
    }

    /// Atomically gets existing value (calling update on it) or inserts new value
    /// The create closure is only called if the key doesn't exist
    /// The update closure is called on existing values before returning
    /// Returns tuple of (value, wasInserted) where wasInserted indicates if a new value was created
    func getOrInsert(key: K, create: () -> T, update: (T) -> Void) -> (value: T, wasInserted: Bool) {
        return queue.sync(flags: .barrier) {
            if let existing = dictionary[key] {
                update(existing)
                return (existing, false)
            }
            let newValue = create()
            dictionary[key] = newValue
            return (newValue, true)
        }
    }
}
