# m14 Advanced Networking — visual inspection log

Gate (per slide-right-panel-visual-standard §3 + Nancy review 2026-06-10):
every image generated TEXT-FREE, zoomed-and-inspected, regenerated until no
readable/garbled glyph remains, only THEN labeled with DOM overlay bands.
If a row's disposition is blank, that slide is NOT cleared to deploy.

Consolidation: 33 slides -> 20 (1 title + 19 content). All 19 content visuals
are freshly generated; none of the 32 old rich-render "table" webps are reused
(they are orphaned in place per the we-do-not-destroy rule).

| # | slide | image file | gen attempts | text-free? | overflow@1280x720 | disposition |
|---|-------|-----------|--------------|-----------|-------------------|-------------|
| 2 | NIC Teaming | nic-teaming.webp | seed 404 (after rejecting 11=micro-text, 33/101/202/303=2-NIC or stray icon) | YES (zoom-verified, abstract chip detail only) | 0px (slide + text) | KEEP — locked reference, awaiting operator sign-off |
| 3 | DHCP Failover | dhcp-failover.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 4 | DNS Policies | dns-policies.webp | 2 (r5923; rejected v1 "DNS"x2) | YES | TBD | image KEEP — HTML pending |
| 5 | Split-Brain DNS | split-brain-dns.webp | 2 (r9792; rejected v1 "CENTRAL DNS") | YES | TBD | image KEEP — HTML pending |
| 6 | DNSSEC | dnssec-dns-security-extensions.webp | 1 (zoom-verified abstract) | YES | TBD | image KEEP — HTML pending |
| 7 | IPAM | ipam-ip-address-management.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 8 | NPS/RADIUS | network-policy-server-nps-radius.webp | 3 (4333; rejected v1 "VPN", v2 "BREP" garble) | YES (device-icons-only recompose) | TBD | image KEEP — HTML pending |
| 9 | VPN Types | vpn-types.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 10 | DirectAccess | directaccess.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 11 | BranchCache | branchcache.webp | 1 (zoom-verified) | YES | TBD | image KEEP — HTML pending |
| 12 | VLANs | vlans-and-network-isolation.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 13 | SDN | software-defined-networking.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 14 | HNV | network-virtualization-hnv.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 15 | Windows Firewall | windows-firewall-with-advanced-security.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 16 | IPsec | ipsec-configuration.webp | 1 (zoom-verified abstract panels) | YES | TBD | image KEEP — HTML pending |
| 17 | QoS | quality-of-service-qos.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 18 | NAT | network-address-translation-nat.webp | 1 | YES | TBD | image KEEP — HTML pending |
| 19 | Network Diagnostics | network-diagnostics.webp | 1 (zoom-verified gauges) | YES | TBD | image KEEP — HTML pending |
| 20 | Lab Preview | lab-preview.webp | 1 (zoom-verified code-as-bars) | YES | TBD | image KEEP — HTML pending |

IMAGE PHASE COMPLETE: 19/19 content visuals text-free and gated (3 required regeneration for baked-in acronyms: DNS, CENTRAL DNS, VPN). Overflow column filled during the full-deck probe after HTML rewrite.

Probe: /tmp/m14-probe2.js (puppeteer, NODE_PATH=repo node_modules, _app served on :8731).
Nothing deployed. Deck is mid-rebuild: slide 2 rebuilt, slides 3-33 still original.
