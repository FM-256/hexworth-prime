"""
IT Dashboard -- COP1034C Python for IT
Week 1: CLI Skeleton

A command-line tool with a menu system, system info display,
and input validation. This is the foundation everything builds on.
"""

# ── Application Metadata ──────────────────────────────────────────
APP_NAME = "IT Dashboard"
VERSION = "0.1.0"


# ── System Info (Week 1) ──────────────────────────────────────────

def system_info():
    """Display basic system information."""
    import platform
    print("\n-- System Information --")
    print(f"  OS:       {platform.system()} {platform.release()}")
    print(f"  Machine:  {platform.machine()}")
    print(f"  Python:   {platform.python_version()}")
    print(f"  App:      {APP_NAME} v{VERSION}")


# ── Menu System (Week 1) ──────────────────────────────────────────

def show_menu():
    """Display the main menu options."""
    print(f"\n{'=' * 40}")
    print(f"  {APP_NAME} v{VERSION}")
    print(f"{'=' * 40}")
    print("  1. System Info")
    print("  2. Help")
    print("  3. Exit")
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
            print(f"\n  {APP_NAME} v{VERSION}")
            print("  A CLI IT management tool.")
            print("  Built with Python for COP1034C.")
        elif choice == "3":
            print("  Goodbye!")
            running = False
        else:
            print("  Invalid option. Please enter 1-3.")


# ── Entry Point ───────────────────────────────────────────────────
if __name__ == "__main__":
    main()
