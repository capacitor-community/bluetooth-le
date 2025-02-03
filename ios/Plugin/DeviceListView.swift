import UIKit

class DeviceListView: UIViewController, UITableViewDelegate, UITableViewDataSource {

    private let tableView = UITableView()
    private let cancelButton = UIButton(type: .system)
    private let titleLabel = UILabel()
    private let progressIndication = UIActivityIndicatorView()
    private var onCancel: (() -> Void)?
    private var devices: [(name: String, action: () -> Void)] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        isModalInPresentation = true // don't allow drag to dismiss
        setupUI()
        addBlurBackground()
    }

    func setTitle(_ title: String?) {
        titleLabel.text = title
    }

    func setCancelButton(_ title: String?, action: @escaping () -> Void) {
        cancelButton.setTitle(title, for: .normal)
        self.onCancel = action
    }

    func addItem(_ name: String, action: @escaping () -> Void) {
        devices.append((name, action))
        tableView.reloadData()
    }
    
    private func addBlurBackground() {
        let blurEffect = UIBlurEffect(style: .systemChromeMaterial)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = view.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.insertSubview(blurView, at: 0)
    }

    private func setupUI() {
        titleLabel.textAlignment = .center
        titleLabel.font = UIFont.boldSystemFont(ofSize: 22)

        let titleStack = UIStackView(arrangedSubviews: [titleLabel, progressIndication])
        titleStack.axis = .horizontal
        titleStack.alignment = .center
        titleStack.distribution = .fill
        titleStack.spacing = 8
        titleStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleStack)

        progressIndication.translatesAutoresizingMaskIntoConstraints = false
        progressIndication.startAnimating()
        progressIndication.hidesWhenStopped = true
        progressIndication.setContentHuggingPriority(.required, for: .horizontal)
        NSLayoutConstraint.activate([
            progressIndication.widthAnchor.constraint(equalToConstant: 22),
            progressIndication.heightAnchor.constraint(equalToConstant: 22)
        ])

        tableView.backgroundColor = .clear
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
            titleStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 10),
            titleStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 30),
            titleStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -30),
            titleStack.heightAnchor.constraint(equalToConstant: 30),

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
        cell.textLabel?.textColor = .systemBlue
        cell.textLabel?.backgroundColor = .clear
        cell.backgroundColor = .clear
        cell.contentView.backgroundColor = .clear
        cell.textLabel?.textAlignment = .center
        cell.selectionStyle = .default
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        devices[indexPath.row].action() // Execute closure action
        dismiss(animated: true) // Optionally close the popover
    }
}
