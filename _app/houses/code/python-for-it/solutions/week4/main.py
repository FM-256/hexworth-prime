"""
IT Dashboard -- COP1034C Python for IT
Final Version (Week 4 Complete)

A command-line and GUI IT management tool that collects system info,
parses log files, manages a device inventory, and provides a desktop
interface. Built progressively across 4 weeks.

Usage:
    python main.py          # CLI mode (default)
    python main.py --gui    # GUI mode (Week 4)
"""

import sys

# ── Application Metadata ──────────────────────────────────────────
APP_NAME = "IT Dashboard"
VERSION = "1.0.0"

# ── Imports from project modules ──────────────────────────────────
from utils import (
    read_log_file,
    count_by_severity,
    get_unique_errors,
    read_config,
    parse_csv_devices
)
from models import Router, Switch, Firewall, DeviceManager


# ── CLI Menu System (Week 1) ──────────────────────────────────────

def show_menu():
    """Display the main menu options."""
    print(f"\n{'=' * 40}")
    print(f"  {APP_NAME} v{VERSION}")
    print(f"{'=' * 40}")
    print("  1. System Info")
    print("  2. Log Analyzer")
    print("  3. Device Inventory")
    print("  4. Config Viewer")
    print("  5. Search Devices")
    print("  6. Sort Devices")
    print("  7. Launch GUI")
    print("  8. Help")
    print("  9. Exit")
    print(f"{'=' * 40}")


def system_info():
    """Display basic system information (Week 1)."""
    import platform
    print("\n-- System Information --")
    print(f"  OS:       {platform.system()} {platform.release()}")
    print(f"  Machine:  {platform.machine()}")
    print(f"  Python:   {platform.python_version()}")
    print(f"  App:      {APP_NAME} v{VERSION}")


# ── Log Analysis (Week 2) ─────────────────────────────────────────

def log_analyzer():
    """Parse and analyze the server log file (Week 2)."""
    try:
        lines = read_log_file("data/server.log")
    except FileNotFoundError:
        print("Error: data/server.log not found.")
        print("Make sure the data/ folder exists with sample files.")
        return

    counts = count_by_severity(lines)
    unique_errors = get_unique_errors(lines)

    print("\n-- Log Analysis --")
    for severity, count in sorted(counts.items()):
        print(f"  {severity}: {count}")
    print(f"  Unique errors: {len(unique_errors)}")
    for err in unique_errors:
        print(f"    - {err}")

    # Find most common severity
    if counts:
        most_common = max(counts, key=counts.get)
        print(f"  Most common: {most_common} ({counts[most_common]})")


# ── Device Inventory (Week 3) ─────────────────────────────────────

def build_device_manager():
    """Create a DeviceManager and load devices from CSV (Weeks 2-3)."""
    dm = DeviceManager()

    try:
        devices = parse_csv_devices("data/devices.csv")
        for d in devices:
            # Create the appropriate device type based on CSV data
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
        # Fallback: add a few sample devices manually
        dm.add(Router("core-rtr-01", "10.0.0.1"))
        dm.add(Switch("dist-sw-01", "10.0.1.1"))
        dm.add(Firewall("fw-edge-01", "10.0.0.254"))

    return dm


def device_inventory(dm):
    """Display all devices in the inventory (Week 3)."""
    print("\n-- Device Inventory --")
    dm.list_all()
    print(f"\n  Total: {len(dm.devices)} devices")

    # Count by type
    types = {}
    for d in dm.devices:
        t = d.device_type
        types[t] = types.get(t, 0) + 1
    for t, count in sorted(types.items()):
        print(f"    {t}: {count}")


# ── Config Viewer (Week 2) ────────────────────────────────────────

def config_viewer():
    """Read and display the config file (Week 2)."""
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


# ── Search (Week 4) ───────────────────────────────────────────────

def search_devices(dm):
    """Search for a device by hostname (Week 4 -- linear search)."""
    query = input("  Enter hostname to search: ").strip()
    if not query:
        print("  No search term entered.")
        return

    # Linear search through devices
    found = dm.find(query)
    if found:
        print(f"  Found: {found}")
    else:
        print(f"  Device '{query}' not found.")


# ── Sort (Week 4) ─────────────────────────────────────────────────

def sort_devices(dm):
    """Sort and display devices by hostname (Week 4 -- bubble sort)."""
    if not dm.devices:
        print("  No devices to sort.")
        return

    # Copy the list so we don't modify the original
    devices = dm.devices[:]

    # Bubble sort by hostname
    n = len(devices)
    comparisons = 0
    for i in range(n):
        for j in range(0, n - i - 1):
            comparisons += 1
            if devices[j].hostname > devices[j + 1].hostname:
                devices[j], devices[j + 1] = devices[j + 1], devices[j]

    print("\n-- Devices (Sorted by Hostname) --")
    for d in devices:
        print(f"  {d}")
    print(f"\n  Sorted {n} devices in {comparisons} comparisons (bubble sort)")


# ── GUI Launch (Week 4) ───────────────────────────────────────────

def launch_gui(dm):
    """Launch the Tkinter GUI (Week 4)."""
    try:
        from gui import DashboardGUI
        DashboardGUI(dm)
    except ImportError:
        print("  Error: GUI module not available.")
        print("  Make sure gui.py is in the project directory.")
    except Exception as e:
        print(f"  Error launching GUI: {e}")


# ── Main Loop ─────────────────────────────────────────────────────

def main():
    """Main entry point -- runs the CLI menu loop."""
    print(f"{APP_NAME} v{VERSION}")
    print("Ready to build something great.")

    # Build the device manager on startup
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
            config_viewer()
        elif choice == "5":
            search_devices(dm)
        elif choice == "6":
            sort_devices(dm)
        elif choice == "7":
            launch_gui(dm)
        elif choice == "8":
            print(f"\n  {APP_NAME} v{VERSION}")
            print("  A CLI and GUI IT management tool.")
            print("  Built with Python for COP1034C.")
        elif choice == "9":
            print("  Goodbye!")
            running = False
        else:
            print("  Invalid option. Please enter 1-9.")


# ── Entry Point ───────────────────────────────────────────────────
if __name__ == "__main__":
    # Check for --gui flag to launch directly in GUI mode
    if "--gui" in sys.argv:
        dm = build_device_manager()
        launch_gui(dm)
    else:
        main()
