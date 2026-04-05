"""
utils.py -- Helper functions for the IT Dashboard
Week 2: File I/O, string processing, data parsing

These functions handle all file reading and data processing.
The main module calls them without knowing the file format details.
"""

import configparser


# ── Log File Processing ───────────────────────────────────────────

def read_log_file(filepath):
    """
    Read a log file and return a list of non-empty lines.

    Each line is expected to follow the format:
        YYYY-MM-DD HH:MM:SS SEVERITY Message text

    Args:
        filepath: Path to the log file

    Returns:
        List of stripped, non-empty log lines

    Raises:
        FileNotFoundError: If the file does not exist
    """
    with open(filepath, "r") as f:
        lines = [line.strip() for line in f if line.strip()]
    return lines


def count_by_severity(lines):
    """
    Count log entries by severity level.

    Args:
        lines: List of log lines (from read_log_file)

    Returns:
        Dict mapping severity strings to counts
        Example: {"INFO": 4, "WARNING": 3, "ERROR": 3}
    """
    counts = {}
    for line in lines:
        parts = line.split()
        if len(parts) >= 3:
            severity = parts[2]
            counts[severity] = counts.get(severity, 0) + 1
    return counts


def get_unique_errors(lines):
    """
    Extract unique error messages from log lines.

    Only processes lines where severity is "ERROR" or "CRITICAL".
    The message is everything after the severity keyword.

    Args:
        lines: List of log lines (from read_log_file)

    Returns:
        Set of unique error message strings
    """
    errors = set()
    for line in lines:
        parts = line.split()
        if len(parts) >= 4 and parts[2] in ("ERROR", "CRITICAL"):
            # Join everything after the severity as the error message
            message = " ".join(parts[3:])
            errors.add(message)
    return errors


# ── Config File Processing ────────────────────────────────────────

def read_config(filepath):
    """
    Read an INI-format configuration file.

    Uses Python's configparser module for standard INI parsing.
    Supports [sections] with key = value pairs.

    Args:
        filepath: Path to the .ini config file

    Returns:
        configparser.ConfigParser object with loaded data

    Raises:
        FileNotFoundError: If the file does not exist
    """
    config = configparser.ConfigParser()
    # Read the file -- raises FileNotFoundError if missing
    with open(filepath, "r") as f:
        config.read_file(f)
    return config


# ── CSV Device Processing ─────────────────────────────────────────

def parse_csv_devices(filepath):
    """
    Parse a CSV file of network devices into a list of dicts.

    Expected CSV format (first row is headers):
        hostname,ip_address,device_type,location,status,os,last_seen

    Args:
        filepath: Path to the CSV file

    Returns:
        List of dicts, one per device, keyed by column headers

    Raises:
        FileNotFoundError: If the file does not exist
    """
    devices = []
    with open(filepath, "r") as f:
        # First line is the header row
        headers = f.readline().strip().split(",")
        for line in f:
            values = line.strip().split(",")
            if len(values) == len(headers):
                device = dict(zip(headers, values))
                devices.append(device)
    return devices


# ── String Utilities ──────────────────────────────────────────────

def validate_ip(ip_string):
    """
    Check if a string is a valid IPv4 address.

    Validates format (4 octets) and range (0-255 each).

    Args:
        ip_string: String to validate

    Returns:
        True if valid IPv4 address, False otherwise
    """
    parts = ip_string.split(".")
    if len(parts) != 4:
        return False
    for part in parts:
        try:
            num = int(part)
            if num < 0 or num > 255:
                return False
        except ValueError:
            return False
    return True


def format_report_line(label, value, width=30):
    """
    Format a label-value pair for report output.

    Args:
        label: Left-aligned label text
        value: Right-aligned value text
        width: Total line width (default 30)

    Returns:
        Formatted string like "Label............Value"
    """
    dots = "." * (width - len(str(label)) - len(str(value)))
    return f"{label}{dots}{value}"
