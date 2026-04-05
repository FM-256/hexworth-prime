"""
IT Dashboard -- COP1034C Python for IT
Week 3: OOP Architecture

Builds on Week 2 by refactoring data structures into classes.
Device inventory now uses NetworkDevice/Router/Switch/Firewall
hierarchy with a DeviceManager for CRUD operations.
"""

# ── Application Metadata ──────────────────────────────────────────
APP_NAME = "IT Dashboard"
VERSION = "0.3.0"

# ── Imports ───────────────────────────────────────────────────────
from utils import (
    read_log_file,
    count_by_severity,
    get_unique_errors,
    read_config,
    parse_csv_devices
)
from models import Router, Switch, Firewall, DeviceManager


# ── System Info (Week 1) ──────────────────────────────────────────

def system_info():
    """Display basic system information."""
    import platform
    print("\n-- System Information --")
    print(f"  OS:       {platform.system()} {platform.release()}")
    print(f"  Machine:  {platform.machine()}")
    print(f"  Python:   {platform.python_version()}")
    print(f"  App:      {APP_NAME} v{VERSION}")


# ── Log Analysis (Week 2) ─────────────────────────────────────────

def log_analyzer():
    """Parse and analyze the server log file."""
    try:
        lines = read_log_file("data/server.log")
    except FileNotFoundError:
        print("Error: data/server.log not found.")
        return

    counts = count_by_severity(lines)
    unique_errors = get_unique_errors(lines)

    print("\n-- Log Analysis --")
    for severity, count in sorted(counts.items()):
        print(f"  {severity}: {count}")
    print(f"  Unique errors: {len(unique_errors)}")
    for err in unique_errors:
        print(f"    - {err}")

    if counts:
        most_common = max(counts, key=counts.get)
        print(f"  Most common: {most_common} ({counts[most_common]})")


# ── Config Viewer (Week 2) ────────────────────────────────────────

def config_viewer():
    """Read and display the config file."""
    try:
        config = read_config("data/config.ini")
    except FileNotFoundError:
        print("Error: data/config.ini not found.")
        return

    print("\n-- Configuration --")
    for section in config.sections():
        print(f"\n  [{section}]")
        for key, value in config.items(section):
            print(f"    {key} = {value}")


# ── Device Inventory (Week 3 -- OOP refactor) ─────────────────────

def build_device_manager():
    """Create a DeviceManager and load devices from CSV."""
    dm = DeviceManager()

    try:
        devices = parse_csv_devices("data/devices.csv")
        for d in devices:
            dtype = d["device_type"].lower()
            if dtype == "router":
                dev = Router(d["hostname"], d["ip_address"])
            elif dtype == "firewall":
                dev = Firewall(d["hostname"], d["ip_address"])
            else:
                dev = Switch(d["hostname"], d["ip_address"])

            dev.status = d.get("status", "unknown")
            dev.location = d.get("location", "unknown")
            dm.add(dev)
    except FileNotFoundError:
        print("Warning: data/devices.csv not found. Using sample devices.")
        dm.add(Router("core-rtr-01", "10.0.0.1"))
        dm.add(Switch("dist-sw-01", "10.0.1.1"))
        dm.add(Firewall("fw-edge-01", "10.0.0.254"))

    return dm


def device_inventory(dm):
    """Display all devices in the inventory."""
    print("\n-- Device Inventory --")
    dm.list_all()

    summary = dm.get_summary()
    print(f"\n  Total: {summary['total']} | Online: {summary['online']} | Offline: {summary['offline']}")

    # Show by type
    for t, count in sorted(summary["by_type"].items()):
        print(f"    {t}: {count}")


def device_by_type(dm):
    """Filter and show devices by type."""
    dtype = input("  Enter type (router/switch/firewall): ").strip().lower()
    filtered = dm.get_by_type(dtype)

    if filtered:
        print(f"\n-- {dtype.title()} Devices ({len(filtered)}) --")
        for d in filtered:
            print(f"  {d}")
    else:
        print(f"  No {dtype} devices found.")


# ── Menu System (expanded for Week 3) ─────────────────────────────

def show_menu():
    """Display the main menu options."""
    print(f"\n{'=' * 40}")
    print(f"  {APP_NAME} v{VERSION}")
    print(f"{'=' * 40}")
    print("  1. System Info")
    print("  2. Log Analyzer")
    print("  3. Device Inventory")
    print("  4. Filter by Type")
    print("  5. Config Viewer")
    print("  6. Help")
    print("  7. Exit")
    print(f"{'=' * 40}")


def main():
    """Main entry point -- runs the CLI menu loop."""
    print(f"{APP_NAME} v{VERSION}")
    print("Ready to build something great.")

    # Build the device manager on startup (Week 3 -- OOP)
    dm = build_device_manager()

    running = True
    while running:
        show_menu()
        choice = input("  Select option: ").strip()

        if choice == "1":
            system_info()
        elif choice == "2":
            log_analyzer()
        elif choice == "3":
            device_inventory(dm)
        elif choice == "4":
            device_by_type(dm)
        elif choice == "5":
            config_viewer()
        elif choice == "6":
            print(f"\n  {APP_NAME} v{VERSION}")
            print("  An OOP-architected IT management tool.")
            print("  Built with Python for COP1034C.")
        elif choice == "7":
            print("  Goodbye!")
            running = False
        else:
            print("  Invalid option. Please enter 1-7.")


# ── Entry Point ───────────────────────────────────────────────────
if __name__ == "__main__":
    main()
