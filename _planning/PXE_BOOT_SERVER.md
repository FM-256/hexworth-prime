# PXE Boot Server — Neon Server Infrastructure

## Status: SCOPED — Ready to Build

---

## Overview

Network boot server on neon-server enabling rapid OS deployment across lab machines. One image, infinite deployments. No USB drives, no manual installs.

---

## Server Specs (neon-server)

| Spec | Value |
|------|-------|
| Hostname | neon-server |
| OS | Ubuntu 24.04.2 LTS |
| RAM | 40 GB |
| Primary Disk | 6.5 TB (6.2 TB free) |
| Secondary Disk | 1.1 TB at /mnt/storage |
| NICs | 4x Gigabit (eno1-eno4) |
| Docker | 29.3.0 (running) |
| dnsmasq | Installed (base) |
| Tailscale | <bc3-addr> |
| LAN IP | 192.168.1.243 (eno1) |
| SSH | Port 2222, user: eq |

---

## Architecture

```
                    ┌──────────────────────┐
                    │    NEON SERVER        │
                    │  192.168.1.243       │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │   dnsmasq      │  │
                    │  │  DHCP proxy    │  │
                    │  │  + TFTP server │  │
                    │  └───────┬────────┘  │
                    │          │           │
                    │  ┌───────▼────────┐  │
                    │  │   HTTP server  │  │
                    │  │  (nginx)       │  │
                    │  │  OS images     │  │
                    │  │  kickstart     │  │
                    │  └────────────────┘  │
                    │                      │
                    │  /mnt/storage/pxe/   │
                    │    images/           │
                    │    menus/            │
                    │    kickstart/        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    NETWORK SWITCH     │
                    │    192.168.1.0/24     │
                    └──┬──────┬──────┬─────┘
                       │      │      │
                    ┌──▼──┐┌──▼──┐┌──▼──┐
                    │ bc1 ││ bc2 ││ lab │
                    │     ││     ││ PCs │
                    └─────┘└─────┘└─────┘
```

---

## Boot Flow

1. Client machine powers on, BIOS set to "Network Boot"
2. Client sends DHCP DISCOVER with PXE option
3. Existing router DHCP assigns IP (192.168.1.x)
4. dnsmasq (proxy mode) sends PXE boot filename + TFTP server IP
5. Client downloads iPXE bootloader via TFTP
6. iPXE loads boot menu via HTTP from neon-server
7. User selects OS from menu (or auto-boot default)
8. iPXE downloads kernel + initrd via HTTP
9. Installer runs with preseed/kickstart for automated install

---

## Boot Menu Options (Planned)

| Option | Image | Use Case |
|--------|-------|----------|
| Ubuntu 24.04 Desktop | 5 GB | Student workstations |
| Ubuntu 24.04 Server | 2 GB | Lab servers |
| Kali Linux 2026.1 | 4 GB | Pentesting labs |
| Hexworth Cyber Range | Custom | Pre-configured CTF environment |
| Windows PE | 1 GB | Hardware diagnostics |
| Memtest86+ | 10 MB | RAM testing |
| Local Boot | -- | Boot from local disk (default after timeout) |

---

## Implementation Plan

### Phase 1: TFTP + iPXE (Day 1)
1. Configure dnsmasq as DHCP proxy + TFTP server
2. Download and configure iPXE bootloader
3. Create basic boot menu
4. Test with one client machine

### Phase 2: OS Images (Day 1-2)
1. Download Ubuntu 24.04 netboot images
2. Set up HTTP server (nginx) for image hosting
3. Create preseed file for automated Ubuntu install
4. Create Kali Linux netboot image

### Phase 3: Custom Images (Day 3+)
1. Build Hexworth Cyber Range image (Ubuntu + tools)
2. Add Windows PE for diagnostics
3. Create student lab environment image
4. Set up image versioning on /mnt/storage/pxe/

### Phase 4: Automation (Week 2)
1. Scripts to update/rebuild images
2. Logging of boot events
3. Integration with admin console (optional)
4. Documentation for white label deployments

---

## Directory Structure

```
/mnt/storage/pxe/
    tftp/                  # TFTP root
        ipxe.efi           # UEFI bootloader
        undionly.kpxe       # BIOS bootloader
    http/                  # nginx document root
        menus/
            boot.ipxe      # Main boot menu
        images/
            ubuntu-24.04/  # Ubuntu netboot files
            kali-2026/     # Kali netboot files
            hexworth-lab/  # Custom lab image
        kickstart/
            ubuntu-auto.cfg    # Automated Ubuntu install
            kali-auto.cfg      # Automated Kali install
            hexworth-lab.cfg   # Custom lab preseed
```

---

## dnsmasq Configuration (Proxy Mode)

Proxy mode means dnsmasq doesn't replace the existing DHCP server (router). It only adds PXE boot options to the existing DHCP responses.

```ini
# /etc/dnsmasq.d/pxe.conf
interface=eno1
bind-interfaces

# DHCP Proxy mode — don't assign IPs, just add PXE options
dhcp-range=192.168.1.0,proxy

# PXE boot file — iPXE for UEFI and BIOS
dhcp-match=set:efi-x86_64,option:client-arch,7
dhcp-boot=tag:efi-x86_64,ipxe.efi
dhcp-boot=undionly.kpxe

# TFTP server
enable-tftp
tftp-root=/mnt/storage/pxe/tftp

# Logging
log-dhcp
log-queries
```

---

## Sprint Integration

Depends on: NE-2 (OS install — done), NE-5 (network config — partial)
New sprint items:
- PXE-1: dnsmasq + TFTP + iPXE setup
- PXE-2: nginx + Ubuntu/Kali netboot images
- PXE-3: Automated preseed configurations
- PXE-4: Hexworth Cyber Range custom image
- PXE-5: Boot menu customization + documentation

---

## White Label Value

"We deploy a physical cyber range to your campus. Your lab machines network-boot our curated environment. No USB drives, no manual installs, no IT department involvement. One server, unlimited workstations."

---

*Scoped: 2026-03-22*
*Server: neon-server (<bc3-addr>)*
*SSH: port 2222, user eq*
