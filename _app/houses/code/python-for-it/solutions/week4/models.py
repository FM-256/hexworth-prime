"""
models.py -- OOP classes for the IT Dashboard
Week 3: Classes, inheritance, polymorphism, manager pattern

Hierarchy:
    NetworkDevice (base)
        Router    -- has routes list
        Switch    -- has VLANs list
        Firewall  -- has rules list

    DeviceManager -- stores and manages a collection of devices
"""


# ── Base Class ────────────────────────────────────────────────────

class NetworkDevice:
    """
    Base class for all network devices.

    Attributes:
        hostname:    Device hostname (e.g., "core-rtr-01")
        ip:          IP address string (e.g., "10.0.0.1")
        device_type: Human-readable type name (set by subclasses)
        status:      Current status ("online", "offline", "maintenance")
        location:    Physical location description
    """

    def __init__(self, hostname, ip, device_type="unknown"):
        self.hostname = hostname
        self.ip = ip
        self.device_type = device_type
        self.status = "online"
        self.location = "unknown"

    def __str__(self):
        """Default string representation for all devices."""
        return f"{self.device_type}: {self.hostname} ({self.ip}) - {self.status}"

    def __repr__(self):
        return f"NetworkDevice('{self.hostname}', '{self.ip}')"


# ── Subclasses ────────────────────────────────────────────────────

class Router(NetworkDevice):
    """
    Router device with routing table support.

    Inherits from NetworkDevice. Adds a routes list for storing
    network destinations this router can reach.
    """

    def __init__(self, hostname, ip):
        super().__init__(hostname, ip, "router")
        self.routes = []

    def add_route(self, destination):
        """Add a route destination (e.g., '192.168.0.0/24')."""
        self.routes.append(destination)

    def __str__(self):
        return f"Router: {self.hostname} ({self.ip}) - {self.status} | routes: {len(self.routes)}"


class Switch(NetworkDevice):
    """
    Switch device with VLAN support.

    Inherits from NetworkDevice. Adds a VLANs list for storing
    configured VLAN IDs on this switch.
    """

    def __init__(self, hostname, ip):
        super().__init__(hostname, ip, "switch")
        self.vlans = []

    def add_vlan(self, vlan_id):
        """Add a VLAN ID (e.g., 10, 20, 100)."""
        self.vlans.append(vlan_id)

    def __str__(self):
        return f"Switch: {self.hostname} ({self.ip}) - {self.status} | vlans: {self.vlans}"


class Firewall(NetworkDevice):
    """
    Firewall device with rule management.

    Inherits from NetworkDevice. Adds a rules list for storing
    access control rules applied to this firewall.
    """

    def __init__(self, hostname, ip):
        super().__init__(hostname, ip, "firewall")
        self.rules = []

    def add_rule(self, rule):
        """Add an access rule (e.g., 'allow tcp 443 from any')."""
        self.rules.append(rule)

    def __str__(self):
        return f"Firewall: {self.hostname} ({self.ip}) - {self.status} | rules: {len(self.rules)}"


# ── Device Manager ────────────────────────────────────────────────

class DeviceManager:
    """
    Manages a collection of NetworkDevice objects.

    Provides CRUD operations and filtering. Works polymorphically --
    it does not need to know which specific subclass each device is.
    """

    def __init__(self):
        self.devices = []

    def add(self, device):
        """Add a device to the inventory."""
        self.devices.append(device)

    def remove(self, hostname):
        """Remove a device by hostname. Returns True if found."""
        for i, d in enumerate(self.devices):
            if d.hostname == hostname:
                self.devices.pop(i)
                return True
        return False

    def find(self, hostname):
        """Find a device by hostname. Returns the device or None."""
        for d in self.devices:
            if d.hostname == hostname:
                return d
        return None

    def list_all(self):
        """Print all devices using their __str__ method."""
        if not self.devices:
            print("  (no devices)")
            return
        for d in self.devices:
            print(f"  {d}")

    def get_by_type(self, device_type):
        """Return a list of devices matching the given type."""
        return [d for d in self.devices if d.device_type == device_type]

    def get_by_status(self, status):
        """Return a list of devices matching the given status."""
        return [d for d in self.devices if d.status == status]

    def get_summary(self):
        """
        Return a summary dict with counts and stats.

        Returns:
            dict with keys: total, online, offline, by_type
        """
        total = len(self.devices)
        online = len([d for d in self.devices if d.status == "online"])
        offline = len([d for d in self.devices if d.status == "offline"])

        by_type = {}
        for d in self.devices:
            by_type[d.device_type] = by_type.get(d.device_type, 0) + 1

        return {
            "total": total,
            "online": online,
            "offline": offline,
            "by_type": by_type
        }
