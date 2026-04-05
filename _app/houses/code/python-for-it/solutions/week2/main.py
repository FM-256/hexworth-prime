"""
IT Dashboard -- COP1034C Python for IT
Week 2: Data-Driven CLI

Builds on Week 1 by adding file I/O, log parsing, config reading,
and CSV device loading. Menu expanded with new data processing features.
"""

# ── Application Metadata ──────────────────────────────────────────
APP_NAME = "IT Dashboard"
VERSION = "0.2.0"

# ── Imports from project modules (Week 2) ─────────────────────────
from utils import (
    read_log_file,
    count_by_severity,
    get_unique_errors,
    read_config,
    parse_csv_devices
)


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


# ── Device List (Week 2 -- dict-based, no OOP yet) ────────────────

def device_list():
    """Load and display devices from CSV."""
    try:
        devices = parse_csv_devices("data/devices.csv")
    except FileNotFoundError:
        print("Error: data/devices.csv not found.")
        return

    print(f"\n-- Device List ({len(devices)} devices) --")
    for d in devices:
        status_marker = "[OK]" if d["status"] == "online" else "[!!]"
        print(f"  {status_marker} {d['hostname']:20s} {d['ip_address']:16s} {d['device_type']}")

    # Count offline devices
    offline = [d for d in devices if d["status"] != "online"]
    if offline:
        print(f"\n  WARNING: {len(offline)} device(s) not online")


# ── Menu System ───────────────────────────────────────────────────

def show_menu():
    """Display the main menu options."""
    print(f"\n{'=' * 40}")
    print(f"  {APP_NAME} v{VERSION}")
    print(f"{'=' * 40}")
    print("  1. System Info")
    print("  2. Log Analyzer")
    print("  3. Device List")
    print("  4. Config Viewer")
    print("  5. Help")
    print("  6. Exit")
    print(f"{'=' * 40}")


def main():
    """Main entry point -- runs the CLI menu loop."""
    print(f"{APP_NAME} v{VERSION}")
    print("Ready to build something great.")

    running = True
    while running:
        show_menu()
        choice = input("  Select option: ").strip()

        if choice == "1":
            system_info()
        elif choice == "2":
            log_analyzer()
        elif choice == "3":
            device_list()
        elif choice == "4":
            config_viewer()
        elif choice == "5":
            print(f"\n  {APP_NAME} v{VERSION}")
            print("  A data-driven CLI IT management tool.")
            print("  Built with Python for COP1034C.")
        elif choice == "6":
            print("  Goodbye!")
            running = False
        else:
            print("  Invalid option. Please enter 1-6.")


# ── Entry Point ───────────────────────────────────────────────────
if __name__ == "__main__":
    main()
