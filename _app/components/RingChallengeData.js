/**
 * OASIS Ring Challenge Data
 * Question banks for all 8 house rings
 * 40 questions per house, 320 total
 */

const RingChallengeData = (function() {
    'use strict';

    const BANKS = {
        shield: [
            {
                q: "What type of attack floods a server with traffic to make it unavailable?",
                a: ["DDoS", "Phishing", "SQL Injection", "Ransomware"],
                correct: 0
            },
            {
                q: "Which principle is violated when unauthorized users gain access to data?",
                a: ["Confidentiality", "Integrity", "Availability", "Authentication"],
                correct: 0
            },
            {
                q: "What does MFA stand for in security?",
                a: ["Multi-Factor Authentication", "Multiple File Access", "Managed Firewall Access", "Modern Framework Architecture"],
                correct: 0
            },
            {
                q: "Which attack intercepts communication between two parties?",
                a: ["Man-in-the-Middle", "Brute Force", "Denial of Service", "Cross-Site Scripting"],
                correct: 0
            },
            {
                q: "What type of malware encrypts files and demands payment?",
                a: ["Ransomware", "Trojan", "Worm", "Spyware"],
                correct: 0
            },
            {
                q: "Which security control prevents an incident before it occurs?",
                a: ["Preventive", "Detective", "Corrective", "Compensating"],
                correct: 0
            },
            {
                q: "What is a zero-day vulnerability?",
                a: ["Unknown to vendor", "Patched immediately", "Low severity", "Social engineering"],
                correct: 0
            },
            {
                q: "Which phase comes first in incident response?",
                a: ["Preparation", "Detection", "Containment", "Recovery"],
                correct: 0
            },
            {
                q: "What does XSS stand for?",
                a: ["Cross-Site Scripting", "Extended Security System", "XML Security Suite", "External Session Storage"],
                correct: 0
            },
            {
                q: "Which attack exploits poorly sanitized database inputs?",
                a: ["SQL Injection", "Buffer Overflow", "Directory Traversal", "CSRF"],
                correct: 0
            },
            {
                q: "What principle ensures data hasn't been altered?",
                a: ["Integrity", "Confidentiality", "Availability", "Non-repudiation"],
                correct: 0
            },
            {
                q: "Which threat actor is typically state-sponsored?",
                a: ["APT", "Script Kiddie", "Hacktivist", "Insider"],
                correct: 0
            },
            {
                q: "What type of authentication uses something you are?",
                a: ["Biometric", "Token", "Password", "Certificate"],
                correct: 0
            },
            {
                q: "Which attack sends fraudulent emails to steal credentials?",
                a: ["Phishing", "Vishing", "Smishing", "Pharming"],
                correct: 0
            },
            {
                q: "What does IDS stand for?",
                a: ["Intrusion Detection System", "Internal Data Storage", "Internet Domain Service", "Integrated Defense Shield"],
                correct: 0
            },
            {
                q: "Which security model focuses on 'never trust, always verify'?",
                a: ["Zero Trust", "Defense in Depth", "Least Privilege", "Security by Obscurity"],
                correct: 0
            },
            {
                q: "What type of malware replicates itself without user interaction?",
                a: ["Worm", "Virus", "Trojan", "Rootkit"],
                correct: 0
            },
            {
                q: "Which attack exploits memory management flaws?",
                a: ["Buffer Overflow", "SQL Injection", "XSS", "CSRF"],
                correct: 0
            },
            {
                q: "What does the 'A' in CIA triad represent?",
                a: ["Availability", "Authentication", "Authorization", "Accounting"],
                correct: 0
            },
            {
                q: "Which security control detects incidents as they occur?",
                a: ["Detective", "Preventive", "Corrective", "Deterrent"],
                correct: 0
            },
            {
                q: "What is the purpose of a honeypot?",
                a: ["Lure attackers", "Store passwords", "Filter spam", "Encrypt data"],
                correct: 0
            },
            {
                q: "Which attack tricks users into clicking hidden elements?",
                a: ["Clickjacking", "Session Hijacking", "DNS Spoofing", "ARP Poisoning"],
                correct: 0
            },
            {
                q: "What does SIEM stand for?",
                a: ["Security Information and Event Management", "Secure Internet Email Module", "System Integration Enforcement Method", "Server Infrastructure Event Monitor"],
                correct: 0
            },
            {
                q: "Which principle grants minimum necessary access?",
                a: ["Least Privilege", "Separation of Duties", "Defense in Depth", "Fail Secure"],
                correct: 0
            },
            {
                q: "What type of attack uses multiple compromised systems?",
                a: ["Botnet", "Backdoor", "Logic Bomb", "Keylogger"],
                correct: 0
            },
            {
                q: "Which protocol provides secure remote access?",
                a: ["SSH", "Telnet", "FTP", "HTTP"],
                correct: 0
            },
            {
                q: "What does CVE stand for?",
                a: ["Common Vulnerabilities and Exposures", "Critical Virus Elimination", "Cyber Vector Evaluation", "Certified Vulnerability Expert"],
                correct: 0
            },
            {
                q: "Which attack forges requests from an authenticated user?",
                a: ["CSRF", "XSS", "SQL Injection", "Directory Traversal"],
                correct: 0
            },
            {
                q: "What is the first line of defense in security?",
                a: ["Users", "Firewall", "Antivirus", "IDS"],
                correct: 0
            },
            {
                q: "Which malware hides its presence on a system?",
                a: ["Rootkit", "Adware", "Spyware", "Virus"],
                correct: 0
            },
            {
                q: "What does WAF protect?",
                a: ["Web Applications", "Wireless Networks", "Wide Area Networks", "Workstation Files"],
                correct: 0
            },
            {
                q: "Which attack exhausts system resources like CPU or memory?",
                a: ["Resource Exhaustion", "Eavesdropping", "Spoofing", "Replay Attack"],
                correct: 0
            },
            {
                q: "What is the purpose of defense in depth?",
                a: ["Multiple security layers", "Single strong control", "User education", "Vendor diversity"],
                correct: 0
            },
            {
                q: "Which phase involves removing threats from the environment?",
                a: ["Eradication", "Containment", "Recovery", "Lessons Learned"],
                correct: 0
            },
            {
                q: "What does APT stand for?",
                a: ["Advanced Persistent Threat", "Automated Password Tool", "Application Protection Technology", "Active Penetration Test"],
                correct: 0
            },
            {
                q: "Which attack manipulates DNS responses?",
                a: ["DNS Spoofing", "ARP Poisoning", "MAC Flooding", "VLAN Hopping"],
                correct: 0
            },
            {
                q: "What is the goal of penetration testing?",
                a: ["Find vulnerabilities", "Install patches", "Monitor traffic", "Train users"],
                correct: 0
            },
            {
                q: "Which control responds after an incident occurs?",
                a: ["Corrective", "Preventive", "Detective", "Deterrent"],
                correct: 0
            },
            {
                q: "What does SSO stand for?",
                a: ["Single Sign-On", "Secure Socket Option", "System Security Officer", "Standard Service Operation"],
                correct: 0
            },
            {
                q: "Which attack captures network traffic to steal data?",
                a: ["Sniffing", "Spoofing", "Scanning", "Scripting"],
                correct: 0
            }
        ],

        web: [
            {
                q: "Which OSI layer handles IP addressing?",
                a: ["Network (Layer 3)", "Transport (Layer 4)", "Data Link (Layer 2)", "Application (Layer 7)"],
                correct: 0
            },
            {
                q: "What port does HTTPS use by default?",
                a: ["443", "80", "8080", "22"],
                correct: 0
            },
            {
                q: "How many usable host addresses in a /24 subnet?",
                a: ["254", "256", "255", "253"],
                correct: 0
            },
            {
                q: "Which device operates at Layer 2 of the OSI model?",
                a: ["Switch", "Router", "Hub", "Gateway"],
                correct: 0
            },
            {
                q: "What DNS record type maps a domain to an IPv4 address?",
                a: ["A", "AAAA", "CNAME", "MX"],
                correct: 0
            },
            {
                q: "Which protocol is connectionless?",
                a: ["UDP", "TCP", "FTP", "SSH"],
                correct: 0
            },
            {
                q: "What is the default subnet mask for a Class C network?",
                a: ["255.255.255.0", "255.255.0.0", "255.0.0.0", "255.255.255.128"],
                correct: 0
            },
            {
                q: "Which wireless standard operates at 5 GHz?",
                a: ["802.11ac", "802.11b", "802.11g", "Bluetooth"],
                correct: 0
            },
            {
                q: "What does DHCP provide to clients?",
                a: ["IP addresses", "Domain names", "Encryption", "Routing tables"],
                correct: 0
            },
            {
                q: "Which protocol resolves IP addresses to MAC addresses?",
                a: ["ARP", "DNS", "ICMP", "RARP"],
                correct: 0
            },
            {
                q: "What is the loopback address in IPv4?",
                a: ["127.0.0.1", "192.168.1.1", "10.0.0.1", "0.0.0.0"],
                correct: 0
            },
            {
                q: "Which TCP flag initiates a connection?",
                a: ["SYN", "ACK", "FIN", "RST"],
                correct: 0
            },
            {
                q: "What does NAT stand for?",
                a: ["Network Address Translation", "Network Application Tool", "New Access Technology", "Node Authentication Token"],
                correct: 0
            },
            {
                q: "Which protocol is used for email retrieval?",
                a: ["IMAP", "SMTP", "FTP", "SNMP"],
                correct: 0
            },
            {
                q: "What is the maximum hop count for RIP?",
                a: ["15", "16", "255", "100"],
                correct: 0
            },
            {
                q: "Which DNS record type is used for mail servers?",
                a: ["MX", "A", "CNAME", "PTR"],
                correct: 0
            },
            {
                q: "What does MTU stand for?",
                a: ["Maximum Transmission Unit", "Multiple Transfer Upload", "Managed Terminal User", "Message Type Unique"],
                correct: 0
            },
            {
                q: "Which protocol uses port 22?",
                a: ["SSH", "Telnet", "FTP", "HTTP"],
                correct: 0
            },
            {
                q: "What is the purpose of a default gateway?",
                a: ["Route traffic outside local network", "Assign IP addresses", "Filter packets", "Resolve hostnames"],
                correct: 0
            },
            {
                q: "Which OSI layer handles end-to-end communication?",
                a: ["Transport (Layer 4)", "Network (Layer 3)", "Session (Layer 5)", "Data Link (Layer 2)"],
                correct: 0
            },
            {
                q: "What does VLAN stand for?",
                a: ["Virtual Local Area Network", "Very Large Area Network", "Variable Link Access Node", "Verified LAN"],
                correct: 0
            },
            {
                q: "Which protocol provides reliable delivery?",
                a: ["TCP", "UDP", "IP", "ICMP"],
                correct: 0
            },
            {
                q: "What is the IPv6 loopback address?",
                a: ["::1", "127.0.0.1", "0:0:0:0:0:0:0:1", "FF02::1"],
                correct: 0
            },
            {
                q: "Which device forwards packets between networks?",
                a: ["Router", "Switch", "Hub", "Bridge"],
                correct: 0
            },
            {
                q: "What does TTL stand for in networking?",
                a: ["Time To Live", "Transfer Total Length", "Transmission Type Layer", "Trusted Terminal Link"],
                correct: 0
            },
            {
                q: "Which protocol uses port 53?",
                a: ["DNS", "DHCP", "HTTP", "FTP"],
                correct: 0
            },
            {
                q: "What is a private IP address range?",
                a: ["10.0.0.0/8", "8.8.8.0/24", "172.200.0.0/16", "192.200.1.0/24"],
                correct: 0
            },
            {
                q: "Which protocol sends ICMP echo requests?",
                a: ["Ping", "Traceroute", "Netstat", "ARP"],
                correct: 0
            },
            {
                q: "What does BGP stand for?",
                a: ["Border Gateway Protocol", "Basic Gateway Process", "Broadband Gateway Provider", "Binary Group Protocol"],
                correct: 0
            },
            {
                q: "Which wireless security is most secure?",
                a: ["WPA3", "WPA2", "WEP", "WPA"],
                correct: 0
            },
            {
                q: "What is the purpose of spanning tree protocol?",
                a: ["Prevent loops", "Load balancing", "Encryption", "Compression"],
                correct: 0
            },
            {
                q: "Which layer handles frame transmission?",
                a: ["Data Link (Layer 2)", "Physical (Layer 1)", "Network (Layer 3)", "Transport (Layer 4)"],
                correct: 0
            },
            {
                q: "What does QoS stand for?",
                a: ["Quality of Service", "Queue of Signals", "Quick Operation System", "Quantified Output Standard"],
                correct: 0
            },
            {
                q: "Which protocol is used for network time synchronization?",
                a: ["NTP", "SNMP", "SMTP", "FTP"],
                correct: 0
            },
            {
                q: "What is the broadcast address for 192.168.1.0/24?",
                a: ["192.168.1.255", "192.168.1.0", "192.168.1.254", "192.168.255.255"],
                correct: 0
            },
            {
                q: "Which DNS record type creates an alias?",
                a: ["CNAME", "A", "MX", "NS"],
                correct: 0
            },
            {
                q: "What does SMTP use for secure connections?",
                a: ["Port 587/TLS", "Port 25", "Port 110", "Port 143"],
                correct: 0
            },
            {
                q: "Which protocol maps domain names to IP addresses?",
                a: ["DNS", "DHCP", "ARP", "NAT"],
                correct: 0
            },
            {
                q: "What is the maximum Ethernet frame size?",
                a: ["1518 bytes", "1024 bytes", "2048 bytes", "512 bytes"],
                correct: 0
            },
            {
                q: "Which topology connects all devices to a central hub?",
                a: ["Star", "Ring", "Mesh", "Bus"],
                correct: 0
            }
        ],

        forge: [
            {
                q: "What connects the CPU to RAM?",
                a: ["Memory Controller", "Chipset", "PCI-E Slot", "SATA Controller"],
                correct: 0
            },
            {
                q: "Which connector is reversible?",
                a: ["USB-C", "USB-A", "HDMI", "DisplayPort"],
                correct: 0
            },
            {
                q: "What does NVMe interface with?",
                a: ["PCIe", "SATA", "USB", "Ethernet"],
                correct: 0
            },
            {
                q: "Which RAID level provides mirroring?",
                a: ["RAID 1", "RAID 0", "RAID 5", "RAID 10"],
                correct: 0
            },
            {
                q: "What do POST beep codes indicate?",
                a: ["Hardware errors", "Software updates", "Network status", "Fan speeds"],
                correct: 0
            },
            {
                q: "Which motherboard form factor is smallest?",
                a: ["Mini-ITX", "Micro-ATX", "ATX", "E-ATX"],
                correct: 0
            },
            {
                q: "What is the main advantage of SSD over HDD?",
                a: ["Speed", "Capacity", "Price", "Durability"],
                correct: 0
            },
            {
                q: "Which component generates the most heat?",
                a: ["CPU", "RAM", "SSD", "Motherboard"],
                correct: 0
            },
            {
                q: "What does the northbridge handle?",
                a: ["High-speed components", "USB devices", "Audio", "Network"],
                correct: 0
            },
            {
                q: "Which connector powers the motherboard?",
                a: ["24-pin ATX", "8-pin EPS", "6-pin PCIe", "SATA"],
                correct: 0
            },
            {
                q: "What is thermal paste used for?",
                a: ["Heat transfer", "Electrical insulation", "Cable management", "Static prevention"],
                correct: 0
            },
            {
                q: "Which printer uses toner?",
                a: ["Laser", "Inkjet", "Thermal", "Dot Matrix"],
                correct: 0
            },
            {
                q: "What does BIOS stand for?",
                a: ["Basic Input/Output System", "Binary Interface Operating System", "Boot Initialization Output Service", "Base Integrated OS"],
                correct: 0
            },
            {
                q: "Which cable carries both video and audio?",
                a: ["HDMI", "VGA", "DVI", "DisplayPort"],
                correct: 0
            },
            {
                q: "What is the purpose of ECC memory?",
                a: ["Error correction", "Faster speed", "Lower power", "RGB lighting"],
                correct: 0
            },
            {
                q: "Which storage interface is fastest?",
                a: ["NVMe", "SATA III", "SATA II", "IDE"],
                correct: 0
            },
            {
                q: "What does GPU stand for?",
                a: ["Graphics Processing Unit", "General Purpose Unit", "Global Processing Utility", "Game Performance Upgrade"],
                correct: 0
            },
            {
                q: "Which component stores BIOS settings?",
                a: ["CMOS battery", "Hard drive", "RAM", "CPU cache"],
                correct: 0
            },
            {
                q: "What is the standard Ethernet cable connector?",
                a: ["RJ-45", "RJ-11", "USB-A", "BNC"],
                correct: 0
            },
            {
                q: "Which RAID level requires at least 3 drives?",
                a: ["RAID 5", "RAID 0", "RAID 1", "RAID 2"],
                correct: 0
            },
            {
                q: "What does PSU stand for?",
                a: ["Power Supply Unit", "Processing System Upgrade", "Peripheral Storage Unit", "Primary Software Update"],
                correct: 0
            },
            {
                q: "Which technology allows CPU to run cooler when idle?",
                a: ["Power management", "Hyper-threading", "Virtualization", "Overclocking"],
                correct: 0
            },
            {
                q: "What is the purpose of a heat sink?",
                a: ["Dissipate heat", "Generate power", "Store data", "Filter dust"],
                correct: 0
            },
            {
                q: "Which connector provides power to the CPU?",
                a: ["8-pin EPS", "24-pin ATX", "6-pin PCIe", "4-pin Molex"],
                correct: 0
            },
            {
                q: "What does DDR stand for in RAM?",
                a: ["Double Data Rate", "Digital Data Register", "Dual Drive RAM", "Dynamic Data Routing"],
                correct: 0
            },
            {
                q: "Which component determines maximum RAM capacity?",
                a: ["Motherboard", "CPU", "PSU", "GPU"],
                correct: 0
            },
            {
                q: "What is the purpose of chipset?",
                a: ["Manage data flow", "Process graphics", "Store BIOS", "Cool CPU"],
                correct: 0
            },
            {
                q: "Which display connector is analog?",
                a: ["VGA", "HDMI", "DisplayPort", "DVI-D"],
                correct: 0
            },
            {
                q: "What does RPM measure in hard drives?",
                a: ["Spindle speed", "Read speed", "Power consumption", "Cache size"],
                correct: 0
            },
            {
                q: "Which technology allows one CPU core to act as two?",
                a: ["Hyper-threading", "Overclocking", "Turbo Boost", "Multi-core"],
                correct: 0
            },
            {
                q: "What is the purpose of case fans?",
                a: ["Airflow", "Power", "Data transfer", "Noise reduction"],
                correct: 0
            },
            {
                q: "Which RAID provides striping without redundancy?",
                a: ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
                correct: 0
            },
            {
                q: "What does UEFI replace?",
                a: ["BIOS", "POST", "CMOS", "Bootloader"],
                correct: 0
            },
            {
                q: "Which component determines graphics performance?",
                a: ["GPU", "CPU", "RAM", "SSD"],
                correct: 0
            },
            {
                q: "What is the purpose of standoffs?",
                a: ["Prevent motherboard shorts", "Improve airflow", "Reduce noise", "Mount drives"],
                correct: 0
            },
            {
                q: "Which connector powers SATA drives?",
                a: ["SATA power", "Molex", "PCIe", "EPS"],
                correct: 0
            },
            {
                q: "What does clock speed measure?",
                a: ["CPU frequency", "RAM capacity", "Storage speed", "Network speed"],
                correct: 0
            },
            {
                q: "Which technology extends CPU lifespan?",
                a: ["Proper cooling", "Overclocking", "Maximum voltage", "Constant load"],
                correct: 0
            },
            {
                q: "What is the purpose of CPU cache?",
                a: ["Fast temporary storage", "Long-term storage", "Graphics processing", "Network buffering"],
                correct: 0
            },
            {
                q: "Which component converts AC to DC power?",
                a: ["PSU", "Motherboard", "UPS", "Surge protector"],
                correct: 0
            }
        ],

        script: [
            {
                q: "Which command lists files in Linux?",
                a: ["ls", "dir", "list", "show"],
                correct: 0
            },
            {
                q: "What does chmod 755 mean?",
                a: ["rwxr-xr-x", "rwxrwxrwx", "rw-r--r--", "r-xr-xr-x"],
                correct: 0
            },
            {
                q: "Which symbol redirects output to a file?",
                a: [">", "|", "&", ">>"],
                correct: 0
            },
            {
                q: "What does 'grep' do?",
                a: ["Search text patterns", "Group files", "Remove directories", "Grant permissions"],
                correct: 0
            },
            {
                q: "Which command shows running processes?",
                a: ["ps", "ls", "top", "proc"],
                correct: 0
            },
            {
                q: "What does 'sudo' stand for?",
                a: ["Superuser do", "System update", "Switch user do", "Secureudo"],
                correct: 0
            },
            {
                q: "Which command changes directories?",
                a: ["cd", "chdir", "dir", "goto"],
                correct: 0
            },
            {
                q: "What does '|' (pipe) do in bash?",
                a: ["Send output to next command", "Redirect to file", "Run in background", "Comment"],
                correct: 0
            },
            {
                q: "Which command displays file contents?",
                a: ["cat", "show", "display", "view"],
                correct: 0
            },
            {
                q: "What does 'apt-get' do on Debian?",
                a: ["Package management", "Network configuration", "User management", "File transfer"],
                correct: 0
            },
            {
                q: "Which character starts a comment in bash?",
                a: ["#", "//", "/*", "--"],
                correct: 0
            },
            {
                q: "What does 'tar' command do?",
                a: ["Archive files", "Transfer files", "Target systems", "Table records"],
                correct: 0
            },
            {
                q: "Which command finds files by name?",
                a: ["find", "locate", "search", "whereis"],
                correct: 0
            },
            {
                q: "What does 'chmod +x' do?",
                a: ["Make executable", "Add user", "Create directory", "Export variable"],
                correct: 0
            },
            {
                q: "Which command shows disk usage?",
                a: ["df", "du", "disk", "space"],
                correct: 0
            },
            {
                q: "What does 'echo $PATH' display?",
                a: ["Executable search paths", "Current directory", "Home directory", "File permissions"],
                correct: 0
            },
            {
                q: "Which command kills a process by PID?",
                a: ["kill", "stop", "end", "terminate"],
                correct: 0
            },
            {
                q: "What does 'cron' do?",
                a: ["Schedule tasks", "Create users", "Copy files", "Compile code"],
                correct: 0
            },
            {
                q: "Which command shows network connections?",
                a: ["netstat", "ifconfig", "ping", "route"],
                correct: 0
            },
            {
                q: "What does 'awk' primarily process?",
                a: ["Text/columns", "Archives", "Audio files", "Network packets"],
                correct: 0
            },
            {
                q: "Which command compresses files?",
                a: ["gzip", "zip", "compress", "pack"],
                correct: 0
            },
            {
                q: "What does '/etc/passwd' contain?",
                a: ["User account info", "Passwords", "System logs", "Network config"],
                correct: 0
            },
            {
                q: "Which command changes file ownership?",
                a: ["chown", "chmod", "chgrp", "own"],
                correct: 0
            },
            {
                q: "What does 'tail -f' do?",
                a: ["Follow file updates", "Show file type", "Filter content", "Transfer files"],
                correct: 0
            },
            {
                q: "Which variable stores last command exit status?",
                a: ["$?", "$!", "$$", "$#"],
                correct: 0
            },
            {
                q: "What does 'ssh' provide?",
                a: ["Secure shell access", "System shutdown", "Service status", "Screen sharing"],
                correct: 0
            },
            {
                q: "Which command searches command history?",
                a: ["history | grep", "search", "find", "locate"],
                correct: 0
            },
            {
                q: "What does 'ln -s' create?",
                a: ["Symbolic link", "Hard link", "Directory", "File"],
                correct: 0
            },
            {
                q: "Which command shows system uptime?",
                a: ["uptime", "status", "time", "sys"],
                correct: 0
            },
            {
                q: "What does 'sed' stand for?",
                a: ["Stream editor", "System editor", "Secure editor", "Standard editor"],
                correct: 0
            },
            {
                q: "Which command displays current user?",
                a: ["whoami", "who", "id", "user"],
                correct: 0
            },
            {
                q: "What does 'mv' command do?",
                a: ["Move/rename files", "Make volume", "Mount volume", "Modify variables"],
                correct: 0
            },
            {
                q: "Which operator runs command in background?",
                a: ["&", "|", ">", ">>"],
                correct: 0
            },
            {
                q: "What does '/dev/null' do?",
                a: ["Discards output", "Null device", "Empty directory", "Root directory"],
                correct: 0
            },
            {
                q: "Which command shows file permissions?",
                a: ["ls -l", "chmod", "stat", "perm"],
                correct: 0
            },
            {
                q: "What does 'source' command do?",
                a: ["Execute script in current shell", "Show source code", "Download files", "Search files"],
                correct: 0
            },
            {
                q: "Which loop structure repeats until condition fails?",
                a: ["while", "for", "until", "foreach"],
                correct: 0
            },
            {
                q: "What does 'rm -rf' do?",
                a: ["Force remove recursively", "Restore files", "Read manifest", "Reset filesystem"],
                correct: 0
            },
            {
                q: "Which command shows environment variables?",
                a: ["env", "var", "set", "export"],
                correct: 0
            },
            {
                q: "What does 'curl' do?",
                a: ["Transfer data from URLs", "Create URLs", "Compress files", "Count records"],
                correct: 0
            }
        ],

        cloud: [
            {
                q: "Which AWS service is serverless compute?",
                a: ["Lambda", "EC2", "ECS", "Lightsail"],
                correct: 0
            },
            {
                q: "What type of cloud is owned by one organization?",
                a: ["Private", "Public", "Hybrid", "Community"],
                correct: 0
            },
            {
                q: "Which service model provides virtual machines?",
                a: ["IaaS", "PaaS", "SaaS", "FaaS"],
                correct: 0
            },
            {
                q: "What does S3 provide?",
                a: ["Object storage", "Block storage", "File storage", "Database"],
                correct: 0
            },
            {
                q: "Which service distributes content globally?",
                a: ["CloudFront", "S3", "Route53", "VPC"],
                correct: 0
            },
            {
                q: "What is the benefit of auto-scaling?",
                a: ["Adjust capacity automatically", "Reduce costs always", "Increase speed", "Improve security"],
                correct: 0
            },
            {
                q: "Which AWS service is a managed database?",
                a: ["RDS", "EC2", "S3", "Lambda"],
                correct: 0
            },
            {
                q: "What does elasticity mean in cloud?",
                a: ["Scale up and down", "Always available", "Highly secure", "Low latency"],
                correct: 0
            },
            {
                q: "Which service manages DNS?",
                a: ["Route53", "VPC", "CloudWatch", "IAM"],
                correct: 0
            },
            {
                q: "What is a container's main advantage over VMs?",
                a: ["Lightweight", "More secure", "Easier to use", "Faster CPU"],
                correct: 0
            },
            {
                q: "Which AWS service monitors resources?",
                a: ["CloudWatch", "CloudTrail", "Config", "Inspector"],
                correct: 0
            },
            {
                q: "What does VPC stand for?",
                a: ["Virtual Private Cloud", "Virtual Public Cloud", "Variable Platform Container", "Verified Process Control"],
                correct: 0
            },
            {
                q: "Which storage type is used by EC2 root volumes?",
                a: ["EBS", "S3", "EFS", "Glacier"],
                correct: 0
            },
            {
                q: "What is the purpose of load balancing?",
                a: ["Distribute traffic", "Store data", "Monitor logs", "Encrypt data"],
                correct: 0
            },
            {
                q: "Which deployment model combines public and private cloud?",
                a: ["Hybrid", "Community", "Multi-cloud", "Federated"],
                correct: 0
            },
            {
                q: "What does IAM manage?",
                a: ["Access and permissions", "Images", "Instances", "Infrastructure"],
                correct: 0
            },
            {
                q: "Which service provides managed Kubernetes?",
                a: ["EKS", "ECS", "Fargate", "Batch"],
                correct: 0
            },
            {
                q: "What is cold storage in cloud?",
                a: ["Archive/infrequent access", "Fast access", "Hot data", "Real-time data"],
                correct: 0
            },
            {
                q: "Which service audits AWS account activity?",
                a: ["CloudTrail", "CloudWatch", "Config", "GuardDuty"],
                correct: 0
            },
            {
                q: "What does CDN stand for?",
                a: ["Content Delivery Network", "Cloud Data Node", "Cached Domain Name", "Central Distribution Network"],
                correct: 0
            },
            {
                q: "Which service provides block storage?",
                a: ["EBS", "S3", "Glacier", "EFS"],
                correct: 0
            },
            {
                q: "What is the benefit of managed services?",
                a: ["Less operational overhead", "Lower cost always", "Faster performance", "More control"],
                correct: 0
            },
            {
                q: "Which service provides NoSQL database?",
                a: ["DynamoDB", "RDS", "Redshift", "Aurora"],
                correct: 0
            },
            {
                q: "What does serverless mean?",
                a: ["No server management", "No servers used", "Free hosting", "Unlimited scaling"],
                correct: 0
            },
            {
                q: "Which AWS service runs containers?",
                a: ["ECS", "EC2", "Lambda", "S3"],
                correct: 0
            },
            {
                q: "What is a region in cloud?",
                a: ["Geographic location", "Availability zone", "Data center", "Virtual network"],
                correct: 0
            },
            {
                q: "Which service provides file storage?",
                a: ["EFS", "S3", "EBS", "Glacier"],
                correct: 0
            },
            {
                q: "What does SLA guarantee?",
                a: ["Service availability", "Low cost", "Fast speed", "Zero downtime"],
                correct: 0
            },
            {
                q: "Which service sends notifications?",
                a: ["SNS", "SQS", "SES", "EventBridge"],
                correct: 0
            },
            {
                q: "What is multi-tenancy?",
                a: ["Shared infrastructure", "Multiple clouds", "Many regions", "Redundant systems"],
                correct: 0
            },
            {
                q: "Which service provides message queuing?",
                a: ["SQS", "SNS", "Kinesis", "EventBridge"],
                correct: 0
            },
            {
                q: "What does availability zone provide?",
                a: ["Fault isolation", "Global reach", "Low latency", "High speed"],
                correct: 0
            },
            {
                q: "Which service analyzes big data?",
                a: ["EMR", "RDS", "DynamoDB", "S3"],
                correct: 0
            },
            {
                q: "What is the purpose of CloudFormation?",
                a: ["Infrastructure as code", "Monitor logs", "Deploy apps", "Manage users"],
                correct: 0
            },
            {
                q: "Which service provides API management?",
                a: ["API Gateway", "Lambda", "CloudFront", "Route53"],
                correct: 0
            },
            {
                q: "What does pay-as-you-go mean?",
                a: ["Pay for usage only", "Fixed monthly fee", "Unlimited free tier", "Prepay discount"],
                correct: 0
            },
            {
                q: "Which service scans for vulnerabilities?",
                a: ["Inspector", "GuardDuty", "Shield", "WAF"],
                correct: 0
            },
            {
                q: "What is edge location?",
                a: ["CDN endpoint", "Data center", "Availability zone", "Region"],
                correct: 0
            },
            {
                q: "Which service provides data warehousing?",
                a: ["Redshift", "RDS", "DynamoDB", "Aurora"],
                correct: 0
            },
            {
                q: "What does snapshot provide?",
                a: ["Point-in-time backup", "Live replica", "Continuous sync", "Data migration"],
                correct: 0
            }
        ],

        code: [
            {
                q: "What does 'git clone' do?",
                a: ["Copy repository", "Create branch", "Commit changes", "Merge branches"],
                correct: 0
            },
            {
                q: "Which command stages files for commit?",
                a: ["git add", "git stage", "git commit", "git push"],
                correct: 0
            },
            {
                q: "What does 'git rebase' do?",
                a: ["Reapply commits on new base", "Create new branch", "Delete commits", "Merge branches"],
                correct: 0
            },
            {
                q: "Which CI/CD stage runs tests?",
                a: ["Build/Test", "Deploy", "Plan", "Monitor"],
                correct: 0
            },
            {
                q: "What does Docker containerize?",
                a: ["Applications", "Virtual machines", "Operating systems", "Networks"],
                correct: 0
            },
            {
                q: "Which file defines Docker image?",
                a: ["Dockerfile", "docker.yml", "container.json", "image.conf"],
                correct: 0
            },
            {
                q: "What is a Kubernetes pod?",
                a: ["Smallest deployable unit", "Container registry", "Load balancer", "Network policy"],
                correct: 0
            },
            {
                q: "Which tool manages infrastructure as code?",
                a: ["Terraform", "Docker", "Jenkins", "Git"],
                correct: 0
            },
            {
                q: "What does 'git pull' do?",
                a: ["Fetch and merge", "Push changes", "Create branch", "Delete branch"],
                correct: 0
            },
            {
                q: "Which deployment strategy tests new version with small traffic?",
                a: ["Canary", "Blue-green", "Rolling", "Recreate"],
                correct: 0
            },
            {
                q: "What does CI stand for?",
                a: ["Continuous Integration", "Code Integration", "Container Image", "Commit Interval"],
                correct: 0
            },
            {
                q: "Which command shows git history?",
                a: ["git log", "git history", "git show", "git list"],
                correct: 0
            },
            {
                q: "What is the purpose of .gitignore?",
                a: ["Exclude files from tracking", "Ignore commits", "Block users", "Hide branches"],
                correct: 0
            },
            {
                q: "Which tool automates configuration management?",
                a: ["Ansible", "Docker", "Git", "Kubernetes"],
                correct: 0
            },
            {
                q: "What does 'docker build' create?",
                a: ["Image", "Container", "Volume", "Network"],
                correct: 0
            },
            {
                q: "Which command creates a git branch?",
                a: ["git branch", "git create", "git new", "git fork"],
                correct: 0
            },
            {
                q: "What is a merge conflict?",
                a: ["Overlapping changes", "Network error", "Missing file", "Syntax error"],
                correct: 0
            },
            {
                q: "Which Kubernetes object exposes pods?",
                a: ["Service", "Deployment", "Pod", "ConfigMap"],
                correct: 0
            },
            {
                q: "What does 'git commit' do?",
                a: ["Save staged changes", "Push to remote", "Create branch", "Merge branches"],
                correct: 0
            },
            {
                q: "Which deployment has two identical environments?",
                a: ["Blue-green", "Canary", "Rolling", "A/B"],
                correct: 0
            },
            {
                q: "What is DevOps?",
                a: ["Dev + Ops collaboration", "Development only", "Operations only", "QA process"],
                correct: 0
            },
            {
                q: "Which command shows docker containers?",
                a: ["docker ps", "docker list", "docker show", "docker get"],
                correct: 0
            },
            {
                q: "What does 'git push' do?",
                a: ["Upload commits", "Pull changes", "Create branch", "Delete branch"],
                correct: 0
            },
            {
                q: "Which file orchestrates Docker containers?",
                a: ["docker-compose.yml", "Dockerfile", "compose.json", "container.yml"],
                correct: 0
            },
            {
                q: "What is version control?",
                a: ["Track code changes", "Test code", "Deploy code", "Build code"],
                correct: 0
            },
            {
                q: "Which command switches git branches?",
                a: ["git checkout", "git switch", "git change", "git branch"],
                correct: 0
            },
            {
                q: "What does Jenkins automate?",
                a: ["CI/CD pipelines", "Container deployment", "Code review", "Database backups"],
                correct: 0
            },
            {
                q: "Which Kubernetes object manages pods?",
                a: ["Deployment", "Service", "ConfigMap", "Secret"],
                correct: 0
            },
            {
                q: "What is rolling deployment?",
                a: ["Gradual update", "Instant switch", "Parallel versions", "Manual deployment"],
                correct: 0
            },
            {
                q: "Which command merges branches?",
                a: ["git merge", "git combine", "git join", "git unite"],
                correct: 0
            },
            {
                q: "What does container orchestration manage?",
                a: ["Container lifecycle", "Image building", "Code commits", "Network cables"],
                correct: 0
            },
            {
                q: "Which git command shows changes?",
                a: ["git diff", "git changes", "git show", "git status"],
                correct: 0
            },
            {
                q: "What is a Docker registry?",
                a: ["Image repository", "Container runtime", "Network driver", "Volume manager"],
                correct: 0
            },
            {
                q: "Which command undoes last commit?",
                a: ["git reset HEAD~1", "git undo", "git revert", "git delete"],
                correct: 0
            },
            {
                q: "What does Helm manage?",
                a: ["Kubernetes packages", "Docker images", "Git repositories", "Cloud resources"],
                correct: 0
            },
            {
                q: "Which command shows git status?",
                a: ["git status", "git state", "git info", "git show"],
                correct: 0
            },
            {
                q: "What is immutable infrastructure?",
                a: ["Replace, not modify", "Never changes", "Highly available", "Self-healing"],
                correct: 0
            },
            {
                q: "Which file stores Docker image layers?",
                a: ["Image", "Container", "Volume", "Network"],
                correct: 0
            },
            {
                q: "What does 'git fetch' do?",
                a: ["Download commits", "Upload commits", "Create branch", "Delete branch"],
                correct: 0
            },
            {
                q: "Which practice merges code frequently?",
                a: ["Continuous Integration", "Waterfall", "Manual deployment", "Feature branching"],
                correct: 0
            }
        ],

        key: [
            {
                q: "Which encryption uses the same key for encrypt/decrypt?",
                a: ["Symmetric", "Asymmetric", "Hashing", "Digital signature"],
                correct: 0
            },
            {
                q: "What algorithm is AES?",
                a: ["Symmetric encryption", "Asymmetric encryption", "Hashing", "Key exchange"],
                correct: 0
            },
            {
                q: "Which uses public and private keys?",
                a: ["Asymmetric encryption", "Symmetric encryption", "Hashing", "Encoding"],
                correct: 0
            },
            {
                q: "What is RSA used for?",
                a: ["Asymmetric encryption", "Symmetric encryption", "Hashing only", "Compression"],
                correct: 0
            },
            {
                q: "Which creates a fixed-size output?",
                a: ["Hash function", "Encryption", "Encoding", "Compression"],
                correct: 0
            },
            {
                q: "What is SHA-256?",
                a: ["Hash algorithm", "Encryption algorithm", "Key exchange", "Cipher"],
                correct: 0
            },
            {
                q: "Which protocol securely exchanges keys?",
                a: ["Diffie-Hellman", "AES", "RSA", "MD5"],
                correct: 0
            },
            {
                q: "What does hashing provide?",
                a: ["Integrity", "Confidentiality", "Availability", "Authentication"],
                correct: 0
            },
            {
                q: "Which is a symmetric algorithm?",
                a: ["DES", "RSA", "ECC", "DSA"],
                correct: 0
            },
            {
                q: "What proves message authenticity?",
                a: ["Digital signature", "Encryption", "Hashing", "Encoding"],
                correct: 0
            },
            {
                q: "Which is a broken hash algorithm?",
                a: ["MD5", "SHA-256", "SHA-3", "BLAKE2"],
                correct: 0
            },
            {
                q: "What does a CA issue?",
                a: ["Digital certificates", "Encryption keys", "Hash values", "Passwords"],
                correct: 0
            },
            {
                q: "Which cipher shifts letters?",
                a: ["Caesar", "Vigenere", "RSA", "AES"],
                correct: 0
            },
            {
                q: "What is the difference between encoding and encryption?",
                a: ["Encoding doesn't need a key", "Encoding is more secure", "Encoding uses hashing", "No difference"],
                correct: 0
            },
            {
                q: "Which provides non-repudiation?",
                a: ["Digital signature", "Symmetric encryption", "Hashing", "Encoding"],
                correct: 0
            },
            {
                q: "What is a salt in cryptography?",
                a: ["Random data added to input", "Encryption key", "Hash output", "Cipher type"],
                correct: 0
            },
            {
                q: "Which algorithm is elliptic curve?",
                a: ["ECC", "RSA", "AES", "DES"],
                correct: 0
            },
            {
                q: "What does PKI stand for?",
                a: ["Public Key Infrastructure", "Private Key Integration", "Password Key Interface", "Protected Kernel Image"],
                correct: 0
            },
            {
                q: "Which attack tries all possible keys?",
                a: ["Brute force", "Rainbow table", "Dictionary", "Social engineering"],
                correct: 0
            },
            {
                q: "What is perfect forward secrecy?",
                a: ["Session keys not derived from master", "Unbreakable encryption", "Quantum-resistant", "Zero-knowledge proof"],
                correct: 0
            },
            {
                q: "Which uses a substitution cipher?",
                a: ["Vigenere", "XOR", "DES", "SHA"],
                correct: 0
            },
            {
                q: "What does CSR stand for?",
                a: ["Certificate Signing Request", "Cipher Security Requirement", "Crypto Standard Regulation", "Central Security Registry"],
                correct: 0
            },
            {
                q: "Which is faster for large data?",
                a: ["Symmetric encryption", "Asymmetric encryption", "Hashing", "Digital signature"],
                correct: 0
            },
            {
                q: "What is a rainbow table?",
                a: ["Precomputed hashes", "Color code cipher", "Encryption matrix", "Key schedule"],
                correct: 0
            },
            {
                q: "Which provides confidentiality?",
                a: ["Encryption", "Hashing", "Encoding", "Compression"],
                correct: 0
            },
            {
                q: "What is the key size of AES-256?",
                a: ["256 bits", "128 bits", "512 bits", "2048 bits"],
                correct: 0
            },
            {
                q: "Which attack exploits hash collisions?",
                a: ["Birthday attack", "Brute force", "Man-in-the-middle", "Replay attack"],
                correct: 0
            },
            {
                q: "What is steganography?",
                a: ["Hide data in other data", "Strong encryption", "Key exchange", "Hash function"],
                correct: 0
            },
            {
                q: "Which protocol secures web traffic?",
                a: ["TLS", "FTP", "Telnet", "SMTP"],
                correct: 0
            },
            {
                q: "What is a block cipher?",
                a: ["Encrypts fixed-size blocks", "Encrypts one bit at a time", "Hash function", "Key exchange"],
                correct: 0
            },
            {
                q: "Which is a stream cipher?",
                a: ["RC4", "AES", "DES", "RSA"],
                correct: 0
            },
            {
                q: "What does HMAC provide?",
                a: ["Message authentication", "Encryption", "Key exchange", "Compression"],
                correct: 0
            },
            {
                q: "Which uses trapdoor function?",
                a: ["RSA", "AES", "DES", "MD5"],
                correct: 0
            },
            {
                q: "What is initialization vector (IV)?",
                a: ["Random starting value", "Encryption key", "Hash output", "Certificate"],
                correct: 0
            },
            {
                q: "Which provides forward secrecy?",
                a: ["Ephemeral keys", "Static keys", "Shared secrets", "Certificates"],
                correct: 0
            },
            {
                q: "What is a nonce?",
                a: ["Number used once", "New encryption", "Network cipher", "Null certificate"],
                correct: 0
            },
            {
                q: "Which standard defines AES?",
                a: ["FIPS 197", "RFC 2616", "ISO 27001", "NIST 800-53"],
                correct: 0
            },
            {
                q: "What is key stretching?",
                a: ["Increase hash computation time", "Make keys longer", "Expand ciphertext", "Split keys"],
                correct: 0
            },
            {
                q: "Which mode chains blocks together?",
                a: ["CBC", "ECB", "CTR", "GCM"],
                correct: 0
            },
            {
                q: "What does CRL contain?",
                a: ["Revoked certificates", "Current certificates", "Root certificates", "Lost certificates"],
                correct: 0
            }
        ],

        eye: [
            {
                q: "Which log entry indicates a brute force attack?",
                a: ["Multiple failed logins", "Successful login", "System restart", "File access"],
                correct: 0
            },
            {
                q: "What does SIEM correlate?",
                a: ["Security events", "System errors", "Network speeds", "User files"],
                correct: 0
            },
            {
                q: "What is the difference between IDS and IPS?",
                a: ["IPS can block, IDS only detects", "IPS is faster", "IDS is more accurate", "No difference"],
                correct: 0
            },
            {
                q: "Which alert severity requires immediate action?",
                a: ["Critical", "High", "Medium", "Low"],
                correct: 0
            },
            {
                q: "What does packet analysis examine?",
                a: ["Network traffic", "Log files", "User behavior", "System performance"],
                correct: 0
            },
            {
                q: "Which is an Indicator of Compromise?",
                a: ["Suspicious hash", "Normal login", "Scheduled backup", "System update"],
                correct: 0
            },
            {
                q: "What should be preserved in forensics?",
                a: ["Chain of custody", "System performance", "Network speed", "User preferences"],
                correct: 0
            },
            {
                q: "Which tool captures network packets?",
                a: ["Wireshark", "Nmap", "Metasploit", "Nessus"],
                correct: 0
            },
            {
                q: "What does baseline monitoring establish?",
                a: ["Normal behavior", "Maximum performance", "Minimum requirements", "Security policy"],
                correct: 0
            },
            {
                q: "Which log records authentication events?",
                a: ["Security log", "System log", "Application log", "Network log"],
                correct: 0
            },
            {
                q: "What is threat hunting?",
                a: ["Proactive threat search", "Automated scanning", "Incident response", "Vulnerability patching"],
                correct: 0
            },
            {
                q: "Which detects anomalies?",
                a: ["Behavior analysis", "Signature matching", "Rule-based detection", "Manual review"],
                correct: 0
            },
            {
                q: "What does SPAN port do?",
                a: ["Mirror traffic", "Block traffic", "Route traffic", "Encrypt traffic"],
                correct: 0
            },
            {
                q: "Which metric indicates DDoS?",
                a: ["Abnormal traffic spike", "Low bandwidth", "Normal packets", "Few connections"],
                correct: 0
            },
            {
                q: "What is log aggregation?",
                a: ["Centralize logs", "Delete logs", "Encrypt logs", "Compress logs"],
                correct: 0
            },
            {
                q: "Which protocol analyzes packet contents?",
                a: ["Deep Packet Inspection", "Shallow scanning", "Port scanning", "Ping sweep"],
                correct: 0
            },
            {
                q: "What does retention policy define?",
                a: ["How long to keep logs", "Which logs to collect", "Log format", "Log encryption"],
                correct: 0
            },
            {
                q: "Which analysis examines past incidents?",
                a: ["Forensic", "Real-time", "Predictive", "Prescriptive"],
                correct: 0
            },
            {
                q: "What is a false positive?",
                a: ["Alert with no actual threat", "Missed threat", "Accurate detection", "System error"],
                correct: 0
            },
            {
                q: "Which detects known attack patterns?",
                a: ["Signature-based IDS", "Anomaly-based IDS", "Heuristic analysis", "Behavioral monitoring"],
                correct: 0
            },
            {
                q: "What does NetFlow record?",
                a: ["Network traffic metadata", "Packet payloads", "User passwords", "File contents"],
                correct: 0
            },
            {
                q: "Which tool scans for vulnerabilities?",
                a: ["Nessus", "Wireshark", "Metasploit", "Burp Suite"],
                correct: 0
            },
            {
                q: "What is threat intelligence?",
                a: ["Information about threats", "Antivirus software", "Firewall rules", "Encryption keys"],
                correct: 0
            },
            {
                q: "Which protocol transports syslog?",
                a: ["UDP/TCP", "ICMP", "ARP", "DHCP"],
                correct: 0
            },
            {
                q: "What does correlation engine do?",
                a: ["Link related events", "Block attacks", "Scan ports", "Encrypt data"],
                correct: 0
            },
            {
                q: "Which indicates data exfiltration?",
                a: ["Large outbound transfer", "Normal downloads", "System updates", "Scheduled backups"],
                correct: 0
            },
            {
                q: "What is time-series analysis?",
                a: ["Track data over time", "Instant analysis", "Static snapshot", "Manual review"],
                correct: 0
            },
            {
                q: "Which provides visibility into encrypted traffic?",
                a: ["SSL/TLS inspection", "Port scanning", "Ping sweep", "Banner grabbing"],
                correct: 0
            },
            {
                q: "What is the purpose of honeypot logs?",
                a: ["Study attacker behavior", "Production monitoring", "Performance testing", "User activity"],
                correct: 0
            },
            {
                q: "Which technique identifies lateral movement?",
                a: ["Network traffic analysis", "Antivirus scan", "Patch management", "User training"],
                correct: 0
            },
            {
                q: "What does alert tuning reduce?",
                a: ["False positives", "True positives", "Log storage", "Network speed"],
                correct: 0
            },
            {
                q: "Which memory analysis tool is common?",
                a: ["Volatility", "Nmap", "Wireshark", "Burp Suite"],
                correct: 0
            },
            {
                q: "What is indicator matching?",
                a: ["Compare against known IoCs", "Create new signatures", "Block all traffic", "Scan files"],
                correct: 0
            },
            {
                q: "Which log level shows errors?",
                a: ["ERROR", "INFO", "DEBUG", "TRACE"],
                correct: 0
            },
            {
                q: "What does UEBA analyze?",
                a: ["User behavior", "Network packets", "System files", "Application code"],
                correct: 0
            },
            {
                q: "Which preserves volatile data first?",
                a: ["RAM", "Hard drive", "USB drive", "DVD"],
                correct: 0
            },
            {
                q: "What is rule-based detection?",
                a: ["Match predefined patterns", "Learn normal behavior", "Random sampling", "Manual inspection"],
                correct: 0
            },
            {
                q: "Which format standardizes log data?",
                a: ["Syslog", "CSV", "XML", "JSON"],
                correct: 0
            },
            {
                q: "What does EDR monitor?",
                a: ["Endpoints", "Network only", "Cloud only", "Databases only"],
                correct: 0
            },
            {
                q: "Which indicates C2 communication?",
                a: ["Beaconing traffic", "Normal browsing", "Email sync", "System updates"],
                correct: 0
            }
        ]
    };

    return {
        /**
         * Get question bank for a specific ring
         * @param {string} ringId - Ring identifier (shield, web, forge, script, cloud, code, key, eye)
         * @returns {Array} Array of question objects
         */
        getQuestions: function(ringId) {
            return BANKS[ringId] || [];
        },

        /**
         * Get question count for a specific ring
         * @param {string} ringId - Ring identifier
         * @returns {number} Number of questions in bank
         */
        getQuestionCount: function(ringId) {
            return (BANKS[ringId] || []).length;
        },

        /**
         * Get all ring IDs
         * @returns {Array} Array of ring identifiers
         */
        getAllRingIds: function() {
            return Object.keys(BANKS);
        },

        /**
         * Get total question count across all rings
         * @returns {number} Total questions
         */
        getTotalQuestionCount: function() {
            return Object.values(BANKS).reduce((sum, bank) => sum + bank.length, 0);
        }
    };
})();
