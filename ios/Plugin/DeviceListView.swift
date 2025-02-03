import UIKit

class DeviceListView: UIViewController, UITableViewDelegate, UITableViewDataSource {

    private let tableView = UITableView()
    private let cancelButton = UIButton(type: .system)
    private let titleLabel = UILabel()
    private var onCancel: (() -> Void)?
    private var devices: [(name: String, action: () -> Void)] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        isModalInPresentation = true // don't allow drag to dismiss
        setupUI()
    }

    func setTitle(_ title: String?) {
        titleLabel.text = title
    }

    func setCancelButton(_ title: String?, action: @escaping () -> Void) {
        cancelButton.setTitle(title, for: .normal)
    }

    func addItem(_ name: String, action: @escaping () -> Void) {
        devices.append((name, action))
        tableView.reloadData()
    }

    private func setupUI() {
        view.backgroundColor = .white
        titleLabel.textAlignment = .center
        titleLabel.font = UIFont.boldSystemFont(ofSize: 18)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleLabel)

        tableView.delegate = self
        tableView.dataSource = self
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        view.addSubview(tableView)

        // Cancel Button
        cancelButton.setTitleColor(.systemRed, for: .normal)
        cancelButton.addTarget(self, action: #selector(dismissPopover), for: .touchUpInside)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(cancelButton)

        NSLayoutConstraint.activate([
            // Title at the Top
            titleLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 10),
            titleLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            titleLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            titleLabel.heightAnchor.constraint(equalToConstant: 30),

            // TableView
            tableView.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 10),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 10),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -10),
            tableView.bottomAnchor.constraint(equalTo: cancelButton.topAnchor, constant: -10),

            // Cancel Button at the Bottom
            cancelButton.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            cancelButton.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            cancelButton.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -10),
            cancelButton.heightAnchor.constraint(equalToConstant: 40)
        ])
    }

    @objc private func dismissPopover() {
        onCancel?()
        dismiss(animated: true)
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return devices.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        cell.textLabel?.text = devices[indexPath.row].name
        cell.textLabel?.textAlignment = .center // Center text in cell
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        devices[indexPath.row].action() // Execute closure action
        dismiss(animated: true) // Optionally close the popover
    }
}
