/**
 * IPToolsData.js — Data/Config for all 15 IP Addressing & Subnetting topics
 *
 * Used by IPToolsRenderer.js (shared renderer pattern)
 * Usage: IPToolsRenderer.init('binary-ip')
 */
const IPToolsData = {

    // ═══════════════════════════════════════════════════════════════════
    // 1. BINARY IP ADDRESSING
    // ═══════════════════════════════════════════════════════════════════
    'binary-ip': {
        id: 'binary-ip',
        title: 'Binary IP Addressing',
        icon: '<img src="/assets/images/icons/icon-numbers.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Convert between binary and decimal representations of IP addresses. Understand how each octet maps to 8 bits.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'Why Binary Matters',
                    content: 'Every IP address is really a 32-bit binary number. Routers and switches process addresses in binary — the dotted-decimal format (like 192.168.1.1) is just a human-friendly shorthand. Understanding binary is essential for subnetting, ACLs, and troubleshooting.'
                },
                {
                    title: 'Octet Breakdown',
                    content: 'An IPv4 address has 4 octets, each 8 bits long. Each bit position has a place value (128, 64, 32, 16, 8, 4, 2, 1). To convert binary to decimal, add the place values where the bit is 1.',
                    diagram: 'octet-bits'
                },
                {
                    title: 'Conversion Method',
                    content: 'Decimal to binary: Start with 128. If the decimal value >= 128, write 1 and subtract 128. Otherwise write 0. Repeat with 64, 32, 16, 8, 4, 2, 1. Binary to decimal: Add up all place values where bit = 1.'
                },
                {
                    title: 'Common Values',
                    content: '255 = 11111111 (all bits on). 0 = 00000000 (all bits off). 128 = 10000000. 192 = 11000000. 224 = 11100000. 240 = 11110000. 248 = 11111000. 252 = 11111100. 254 = 11111110. These are the subnet mask boundary values.'
                }
            ]
        },
        practiceType: 'binary-converter',
        quiz: [
            { question: 'What is 192 in binary?', options: ['10000000', '11000000', '11100000', '11110000'], correct: 1, explanation: '192 = 128 + 64. Bits for 128 and 64 are on: 11000000.' },
            { question: 'What is 10101010 in decimal?', options: ['160', '170', '180', '190'], correct: 1, explanation: '128 + 32 + 8 + 2 = 170.' },
            { question: 'How many bits are in an IPv4 address?', options: ['16', '24', '32', '64'], correct: 2, explanation: 'IPv4 addresses are 32 bits (4 octets x 8 bits).' },
            { question: 'What is the binary representation of 255?', options: ['11111110', '11111111', '10000001', '11111100'], correct: 1, explanation: '255 is all 8 bits set to 1: 11111111.' },
            { question: 'What decimal value does the binary octet 00001111 represent?', options: ['8', '15', '16', '31'], correct: 1, explanation: '8 + 4 + 2 + 1 = 15.' },
            { question: 'In the binary number 11001100, which place values are "on"?', options: ['128, 64, 8, 4', '128, 64, 16, 8', '64, 32, 8, 4', '128, 32, 16, 4'], correct: 0, explanation: 'Bit positions: 128(1), 64(1), 32(0), 16(0), 8(1), 4(1), 2(0), 1(0) = 128+64+8+4 = 204.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 2. CIDR NOTATION
    // ═══════════════════════════════════════════════════════════════════
    'cidr-notation': {
        id: 'cidr-notation',
        title: 'CIDR Notation',
        icon: '<img src="/assets/images/icons/icon-ruler.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Classless Inter-Domain Routing uses slash notation to define network boundaries. Master prefix lengths and their meaning.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'What is CIDR?',
                    content: 'CIDR (Classless Inter-Domain Routing) replaced classful addressing in 1993. Instead of fixed class boundaries, CIDR uses a prefix length (slash notation) to indicate how many bits define the network portion. Example: 192.168.1.0/24 means the first 24 bits are the network address.'
                },
                {
                    title: 'Prefix Length',
                    content: 'The number after the slash tells you how many leading bits are the network portion. /24 = 24 network bits, 8 host bits = 256 addresses (254 usable). /16 = 16 network bits, 16 host bits = 65,536 addresses. /32 = single host. /0 = default route (all networks).'
                },
                {
                    title: 'CIDR to Subnet Mask',
                    content: 'The prefix length maps directly to a subnet mask. /8 = 255.0.0.0, /16 = 255.255.0.0, /24 = 255.255.255.0, /25 = 255.255.255.128, /26 = 255.255.255.192, /27 = 255.255.255.224, /28 = 255.255.255.240, /30 = 255.255.255.252.'
                },
                {
                    title: 'Route Aggregation',
                    content: 'CIDR enables supernetting — combining multiple networks into a single route entry. For example, four /24 networks (192.168.0.0/24 through 192.168.3.0/24) can be summarized as 192.168.0.0/22. This reduces routing table size.'
                }
            ]
        },
        practiceType: 'cidr-calculator',
        quiz: [
            { question: 'What subnet mask does /20 represent?', options: ['255.255.240.0', '255.255.248.0', '255.255.224.0', '255.255.252.0'], correct: 0, explanation: '/20 = 20 network bits. Third octet: 4 remaining bits = 11110000 = 240. Mask: 255.255.240.0.' },
            { question: 'How many usable host addresses are in a /28 network?', options: ['14', '16', '30', '32'], correct: 0, explanation: '/28 leaves 4 host bits = 2^4 = 16 total addresses. Subtract 2 (network + broadcast) = 14 usable.' },
            { question: 'What CIDR prefix matches 255.255.255.192?', options: ['/24', '/25', '/26', '/27'], correct: 2, explanation: '255.255.255.192 = 11111111.11111111.11111111.11000000 = 26 ones = /26.' },
            { question: 'What is the purpose of CIDR?', options: ['Replace IPv4 with IPv6', 'Provide classless routing with variable-length prefixes', 'Encrypt network traffic', 'Assign MAC addresses'], correct: 1, explanation: 'CIDR replaces classful addressing with flexible prefix lengths for more efficient address allocation.' },
            { question: 'A /30 network provides how many usable addresses?', options: ['1', '2', '4', '6'], correct: 1, explanation: '/30 = 2 host bits = 4 addresses total. Minus network and broadcast = 2 usable. Ideal for point-to-point links.' },
            { question: 'Which CIDR notation represents a single host?', options: ['/0', '/24', '/30', '/32'], correct: 3, explanation: '/32 means all 32 bits are network bits, leaving 0 host bits = exactly 1 address.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 3. IPv4 ADDRESS CLASSES
    // ═══════════════════════════════════════════════════════════════════
    'ipv4-classes': {
        id: 'ipv4-classes',
        title: 'IPv4 Address Classes',
        icon: '<img src="/assets/images/icons/icon-tag.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Understand the five IPv4 address classes (A-E), their ranges, default masks, and purposes in classful networking.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'Classful Addressing',
                    content: 'Before CIDR, IPv4 addresses were divided into five classes based on the first few bits. While classful routing is mostly obsolete, understanding classes is essential for exams and for understanding historical network design.'
                },
                {
                    title: 'The Five Classes',
                    content: 'Class A: 1.0.0.0 — 126.255.255.255 (starts with 0, /8 default mask, 16M hosts). Class B: 128.0.0.0 — 191.255.255.255 (starts with 10, /16 default mask, 65K hosts). Class C: 192.0.0.0 — 223.255.255.255 (starts with 110, /24 default mask, 254 hosts). Class D: 224.0.0.0 — 239.255.255.255 (multicast). Class E: 240.0.0.0 — 255.255.255.255 (experimental/reserved).',
                    diagram: 'class-ranges'
                },
                {
                    title: 'Special Addresses',
                    content: '0.0.0.0/8: "This network." 127.0.0.0/8: Loopback (localhost). 169.254.0.0/16: APIPA (link-local). 255.255.255.255: Broadcast. These addresses cannot be assigned to hosts.'
                },
                {
                    title: 'Why Classes Are Still Relevant',
                    content: 'Even though we use CIDR, Class A/B/C terminology still appears in Network+/CCNA exams, in understanding default subnet masks, and in identifying private address ranges (10.0.0.0/8 = Class A private, 172.16.0.0/12 = Class B private, 192.168.0.0/16 = Class C private).'
                }
            ]
        },
        practiceType: 'class-identifier',
        quiz: [
            { question: 'What class is the IP address 172.16.5.1?', options: ['Class A', 'Class B', 'Class C', 'Class D'], correct: 1, explanation: '172 falls in 128-191, which is Class B.' },
            { question: 'What is the default subnet mask for a Class A address?', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], correct: 0, explanation: 'Class A uses /8 = 255.0.0.0 (first 8 bits for network).' },
            { question: 'Which class is reserved for multicast?', options: ['Class B', 'Class C', 'Class D', 'Class E'], correct: 2, explanation: 'Class D (224.0.0.0 — 239.255.255.255) is reserved for multicast group addresses.' },
            { question: 'What is the range of the first octet for Class C?', options: ['1-126', '128-191', '192-223', '224-239'], correct: 2, explanation: 'Class C starts at 192 and ends at 223.' },
            { question: 'The address 127.0.0.1 is used for what purpose?', options: ['Default gateway', 'Broadcast', 'Loopback/localhost', 'DHCP server'], correct: 2, explanation: '127.0.0.0/8 is the loopback range. 127.0.0.1 is "localhost" — it always refers to the local machine.' },
            { question: 'How many host addresses can a single Class B network support?', options: ['254', '65,534', '16,777,214', '1,024'], correct: 1, explanation: 'Class B has 16 host bits = 2^16 - 2 = 65,534 usable host addresses.' },
            { question: 'What class does the IP address 10.0.0.1 belong to?', options: ['Class A', 'Class B', 'Class C', 'Private (no class)'], correct: 0, explanation: '10 falls in 1-126, which is Class A. It is also a private Class A address (10.0.0.0/8).' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 4. IPv6 ADDRESSING
    // ═══════════════════════════════════════════════════════════════════
    'ipv6-addressing': {
        id: 'ipv6-addressing',
        title: 'IPv6 Addressing',
        icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Learn IPv6 format, abbreviation rules, address types (unicast, multicast, anycast), and transition mechanisms.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'Why IPv6?',
                    content: 'IPv4 has ~4.3 billion addresses — not enough for the modern internet. IPv6 uses 128-bit addresses providing 3.4 x 10^38 unique addresses. IPv6 also eliminates NAT, simplifies headers, and supports built-in IPsec.'
                },
                {
                    title: 'IPv6 Format',
                    content: 'IPv6 addresses are written as 8 groups of 4 hex digits separated by colons. Example: 2001:0db8:85a3:0000:0000:8a2e:0370:7334. Abbreviation rules: (1) Remove leading zeros in each group. (2) Replace one longest consecutive run of all-zero groups with :: (only once per address).',
                    diagram: 'ipv6-format'
                },
                {
                    title: 'Address Types',
                    content: 'Global Unicast (2000::/3): Routable on the internet, like public IPv4. Link-Local (fe80::/10): Auto-configured, non-routable, used for neighbor discovery. Unique Local (fc00::/7): Like private IPv4 ranges. Multicast (ff00::/8): One-to-many. Loopback: ::1. Unspecified: ::.'
                },
                {
                    title: 'Key Differences from IPv4',
                    content: 'No broadcast (multicast replaces it). No NAT needed. No ARP (uses NDP — Neighbor Discovery Protocol). Auto-configuration via SLAAC (Stateless Address Autoconfiguration). Multiple addresses per interface are normal.'
                }
            ]
        },
        practiceType: 'ipv6-tool',
        quiz: [
            { question: 'How many bits are in an IPv6 address?', options: ['32', '64', '128', '256'], correct: 2, explanation: 'IPv6 uses 128-bit addresses (compared to 32-bit IPv4).' },
            { question: 'What is the abbreviated form of 2001:0db8:0000:0000:0000:0000:0000:0001?', options: ['2001:db8::1', '2001:db8:0:0:0:0:0:1', '2001:db8:::1', '2001:0db8::0001'], correct: 0, explanation: 'Remove leading zeros: 2001:db8:0:0:0:0:0:1. Replace longest zero run with ::: 2001:db8::1.' },
            { question: 'Which IPv6 address type starts with fe80::?', options: ['Global unicast', 'Link-local', 'Multicast', 'Unique local'], correct: 1, explanation: 'fe80::/10 is the link-local prefix. These addresses are auto-configured and not routable beyond the local link.' },
            { question: 'What replaced ARP in IPv6?', options: ['DHCP', 'DNS', 'NDP (Neighbor Discovery Protocol)', 'IGMP'], correct: 2, explanation: 'IPv6 uses NDP instead of ARP for address resolution and neighbor discovery.' },
            { question: 'How many hexadecimal characters are in a full IPv6 address (without colons)?', options: ['16', '24', '32', '48'], correct: 2, explanation: '128 bits / 4 bits per hex char = 32 hexadecimal characters.' },
            { question: 'What is the IPv6 loopback address?', options: ['127.0.0.1', '::1', 'fe80::1', 'ff02::1'], correct: 1, explanation: '::1 is the IPv6 loopback address (equivalent to 127.0.0.1 in IPv4).' },
            { question: 'How many times can you use :: in a single IPv6 address?', options: ['Unlimited', 'Twice', 'Once', 'Three times'], correct: 2, explanation: 'The :: shorthand can only appear once per address. Using it twice would create ambiguity about how many zero groups each :: replaces.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 5. NAT/PAT
    // ═══════════════════════════════════════════════════════════════════
    'nat-pat': {
        id: 'nat-pat',
        title: 'NAT & PAT',
        icon: '<img src="/assets/images/icons/icon-refresh.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Network Address Translation and Port Address Translation — how private networks communicate with the public internet.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'Why NAT Exists',
                    content: 'IPv4 address exhaustion means there are not enough public addresses for every device. NAT allows multiple private IP devices to share one or a few public IPs. Your home router does this — all your devices appear as one public IP to the internet.'
                },
                {
                    title: 'Types of NAT',
                    content: 'Static NAT: One-to-one permanent mapping (private IP always maps to the same public IP). Used for servers that need a consistent public address. Dynamic NAT: One-to-one temporary mapping from a pool of public IPs. Assigned on demand, released when done. PAT (Port Address Translation): Many-to-one mapping using port numbers to distinguish sessions. Also called NAT overload. This is what home routers use.',
                    diagram: 'nat-types'
                },
                {
                    title: 'How PAT Works',
                    content: 'When a device sends traffic, the router replaces the source IP with its public IP and assigns a unique source port number. It records this mapping in a NAT table. When the reply comes back, the router uses the destination port to look up which internal device to forward to.'
                },
                {
                    title: 'NAT Terminology',
                    content: 'Inside Local: Private IP of internal host. Inside Global: Public IP representing the internal host. Outside Local: IP of external host as seen from inside. Outside Global: Public IP of external host. These four terms describe the perspective of address translation.'
                }
            ]
        },
        practiceType: 'nat-simulator',
        quiz: [
            { question: 'What type of NAT does a typical home router use?', options: ['Static NAT', 'Dynamic NAT', 'PAT (NAT Overload)', 'Twice NAT'], correct: 2, explanation: 'Home routers use PAT — many private addresses share one public IP, distinguished by port numbers.' },
            { question: 'In NAT terminology, what is the "inside local" address?', options: ['The public IP of the router', 'The private IP of the internal host', 'The public IP of the external server', 'The private IP of the external server'], correct: 1, explanation: 'Inside local = the private IP address assigned to a host on the inside (private) network.' },
            { question: 'How does PAT distinguish between multiple internal hosts using the same public IP?', options: ['MAC addresses', 'Different public IPs', 'Unique port numbers', 'VLAN tags'], correct: 2, explanation: 'PAT assigns unique source port numbers to each session, allowing it to track which internal host sent each packet.' },
            { question: 'Which type of NAT provides a permanent one-to-one mapping?', options: ['Dynamic NAT', 'PAT', 'Static NAT', 'SNAT'], correct: 2, explanation: 'Static NAT creates a permanent mapping between one private IP and one public IP. Used for servers needing consistent public access.' },
            { question: 'Why is NAT considered a security benefit?', options: ['It encrypts all traffic', 'It hides internal IP addresses from the outside', 'It blocks all inbound traffic', 'It replaces firewalls'], correct: 1, explanation: 'NAT obscures the internal network structure. External hosts cannot directly see or address internal private IPs.' },
            { question: 'What is a disadvantage of NAT?', options: ['Uses too much bandwidth', 'Breaks end-to-end connectivity and complicates some protocols', 'Requires IPv6', 'Only works on wireless'], correct: 1, explanation: 'NAT breaks the end-to-end principle of IP. Protocols like FTP, SIP, and IPsec can have issues traversing NAT.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 6. NETWORK CLASSES
    // ═══════════════════════════════════════════════════════════════════
    'network-classes': {
        id: 'network-classes',
        title: 'Network Classes & Classful Addressing',
        icon: '<img src="/assets/images/icons/icon-barchart.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Deep dive into classful addressing: how network and host portions are divided, and why we moved to CIDR.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'Classful Architecture',
                    content: 'In the original Internet (1981-1993), addresses were allocated in fixed blocks. The first bits of an address determined its class, which in turn determined the boundary between network and host portions. No subnet mask was needed — the class implied it.'
                },
                {
                    title: 'Network vs Host Bits',
                    content: 'Class A: 8 network bits (N.H.H.H) — 126 networks, 16M hosts each. Class B: 16 network bits (N.N.H.H) — 16,384 networks, 65K hosts each. Class C: 24 network bits (N.N.N.H) — 2M+ networks, 254 hosts each. This rigid system wasted huge numbers of addresses.',
                    diagram: 'classful-bits'
                },
                {
                    title: 'The Waste Problem',
                    content: 'A company needing 500 hosts could not use a Class C (only 254 hosts), so they got a Class B (65,534 hosts) — wasting over 65,000 addresses. This inefficiency accelerated IPv4 exhaustion and led to CIDR and VLSM.'
                },
                {
                    title: 'Legacy Impact',
                    content: 'Even though classful routing is obsolete, its legacy lives on. Default subnet masks still follow class boundaries. Many routing protocols (RIPv1) assumed classful masks. Private address ranges were assigned based on classes (Class A: 10.x, Class B: 172.16-31.x, Class C: 192.168.x).'
                }
            ]
        },
        practiceType: 'class-identifier',
        quiz: [
            { question: 'In classful addressing, how many network bits does a Class B address have?', options: ['8', '16', '24', '32'], correct: 1, explanation: 'Class B addresses use 16 bits for the network portion (N.N.H.H format).' },
            { question: 'Why did classful addressing lead to address waste?', options: ['Too many classes', 'Fixed network sizes did not match real needs', 'Not enough classes', 'Binary is inefficient'], correct: 1, explanation: 'Organizations often needed something between Class C (254 hosts) and Class B (65K hosts), but no option existed in between.' },
            { question: 'What technology replaced classful addressing?', options: ['IPv6', 'CIDR', 'NAT', 'DHCP'], correct: 1, explanation: 'CIDR (Classless Inter-Domain Routing) allows variable-length prefix lengths, replacing rigid class boundaries.' },
            { question: 'How many Class A networks are possible (excluding special ranges)?', options: ['126', '128', '256', '16,384'], correct: 0, explanation: 'First octet 1-126 = 126 Class A networks. 0 and 127 are reserved.' },
            { question: 'What first-octet bit pattern identifies a Class B address?', options: ['0xxxxxxx', '10xxxxxx', '110xxxxx', '1110xxxx'], correct: 1, explanation: 'Class B addresses always start with binary 10 in the first octet (128-191 decimal).' },
            { question: 'An organization needs 1,000 host addresses. In classful addressing, what class would they receive?', options: ['Class A', 'Class B', 'Class C', 'Two Class C networks'], correct: 1, explanation: 'Class C only supports 254 hosts, so the organization would need a Class B (65,534 hosts) — extremely wasteful for 1,000 hosts.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 7. PRIVATE VS PUBLIC IP ADDRESSES
    // ═══════════════════════════════════════════════════════════════════
    'private-public-ip': {
        id: 'private-public-ip',
        title: 'Private vs Public IP Addresses',
        icon: '<img src="/assets/images/icons/icon-padlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Know which IP ranges are private (RFC 1918), which are public, and why this distinction matters for network design.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'The Public/Private Split',
                    content: 'RFC 1918 reserved three IP ranges for private use. These addresses are NOT routable on the internet — routers will drop them. Any organization can use these ranges internally without coordination. NAT translates between private and public addresses at the network boundary.'
                },
                {
                    title: 'Private Address Ranges',
                    content: '10.0.0.0 — 10.255.255.255 (/8, 16M addresses, 1 Class A block). 172.16.0.0 — 172.31.255.255 (/12, 1M addresses, 16 Class B blocks). 192.168.0.0 — 192.168.255.255 (/16, 65K addresses, 256 Class C blocks).',
                    diagram: 'private-ranges'
                },
                {
                    title: 'Other Special Ranges',
                    content: '127.0.0.0/8 — Loopback. 169.254.0.0/16 — APIPA (link-local, auto-assigned when DHCP fails). 100.64.0.0/10 — Carrier-grade NAT (CGNAT, RFC 6598). 0.0.0.0/8 — "This network." 224.0.0.0/4 — Multicast. 240.0.0.0/4 — Reserved (Class E).'
                },
                {
                    title: 'Network Design',
                    content: 'Best practice: Use private addresses internally, public addresses only on internet-facing interfaces. Most organizations use 10.0.0.0/8 for large networks (enterprise), 172.16.0.0/12 for mid-size, and 192.168.0.0/16 for small/home networks.'
                }
            ]
        },
        practiceType: 'private-public-checker',
        quiz: [
            { question: 'Which of these is a private IP address?', options: ['8.8.8.8', '172.20.1.1', '11.0.0.1', '192.169.1.1'], correct: 1, explanation: '172.20.1.1 falls in the 172.16.0.0-172.31.255.255 private range. The others are all public.' },
            { question: 'What RFC defines private address ranges?', options: ['RFC 791', 'RFC 1918', 'RFC 2460', 'RFC 7540'], correct: 1, explanation: 'RFC 1918 ("Address Allocation for Private Internets") defines the three private ranges.' },
            { question: 'What happens if a private IP packet reaches an internet router?', options: ['It is forwarded normally', 'It is encrypted', 'It is dropped', 'It is redirected to DNS'], correct: 2, explanation: 'Internet routers are configured to drop packets with private source/destination addresses. NAT must translate them first.' },
            { question: 'What is the APIPA address range?', options: ['10.0.0.0/8', '169.254.0.0/16', '192.168.0.0/16', '127.0.0.0/8'], correct: 1, explanation: '169.254.0.0/16 is assigned automatically when a device cannot reach a DHCP server (Automatic Private IP Addressing).' },
            { question: 'How many private Class A networks exist?', options: ['1 (10.0.0.0/8)', '16', '256', '126'], correct: 0, explanation: 'There is exactly one private Class A block: 10.0.0.0/8, providing over 16 million addresses.' },
            { question: 'Is 192.169.1.1 a private address?', options: ['Yes', 'No'], correct: 1, explanation: 'No! The private range is 192.168.x.x. 192.169.x.x is a public address — note the subtle difference.' },
            { question: 'What is the purpose of Carrier-Grade NAT (100.64.0.0/10)?', options: ['Home networks', 'ISP internal NAT between provider and customer', 'Multicast streaming', 'VPN tunnels'], correct: 1, explanation: 'CGNAT (RFC 6598) lets ISPs do another layer of NAT between their network and customers, further extending IPv4 life.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 8. SUBNET CALCULATOR
    // ═══════════════════════════════════════════════════════════════════
    'subnet-calculator': {
        id: 'subnet-calculator',
        title: 'Subnet Calculator',
        icon: '<img src="/assets/images/icons/icon-numbers.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'A full-featured subnet calculator. Input any IP address and mask to get network address, broadcast, usable range, and more.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'What Subnetting Produces',
                    content: 'Given an IP address and subnet mask, you can determine: Network Address (first address, all host bits 0), Broadcast Address (last address, all host bits 1), First Usable Host, Last Usable Host, Total Addresses, Usable Addresses, Wildcard Mask, and the CIDR notation.'
                },
                {
                    title: 'The AND Operation',
                    content: 'To find the network address, perform a bitwise AND between the IP address and subnet mask. IP bit AND Mask bit: 1 AND 1 = 1, 1 AND 0 = 0, 0 AND 1 = 0, 0 AND 0 = 0. This "zeros out" the host bits, leaving only the network portion.',
                    diagram: 'and-operation'
                },
                {
                    title: 'Finding the Broadcast',
                    content: 'The broadcast address has all host bits set to 1. Take the network address and set every host bit to 1. Alternatively: Network Address OR Wildcard Mask = Broadcast Address.'
                },
                {
                    title: 'Usable Range',
                    content: 'First usable host = Network Address + 1. Last usable host = Broadcast Address - 1. Usable hosts = 2^(host bits) - 2. Exception: /31 networks (point-to-point links, RFC 3021) use both addresses as hosts. /32 is a single host.'
                }
            ]
        },
        practiceType: 'subnet-calc',
        quiz: [
            { question: 'What is the network address of 192.168.1.130/26?', options: ['192.168.1.0', '192.168.1.64', '192.168.1.128', '192.168.1.192'], correct: 2, explanation: '/26 gives blocks of 64. 130 falls in the 128-191 block, so the network is 192.168.1.128.' },
            { question: 'What is the broadcast address of 10.0.0.0/24?', options: ['10.0.0.1', '10.0.0.254', '10.0.0.255', '10.0.1.0'], correct: 2, explanation: '/24 network 10.0.0.0 has broadcast at 10.0.0.255 (all host bits set to 1).' },
            { question: 'How many usable hosts are in a /22 network?', options: ['510', '1,022', '1,024', '2,046'], correct: 1, explanation: '/22 = 10 host bits. 2^10 = 1,024 total. Minus 2 = 1,022 usable hosts.' },
            { question: 'What operation determines the network address from an IP and mask?', options: ['OR', 'XOR', 'AND', 'NOT'], correct: 2, explanation: 'Bitwise AND between the IP address and subnet mask yields the network address.' },
            { question: 'What is the first usable host in 172.16.0.0/16?', options: ['172.16.0.0', '172.16.0.1', '172.16.1.0', '172.16.0.255'], correct: 1, explanation: 'First usable host = network address + 1 = 172.16.0.1.' },
            { question: 'What is the wildcard mask for a /27 subnet?', options: ['0.0.0.15', '0.0.0.31', '0.0.0.63', '0.0.0.127'], correct: 1, explanation: '/27 mask is 255.255.255.224. Wildcard = 255 - 224 = 31. Full wildcard: 0.0.0.31.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 9. SUBNET MASKS
    // ═══════════════════════════════════════════════════════════════════
    'subnet-masks': {
        id: 'subnet-masks',
        title: 'Subnet Masks',
        icon: '<img src="/assets/images/icons/icon-mask.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'What subnet masks are, how they work, default masks by class, and custom subnet masks for network design.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'Purpose of Subnet Masks',
                    content: 'A subnet mask tells a device which part of an IP address is the network portion and which is the host portion. Without a mask, a device cannot determine if a destination is local (same network) or remote (needs a router).'
                },
                {
                    title: 'How Masks Work',
                    content: 'In binary, a subnet mask is a continuous string of 1s followed by 0s. The 1s mark network bits; the 0s mark host bits. Example: 255.255.255.0 = 11111111.11111111.11111111.00000000. The mask is ANDed with the IP to extract the network address.',
                    diagram: 'mask-binary'
                },
                {
                    title: 'Default Subnet Masks',
                    content: 'Class A default: 255.0.0.0 (/8). Class B default: 255.255.0.0 (/16). Class C default: 255.255.255.0 (/24). These are the natural masks — no subnetting applied.'
                },
                {
                    title: 'Valid Subnet Mask Values',
                    content: 'Each octet in a valid subnet mask can only be: 0, 128, 192, 224, 240, 248, 252, 254, or 255. These correspond to 0-8 consecutive 1-bits. Any other value (like 253 or 131) is NOT a valid mask. Masks must be contiguous 1s from left to right.'
                }
            ]
        },
        practiceType: 'mask-explorer',
        quiz: [
            { question: 'What is the binary representation of the mask 255.255.255.240?', options: ['11111111.11111111.11111111.11100000', '11111111.11111111.11111111.11110000', '11111111.11111111.11111111.11111000', '11111111.11111111.11111111.11000000'], correct: 1, explanation: '240 = 11110000. Full mask: /28.' },
            { question: 'Is 255.255.253.0 a valid subnet mask?', options: ['Yes', 'No'], correct: 1, explanation: '253 = 11111101 — the bits are not contiguous (there is a 0 between 1s). Not a valid mask.' },
            { question: 'What is the default subnet mask for a Class C address?', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.128'], correct: 2, explanation: 'Class C default mask is 255.255.255.0 (/24), giving 24 network bits and 8 host bits.' },
            { question: 'If a subnet mask is 255.255.255.192, how many subnets can be created from a Class C network?', options: ['2', '4', '8', '16'], correct: 1, explanation: '192 = 11000000, so 2 bits are borrowed from the host portion. 2^2 = 4 subnets.' },
            { question: 'Which subnet mask value has exactly 5 network bits in the last octet?', options: ['240', '248', '252', '224'], correct: 1, explanation: '248 = 11111000 = 5 one-bits in the octet.' },
            { question: 'What does a subnet mask of 255.255.255.255 (/32) mean?', options: ['All hosts on the network', 'An entire Class C network', 'A single host address', 'Invalid mask'], correct: 2, explanation: '/32 means all 32 bits are network bits — it identifies exactly one host address.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 10. SUBNETTING PRACTICE
    // ═══════════════════════════════════════════════════════════════════
    'subnetting-practice': {
        id: 'subnetting-practice',
        title: 'Subnetting Practice',
        icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Interactive drills to build speed and confidence in subnetting. Random problems with instant feedback.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'The Subnetting Process',
                    content: 'Subnetting divides a network into smaller subnetworks. Given a network address and required number of subnets (or hosts), you determine the appropriate subnet mask, then calculate each subnet\'s network address, broadcast, and usable range.'
                },
                {
                    title: 'Key Formulas',
                    content: 'Subnets created = 2^(borrowed bits). Hosts per subnet = 2^(remaining host bits) - 2. Block size (increment) = 256 - subnet mask value in the interesting octet. Networks start at multiples of the block size.',
                    diagram: 'subnet-formulas'
                },
                {
                    title: 'The Quick Method',
                    content: '1) Determine how many bits to borrow. 2) Write the new mask. 3) Find the block size (256 minus the interesting octet). 4) List subnet network addresses (0, block, 2x block, ...). 5) Broadcast = next network - 1. 6) Usable range = network+1 to broadcast-1.'
                },
                {
                    title: 'Speed Tips',
                    content: 'Memorize the powers of 2: 2,4,8,16,32,64,128,256. Know the block sizes by heart: /25=128, /26=64, /27=32, /28=16, /29=8, /30=4. Practice until you can subnet a /27 in under 30 seconds.'
                }
            ]
        },
        practiceType: 'subnetting-drill',
        quiz: [
            { question: 'A network 192.168.10.0/24 is subnetted with a /27 mask. How many subnets are created?', options: ['4', '8', '16', '32'], correct: 1, explanation: '/27 borrows 3 bits from the original /24 host portion. 2^3 = 8 subnets.' },
            { question: 'What is the block size for a /26 subnet?', options: ['32', '64', '128', '16'], correct: 1, explanation: '/26 mask last octet = 192. Block size = 256 - 192 = 64.' },
            { question: 'Given 192.168.1.0/28, what is the third subnet\'s network address?', options: ['192.168.1.16', '192.168.1.32', '192.168.1.48', '192.168.1.64'], correct: 1, explanation: '/28 block size = 16. Subnets: .0, .16, .32, .48... Third subnet (index 2) = 192.168.1.32.' },
            { question: 'You need 50 hosts per subnet. What is the minimum prefix length?', options: ['/25', '/26', '/27', '/28'], correct: 1, explanation: '/26 gives 62 usable hosts (2^6-2). /27 only gives 30. So /26 is the minimum.' },
            { question: 'What is the broadcast address of the subnet 172.16.4.0/22?', options: ['172.16.4.255', '172.16.5.255', '172.16.7.255', '172.16.8.0'], correct: 2, explanation: '/22 covers 4 Class C networks (block size 4 in third octet). 172.16.4.0-172.16.7.255. Broadcast = 172.16.7.255.' },
            { question: 'If you subnet 10.0.0.0/8 into /12 subnets, how many subnets do you get?', options: ['4', '8', '16', '32'], correct: 2, explanation: 'Borrowing 4 bits (/12 - /8 = 4 borrowed). 2^4 = 16 subnets.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 11. SUPERNETTING / ROUTE AGGREGATION
    // ═══════════════════════════════════════════════════════════════════
    'supernetting': {
        id: 'supernetting',
        title: 'Supernetting & Route Aggregation',
        icon: '<img src="/assets/images/icons/icon-chain.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Combine multiple smaller networks into a single summary route. Reduce routing table size and improve efficiency.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'What is Supernetting?',
                    content: 'Supernetting (route aggregation/summarization) is the opposite of subnetting. Instead of breaking one network into smaller pieces, you combine multiple contiguous networks into a single summary route. This reduces the number of entries in routing tables.'
                },
                {
                    title: 'How It Works',
                    content: 'Find the common bits in all the networks you want to summarize. The summary route uses a shorter prefix that covers all the component networks. Example: 192.168.0.0/24, 192.168.1.0/24, 192.168.2.0/24, 192.168.3.0/24 can be summarized as 192.168.0.0/22.',
                    diagram: 'supernet-example'
                },
                {
                    title: 'Rules for Aggregation',
                    content: 'Networks must be contiguous (no gaps). The number of networks should be a power of 2 (2, 4, 8, 16...). The starting network must be a multiple of the block size. If these conditions are not met, the summary route may include addresses outside the desired range.'
                },
                {
                    title: 'Benefits',
                    content: 'Smaller routing tables = faster lookups. Less routing update traffic. Improved stability (individual subnet changes do not propagate). Hierarchical addressing design. Critical for Internet backbone routers handling 900K+ routes.'
                }
            ]
        },
        practiceType: 'supernet-calculator',
        quiz: [
            { question: 'What is the summary route for 10.1.0.0/24, 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24?', options: ['10.1.0.0/22', '10.1.0.0/23', '10.1.0.0/16', '10.1.0.0/24'], correct: 0, explanation: 'Four /24 networks need 2 extra bits: /24 - 2 = /22. Summary: 10.1.0.0/22.' },
            { question: 'What is the primary benefit of route aggregation?', options: ['Increases available IP addresses', 'Reduces routing table size', 'Provides encryption', 'Enables IPv6'], correct: 1, explanation: 'Route aggregation combines multiple routes into one summary, reducing table size and improving router performance.' },
            { question: 'Can you aggregate 192.168.1.0/24 and 192.168.3.0/24?', options: ['Yes, as 192.168.0.0/22', 'Yes, as 192.168.1.0/23', 'No, they are not contiguous', 'Yes, as 192.168.1.0/22'], correct: 2, explanation: 'These networks are not contiguous — 192.168.2.0/24 is missing. Aggregation requires contiguous blocks.' },
            { question: 'How many /24 networks fit in a /20 summary?', options: ['4', '8', '16', '32'], correct: 2, explanation: '/24 - /20 = 4 bits difference. 2^4 = 16 /24 networks in a /20.' },
            { question: 'What is another name for supernetting?', options: ['Subnetting', 'VLSM', 'Route summarization/aggregation', 'NAT'], correct: 2, explanation: 'Supernetting is also called route summarization or route aggregation.' },
            { question: 'In a well-designed network, route aggregation works best when addresses are assigned...', options: ['Randomly', 'Hierarchically/contiguously', 'Using only Class A', 'With maximum fragmentation'], correct: 1, explanation: 'Hierarchical address assignment ensures networks are contiguous and can be efficiently summarized.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 12. VLSM
    // ═══════════════════════════════════════════════════════════════════
    'vlsm': {
        id: 'vlsm',
        title: 'VLSM (Variable Length Subnet Masking)',
        icon: '<img src="/assets/images/icons/icon-ruler.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Use different subnet masks within the same network to allocate addresses efficiently based on actual need.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'What is VLSM?',
                    content: 'Variable Length Subnet Masking allows using different-sized subnets within the same major network. Instead of one uniform subnet mask, each subnet gets a mask sized to its actual host requirement. This eliminates the waste of fixed-length subnetting.'
                },
                {
                    title: 'VLSM Process',
                    content: '1) List all subnets needed with their host counts. 2) Sort by size — largest first. 3) Allocate the largest subnet from the network space. 4) Allocate the next largest from remaining space. 5) Continue until all subnets are allocated. 6) Verify no overlaps.',
                    diagram: 'vlsm-process'
                },
                {
                    title: 'Example',
                    content: 'Network: 192.168.1.0/24. Needs: LAN A (50 hosts) = /26. LAN B (25 hosts) = /27. LAN C (10 hosts) = /28. WAN link (2 hosts) = /30. Allocation: A=.0/26, B=.64/27, C=.96/28, WAN=.112/30. Remaining space: .116-.255 for future use.'
                },
                {
                    title: 'Requirements',
                    content: 'VLSM requires a classless routing protocol (OSPF, EIGRP, IS-IS, BGP, RIPv2). Classful protocols like RIPv1 do not carry subnet mask information and cannot support VLSM.'
                }
            ]
        },
        practiceType: 'vlsm-designer',
        quiz: [
            { question: 'What is the main advantage of VLSM over fixed-length subnetting?', options: ['Faster routing', 'More efficient address utilization', 'Better security', 'Simpler configuration'], correct: 1, explanation: 'VLSM allows each subnet to be sized to actual need, minimizing wasted addresses.' },
            { question: 'When performing VLSM, which subnet should you allocate first?', options: ['The smallest', 'The WAN links', 'The largest', 'Any order works'], correct: 2, explanation: 'Allocate largest first to ensure they get contiguous address space. Smaller subnets fit in the gaps.' },
            { question: 'Which routing protocol does NOT support VLSM?', options: ['OSPF', 'EIGRP', 'RIPv1', 'BGP'], correct: 2, explanation: 'RIPv1 is classful — it does not include subnet mask in updates, so it cannot support VLSM.' },
            { question: 'You need 100 hosts. What is the smallest VLSM subnet that works?', options: ['/24 (254 hosts)', '/25 (126 hosts)', '/26 (62 hosts)', '/27 (30 hosts)'], correct: 1, explanation: '/25 provides 126 usable hosts, which is the smallest that fits 100 hosts. /26 only gives 62.' },
            { question: 'A WAN point-to-point link between two routers needs what VLSM prefix?', options: ['/24', '/28', '/30', '/32'], correct: 2, explanation: '/30 provides exactly 2 usable addresses — one for each end of the point-to-point link. Perfect fit, zero waste.' },
            { question: 'In VLSM design, what must you verify after allocating all subnets?', options: ['All hosts have the same mask', 'No subnets overlap', 'All subnets use /24', 'Routing is classful'], correct: 1, explanation: 'The critical check in VLSM is ensuring no subnet ranges overlap, which would cause routing conflicts.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 13. WILDCARD MASKS
    // ═══════════════════════════════════════════════════════════════════
    'wildcard-masks': {
        id: 'wildcard-masks',
        title: 'Wildcard Masks',
        icon: '<img src="/assets/images/icons/icon-wildcard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Inverse of subnet masks, used in ACLs and routing protocols (OSPF, EIGRP). Master the 255-minus calculation.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'What is a Wildcard Mask?',
                    content: 'A wildcard mask is the inverse of a subnet mask. Where subnet masks use 1 to mean "must match" and 0 for "ignore," wildcard masks flip it: 0 = must match, 1 = ignore (wildcard). They are used in Cisco ACLs and OSPF/EIGRP network statements.'
                },
                {
                    title: 'Calculating Wildcards',
                    content: 'Simple formula: Wildcard = 255.255.255.255 - Subnet Mask. Example: Mask 255.255.255.0 -> Wildcard 0.0.0.255. Mask 255.255.255.192 -> Wildcard 0.0.0.63. Mask 255.255.240.0 -> Wildcard 0.0.15.255.',
                    diagram: 'wildcard-calc'
                },
                {
                    title: 'Reading Wildcard Masks',
                    content: '0 bits = "check this bit" (must match). 1 bits = "ignore this bit" (any value). So 0.0.0.255 means "match the first 3 octets exactly, ignore the last octet." This matches all hosts in a /24 network.'
                },
                {
                    title: 'Special Wildcards',
                    content: '0.0.0.0 = match exactly one host (used with "host" keyword). 255.255.255.255 = match any address (used with "any" keyword). Non-contiguous wildcards are possible (e.g., 0.0.0.254 matches only even addresses) but rare and not recommended.'
                }
            ]
        },
        practiceType: 'wildcard-calculator',
        quiz: [
            { question: 'What is the wildcard mask for 255.255.255.224?', options: ['0.0.0.31', '0.0.0.32', '0.0.0.63', '0.0.0.224'], correct: 0, explanation: '255 - 224 = 31. Wildcard: 0.0.0.31.' },
            { question: 'In an ACL, what does a wildcard bit of 0 mean?', options: ['Ignore this bit', 'Must match this bit', 'Set to 1', 'Broadcast'], correct: 1, explanation: 'In wildcard masks, 0 = check/must match, 1 = don\'t care/ignore. Opposite of subnet masks.' },
            { question: 'What wildcard mask matches all addresses?', options: ['0.0.0.0', '255.255.255.0', '255.255.255.255', '0.0.0.255'], correct: 2, explanation: '255.255.255.255 = ignore all bits = match any IP address. Used with the "any" keyword.' },
            { question: 'An OSPF network statement uses "network 10.0.0.0 0.0.255.255". What does this match?', options: ['Only 10.0.0.0', 'All 10.0.x.x addresses', 'All 10.x.x.x addresses', 'All addresses'], correct: 1, explanation: 'Wildcard 0.0.255.255 = match first 2 octets (10.0), ignore last 2. Matches 10.0.0.0-10.0.255.255.' },
            { question: 'What is the wildcard mask for a /28 network?', options: ['0.0.0.7', '0.0.0.15', '0.0.0.31', '0.0.0.63'], correct: 1, explanation: '/28 mask = 255.255.255.240. Wildcard = 255-240 = 0.0.0.15.' },
            { question: 'In what situations are wildcard masks used?', options: ['Only in firewalls', 'In ACLs and OSPF/EIGRP network statements', 'Only in routing tables', 'In DNS configuration'], correct: 1, explanation: 'Wildcard masks are primarily used in Cisco ACLs (access control lists) and routing protocol network statements (OSPF, EIGRP).' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 14. MAC ADDRESSING & LAYER 2
    // ═══════════════════════════════════════════════════════════════════
    'mac-addressing': {
        id: 'mac-addressing',
        title: 'MAC Addressing & Layer 2',
        icon: '<img src="/assets/images/icons/icon-plug.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Understand MAC addresses — the 48-bit hardware identifiers that power Layer 2 communication on every LAN.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'What is a MAC Address?',
                    content: 'A MAC (Media Access Control) address is a 48-bit (6-byte) hardware address permanently burned into every network interface card (NIC) at the factory. It operates at Layer 2 (Data Link) of the OSI model and is used to deliver frames within a local network segment. Unlike IP addresses, which are logical and can change, a MAC address is tied to the physical hardware. Every Ethernet frame carries both a source and destination MAC address in its header.'
                },
                {
                    title: 'MAC Address Format',
                    content: 'A MAC address is written as 6 octets in hexadecimal, separated by colons or hyphens: AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF. Cisco uses a dot notation with groups of 4: AABB.CCDD.EEFF. The first 3 octets (24 bits) form the OUI (Organizationally Unique Identifier) — this identifies the manufacturer (e.g., 00:1A:2B = a specific vendor). The last 3 octets (24 bits) are the NIC-specific portion assigned by the manufacturer to ensure uniqueness. You can look up an OUI to identify which company made a device.',
                    diagram: 'mac-format'
                },
                {
                    title: 'Types of MAC Addresses',
                    content: 'Unicast: Identifies a single NIC. The least significant bit of the first octet is 0 (e.g., 00:1A:2B:3C:4D:5E). This is the most common type — one sender to one receiver. Broadcast: FF:FF:FF:FF:FF:FF — all 48 bits set to 1. Every device on the local segment processes broadcast frames. ARP requests use broadcast. Multicast: The least significant bit of the first octet is 1 (e.g., 01:00:5E:xx:xx:xx for IPv4 multicast). Delivers frames to a group of devices that have subscribed to a multicast group, rather than all devices.'
                },
                {
                    title: 'ARP — Address Resolution Protocol',
                    content: 'ARP bridges Layer 3 (IP) and Layer 2 (MAC). When a host wants to send data to an IP on the same subnet, it needs the destination MAC address. ARP Request: The sender broadcasts an Ethernet frame (destination FF:FF:FF:FF:FF:FF) asking "Who has IP 192.168.1.5? Tell 192.168.1.1." Every device on the segment receives this. ARP Reply: Only the device with that IP responds — via unicast — with "192.168.1.5 is at AA:BB:CC:DD:EE:FF." The sender caches this mapping in its ARP table (arp -a to view). ARP cache entries expire after a timeout (typically 2-20 minutes) to handle devices moving or changing NICs.'
                },
                {
                    title: 'MAC vs IP — When Each Is Used',
                    content: 'MAC addresses are used for LOCAL delivery within a single broadcast domain (same subnet/VLAN). They do not survive router hops — when a frame crosses a router, the source and destination MAC addresses are rewritten for the next segment. IP addresses are used for END-TO-END routing across subnets and the internet. They stay the same from source to destination (unless NAT is involved). Think of it this way: IP is the destination city on the envelope, MAC is the address of the next post office that handles it. At each hop, the MAC changes but the IP stays the same.'
                }
            ]
        },
        practiceType: 'mac-identifier',
        quiz: [
            { question: 'How many bits are in a MAC address?', options: ['32', '48', '64', '128'], correct: 1, explanation: 'MAC addresses are 48 bits (6 bytes) long, written as 6 pairs of hexadecimal digits.' },
            { question: 'What do the first 3 octets of a MAC address represent?', options: ['The host ID', 'The VLAN assignment', 'The OUI (manufacturer identifier)', 'The network address'], correct: 2, explanation: 'The first 3 octets (24 bits) form the OUI — Organizationally Unique Identifier — assigned by IEEE to each manufacturer.' },
            { question: 'What is the MAC broadcast address?', options: ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', '255.255.255.255', '01:00:5E:00:00:00'], correct: 1, explanation: 'FF:FF:FF:FF:FF:FF is the Layer 2 broadcast address. All 48 bits set to 1. Every device on the local segment processes it.' },
            { question: 'How does ARP discover a MAC address?', options: ['DNS lookup', 'Broadcast request asking "Who has this IP?" then unicast reply', 'Checking a routing table', 'Querying the DHCP server'], correct: 1, explanation: 'ARP sends a broadcast request to all devices asking who owns a specific IP. The owner replies with a unicast containing its MAC address.' },
            { question: 'What happens to a MAC address when a frame crosses a router?', options: ['It stays the same end-to-end', 'It is rewritten for the next segment', 'It is encrypted', 'It is removed from the frame'], correct: 1, explanation: 'Routers operate at Layer 3. When forwarding a frame, the router replaces the source MAC with its own outgoing interface MAC and the destination MAC with the next-hop MAC. The IP addresses remain unchanged.' },
            { question: 'At which OSI layer do MAC addresses operate?', options: ['Layer 1 (Physical)', 'Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)'], correct: 1, explanation: 'MAC addresses function at Layer 2 (Data Link layer). They are used for local frame delivery within a broadcast domain.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // 15. IPv6 PRACTICE CHALLENGE
    // ═══════════════════════════════════════════════════════════════════
    'ipv6-challenge': {
        id: 'ipv6-challenge',
        title: 'IPv6 Practice Challenge',
        icon: '<img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
        description: 'Put your IPv6 knowledge to the test. Expand, shorten, classify, and subnet IPv6 addresses under pressure.',
        color: '#3b82f6',
        learn: {
            sections: [
                {
                    title: 'IPv6 Address Review',
                    content: 'IPv6 addresses are 128 bits long, written as 8 groups of 4 hexadecimal digits separated by colons (e.g., 2001:0db8:0000:0000:0000:ff00:0042:8329). Two shortening rules reduce verbosity: (1) Leading zeros in any group can be dropped — 0db8 becomes db8, 0042 becomes 42, 0000 becomes 0. (2) One longest consecutive run of all-zero groups can be replaced with :: (double colon). So 2001:0db8:0000:0000:0000:ff00:0042:8329 shortens to 2001:db8::ff00:42:8329. The :: can only appear once per address — using it twice creates ambiguity about how many zero groups each replaces.'
                },
                {
                    title: 'Address Types Review',
                    content: 'Global Unicast (2000::/3): Starts with 2 or 3 in the first hex digit. These are publicly routable — the IPv6 equivalent of public IPv4 addresses. Link-Local (fe80::/10): Auto-configured on every IPv6 interface. Used for neighbor discovery and router solicitation. Not routable beyond the local link. Multicast (ff00::/8): One-to-many delivery. ff02::1 = all nodes, ff02::2 = all routers. Loopback (::1): The IPv6 equivalent of 127.0.0.1. Unique Local (fc00::/7, practically fd00::/8): Similar to RFC 1918 private addresses — routable within an organization but not on the public internet.'
                },
                {
                    title: 'Subnetting IPv6',
                    content: 'A standard IPv6 allocation is a /48 from an ISP. The address breaks into three parts: Site Prefix (/48, first 48 bits) — identifies the organization. Subnet ID (bits 49-64, 16 bits) — gives 65,536 possible subnets per site. Interface ID (bits 65-128, 64 bits) — identifies the host. The /64 boundary is critical: virtually all IPv6 subnets use a /64 prefix. The interface ID can be generated via EUI-64 (derived from the MAC address by inserting FFFE in the middle and flipping the 7th bit) or via random/privacy extensions (RFC 4941) which rotate to prevent tracking.'
                },
                {
                    title: 'Challenge Tips',
                    content: 'Expanding addresses: Replace :: with the correct number of 0000 groups to make exactly 8 groups total. Pad each group to 4 hex digits. Shortening addresses: Strip leading zeros from each group, find the longest run of consecutive all-zero groups and replace with ::. If two runs tie, replace the leftmost. Identifying types: Check the first few hex digits — 2xxx/3xxx = global unicast, fe80 = link-local, ff = multicast, fc/fd = unique local, ::1 = loopback. Subnet boundaries: With a /48 prefix, you have 16 bits (4 hex digits) for subnetting before the /64 interface ID boundary.'
                }
            ]
        },
        practiceType: 'ipv6-challenge',
        quiz: [
            { question: 'Expand the address 2001:db8::1 to its full form.', options: ['2001:0db8:0000:0000:0000:0000:0000:0001', '2001:0db8:0000:0001:0000:0000:0000:0000', '2001:0db8:0001:0000:0000:0000:0000:0000', '2001:0db8:0000:0000:0000:0000:0001:0000'], correct: 0, explanation: 'The :: replaces 6 groups of zeros (to make 8 total). Full form: 2001:0db8:0000:0000:0000:0000:0000:0001.' },
            { question: 'What is the shortest valid form of fe80:0000:0000:0000:0200:00ff:fe00:0001?', options: ['fe80::200:ff:fe00:1', 'fe80::0200:00ff:fe00:0001', 'fe80:0:0:0:200:ff:fe00:1', 'fe80::200:ff:fe00:0001'], correct: 0, explanation: 'Remove leading zeros in each group: fe80:0:0:0:200:ff:fe00:1. Replace the longest zero run with :: to get fe80::200:ff:fe00:1.' },
            { question: 'An address starts with fd9a:. What type is it?', options: ['Global unicast', 'Link-local', 'Multicast', 'Unique local'], correct: 3, explanation: 'Addresses starting with fd (within fc00::/7) are unique local addresses — the IPv6 equivalent of RFC 1918 private space.' },
            { question: 'Your organization has the prefix 2001:db8:abcd::/48. How many /64 subnets can you create?', options: ['256', '4,096', '65,536', '16,777,216'], correct: 2, explanation: '/48 to /64 leaves 16 bits for subnetting. 2^16 = 65,536 possible /64 subnets per /48 allocation.' },
            { question: 'In EUI-64, what is inserted in the middle of the MAC address to form the interface ID?', options: ['0000', 'FFFF', 'FFFE', 'FF00'], correct: 2, explanation: 'EUI-64 takes the 48-bit MAC, splits it in half, and inserts FFFE in the middle to create a 64-bit interface ID. The 7th bit (U/L) is also flipped.' },
            { question: 'Which of the following is a valid shortened form of 2001:0db8:0000:0000:0000:0000:0000:0000?', options: ['2001:db8::', '2001:db8::0:0:0:0:0', '2001:db8:0:0:0:0:0::', '2001::db8::'], correct: 0, explanation: '2001:db8:: is the correct shortest form. The :: replaces 6 trailing zero groups. 2001::db8:: is invalid (two :: in one address).' }
        ]
    }
};
