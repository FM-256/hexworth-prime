"""
gui.py -- Tkinter GUI for the IT Dashboard
Week 4: Desktop interface with tabs, event handling, error handling

Provides a graphical front-end for the DeviceManager. Displays devices
in a list, allows searching, and shows summary statistics.

Usage:
    Called from main.py with: DashboardGUI(device_manager)
    Or standalone: python gui.py
"""

import tkinter as tk
from tkinter import ttk, messagebox


class DashboardGUI:
    """
    Main GUI application for the IT Dashboard.

    Creates a Tkinter window with:
        - Device list panel (left)
        - Detail panel (right)
        - Search bar (top)
        - Status bar (bottom)
    """

    def __init__(self, device_manager=None):
        """
        Initialize the GUI.

        Args:
            device_manager: A DeviceManager instance with loaded devices.
                            If None, creates an empty one.
        """
        # Import here to avoid circular imports when used standalone
        from models import DeviceManager
        self.dm = device_manager if device_manager else DeviceManager()

        # Create the main window
        self.root = tk.Tk()
        self.root.title("IT Dashboard v1.0.0")
        self.root.geometry("800x500")
        self.root.configure(bg="#1a1a2e")

        # Build the interface
        self._build_search_bar()
        self._build_main_area()
        self._build_status_bar()

        # Populate the device list
        self._refresh_device_list()
        self._update_status()

        # Start the event loop
        self.root.mainloop()

    # ── Search Bar ────────────────────────────────────────────────

    def _build_search_bar(self):
        """Create the search bar at the top of the window."""
        frame = tk.Frame(self.root, bg="#16213e", pady=8, padx=10)
        frame.pack(fill=tk.X)

        tk.Label(
            frame, text="Search:", bg="#16213e", fg="#e2e8f0",
            font=("Segoe UI", 10)
        ).pack(side=tk.LEFT, padx=(0, 8))

        self.search_var = tk.StringVar()
        self.search_entry = tk.Entry(
            frame, textvariable=self.search_var,
            bg="#0f3460", fg="#e2e8f0", insertbackground="#10b981",
            font=("Consolas", 10), relief=tk.FLAT, bd=4
        )
        self.search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.search_entry.bind("<Return>", self._on_search)

        tk.Button(
            frame, text="Search", command=self._on_search,
            bg="#10b981", fg="#000", font=("Segoe UI", 9, "bold"),
            relief=tk.FLAT, padx=12, cursor="hand2"
        ).pack(side=tk.LEFT, padx=(8, 0))

        tk.Button(
            frame, text="Clear", command=self._on_clear,
            bg="#4a5568", fg="#e2e8f0", font=("Segoe UI", 9),
            relief=tk.FLAT, padx=8, cursor="hand2"
        ).pack(side=tk.LEFT, padx=(4, 0))

    # ── Main Area ─────────────────────────────────────────────────

    def _build_main_area(self):
        """Create the main content area with device list and detail panel."""
        container = tk.Frame(self.root, bg="#1a1a2e")
        container.pack(fill=tk.BOTH, expand=True, padx=10, pady=(4, 0))

        # Left: Device list with scrollbar
        left = tk.Frame(container, bg="#16213e", bd=1, relief=tk.RIDGE)
        left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))

        tk.Label(
            left, text="Devices", bg="#16213e", fg="#10b981",
            font=("Segoe UI", 10, "bold"), anchor=tk.W, padx=8, pady=4
        ).pack(fill=tk.X)

        self.device_listbox = tk.Listbox(
            left, bg="#0f3460", fg="#e2e8f0", selectbackground="#10b981",
            selectforeground="#000", font=("Consolas", 9),
            relief=tk.FLAT, bd=4, activestyle="none"
        )
        self.device_listbox.pack(fill=tk.BOTH, expand=True, padx=4, pady=(0, 4))
        self.device_listbox.bind("<<ListboxSelect>>", self._on_device_select)

        # Right: Detail panel
        right = tk.Frame(container, bg="#16213e", bd=1, relief=tk.RIDGE, width=280)
        right.pack(side=tk.RIGHT, fill=tk.Y, padx=(5, 0))
        right.pack_propagate(False)

        tk.Label(
            right, text="Details", bg="#16213e", fg="#10b981",
            font=("Segoe UI", 10, "bold"), anchor=tk.W, padx=8, pady=4
        ).pack(fill=tk.X)

        self.detail_text = tk.Text(
            right, bg="#0f3460", fg="#e2e8f0", font=("Consolas", 9),
            relief=tk.FLAT, bd=4, wrap=tk.WORD, state=tk.DISABLED
        )
        self.detail_text.pack(fill=tk.BOTH, expand=True, padx=4, pady=(0, 4))

    # ── Status Bar ────────────────────────────────────────────────

    def _build_status_bar(self):
        """Create the status bar at the bottom of the window."""
        self.status_var = tk.StringVar(value="Ready")
        self.status_bar = tk.Label(
            self.root, textvariable=self.status_var,
            bg="#0f3460", fg="#94a3b8", font=("Segoe UI", 9),
            anchor=tk.W, padx=10, pady=4
        )
        self.status_bar.pack(fill=tk.X, side=tk.BOTTOM)

    # ── Event Handlers ────────────────────────────────────────────

    def _on_search(self, event=None):
        """Handle search button click or Enter key in search field."""
        query = self.search_var.get().strip().lower()
        if not query:
            self._refresh_device_list()
            return

        # Filter devices by hostname or IP containing the query
        filtered = [
            d for d in self.dm.devices
            if query in d.hostname.lower() or query in d.ip.lower()
        ]

        self.device_listbox.delete(0, tk.END)
        for d in filtered:
            self.device_listbox.insert(tk.END, f"{d.hostname} ({d.ip})")

        self.status_var.set(f"Found {len(filtered)} device(s) matching '{query}'")

    def _on_clear(self):
        """Clear search and show all devices."""
        self.search_var.set("")
        self._refresh_device_list()
        self._update_status()

    def _on_device_select(self, event):
        """Show details when a device is selected in the list."""
        selection = self.device_listbox.curselection()
        if not selection:
            return

        index = selection[0]
        # Map listbox index back to a device
        display_text = self.device_listbox.get(index)
        hostname = display_text.split(" (")[0]
        device = self.dm.find(hostname)

        if device:
            self._show_device_detail(device)

    # ── UI Updates ────────────────────────────────────────────────

    def _refresh_device_list(self):
        """Reload all devices into the listbox."""
        self.device_listbox.delete(0, tk.END)
        for d in self.dm.devices:
            self.device_listbox.insert(tk.END, f"{d.hostname} ({d.ip})")

    def _show_device_detail(self, device):
        """Display device details in the right panel."""
        self.detail_text.config(state=tk.NORMAL)
        self.detail_text.delete("1.0", tk.END)

        lines = [
            f"Hostname:  {device.hostname}",
            f"IP:        {device.ip}",
            f"Type:      {device.device_type}",
            f"Status:    {device.status}",
            f"Location:  {device.location}",
        ]

        # Add type-specific info
        if hasattr(device, "routes"):
            lines.append(f"\nRoutes:    {len(device.routes)}")
            for r in device.routes:
                lines.append(f"  - {r}")
        elif hasattr(device, "vlans"):
            lines.append(f"\nVLANs:     {device.vlans}")
        elif hasattr(device, "rules"):
            lines.append(f"\nRules:     {len(device.rules)}")
            for r in device.rules:
                lines.append(f"  - {r}")

        self.detail_text.insert("1.0", "\n".join(lines))
        self.detail_text.config(state=tk.DISABLED)

    def _update_status(self):
        """Update the status bar with summary info."""
        summary = self.dm.get_summary()
        self.status_var.set(
            f"Total: {summary['total']} | "
            f"Online: {summary['online']} | "
            f"Offline: {summary['offline']}"
        )


# ── Standalone Entry Point ────────────────────────────────────────

if __name__ == "__main__":
    # When run directly, create sample devices for testing
    from models import Router, Switch, Firewall, DeviceManager

    dm = DeviceManager()
    dm.add(Router("core-rtr-01", "10.0.0.1"))
    dm.add(Router("core-rtr-02", "10.0.0.2"))
    dm.add(Switch("dist-sw-01", "10.0.1.1"))
    dm.add(Switch("dist-sw-02", "10.0.2.1"))
    dm.add(Firewall("fw-edge-01", "10.0.0.254"))

    DashboardGUI(dm)
