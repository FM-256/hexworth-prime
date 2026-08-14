/**
 * ForensicsData.js — Hexworth Prime Digital Forensics Hub
 *
 * Defines all 6 tracks, 60 total modules across:
 *   Track 1: Evidence Foundations & Legal Framework
 *   Track 2: Disk & File System Forensics
 *   Track 3: Memory Forensics
 *   Track 4: Network Forensics
 *   Track 5: Log & Timeline Analysis
 *   Track 6: Advanced & Specialized Forensics
 *
 * House ownership: Eye (primary), cross-links from Shield, Script, Dark Arts, Web
 *
 * Progress tracked in localStorage: hexworth_forensics_progress
 */

const ForensicsData = {

    version: '1.0.0',

    hub: {
        name: 'Digital Forensics Hub',
        tagline: 'Investigate. Analyze. Prove.',
        description: 'Master digital forensics from evidence handling to advanced analysis. 6 tracks, 60 modules covering disk, memory, network, log analysis, and courtroom-ready investigation techniques.',
        icon: '/assets/images/icons/icon-detective.webp',
        accentColor: '#818cf8',
        accentColorDim: 'rgba(129, 140, 248, 0.15)',
        secondaryColor: '#a78bfa',
        progressKey: 'hexworth_forensics_progress',
        house: 'eye'
    },

    stats: {
        totalModules: 60,
        tracks: 6,
        existingIntegrated: 17,
        newModules: 43,
        certAlignments: ['CompTIA CySA+ (CS0-003)', 'CompTIA Security+', 'EC-Council CHFI', 'GIAC GCFE', 'GIAC GCFA']
    },

    tracks: [
        {
            id: 'evidence-foundations',
            name: 'Evidence Foundations & Legal Framework',
            shortName: 'Evidence & Legal',
            description: 'Chain of custody, NIST frameworks, federal computer crime laws, expert testimony, and ethics in digital forensics.',
            icon: '/assets/images/icons/icon-scales.webp',
            color: '#818cf8',
            colorDim: 'rgba(129, 140, 248, 0.12)',
            moduleCount: 10,
            modules: [
                {
                    id: 'df-01',
                    title: 'Evidence Types in Digital Forensics',
                    subtitle: 'Real, demonstrative, documentary, testimonial',
                    href: 'sections/evidence-foundations/df-01-evidence-types.module.html',
                    isNew: true
                },
                {
                    id: 'df-02',
                    title: 'Chain of Custody Procedures',
                    subtitle: 'Documentation, integrity, handling protocols',
                    href: 'sections/evidence-foundations/df-02-chain-of-custody.module.html',
                    isNew: true
                },
                {
                    id: 'df-03',
                    title: 'NIST SP 800-86 Framework',
                    subtitle: 'Guide to integrating forensic techniques',
                    href: 'sections/evidence-foundations/df-03-nist-800-86.module.html',
                    isNew: true
                },
                {
                    id: 'df-04',
                    title: 'RFC 3227 Order of Volatility',
                    subtitle: 'Evidence collection priority hierarchy',
                    href: 'sections/evidence-foundations/df-04-order-of-volatility.module.html',
                    isNew: true
                },
                {
                    id: 'df-05',
                    title: 'CFAA & Federal Computer Crime Laws',
                    subtitle: 'Legal boundaries and criminal statutes',
                    href: 'sections/evidence-foundations/df-05-cfaa-federal-laws.module.html',
                    isNew: true
                },
                {
                    id: 'df-06',
                    title: 'ECPA & Stored Communications',
                    subtitle: 'Wiretap, pen register, and SCA analysis',
                    href: 'sections/evidence-foundations/df-06-ecpa-wiretap.module.html',
                    isNew: true
                },
                {
                    id: 'df-07',
                    title: 'Fourth Amendment in Digital Context',
                    subtitle: 'Search and seizure of electronic evidence',
                    href: 'sections/evidence-foundations/df-07-fourth-amendment.module.html',
                    isNew: true
                },
                {
                    id: 'df-08',
                    title: 'Expert Witness Testimony',
                    subtitle: 'Courtroom procedures and testimony delivery',
                    href: 'sections/evidence-foundations/df-08-expert-witness.module.html',
                    isNew: true
                },
                {
                    id: 'df-09',
                    title: 'Ethics in Digital Forensics',
                    subtitle: 'IACIS and ISFCE codes of ethics',
                    href: 'sections/evidence-foundations/df-09-ethics.module.html',
                    isNew: true
                },
                {
                    id: 'df-10',
                    title: 'Evidence Preservation Capstone',
                    subtitle: 'Full documentation and preservation lab',
                    href: 'sections/evidence-foundations/df-10-evidence-capstone.module.html',
                    isNew: true,
                    isCapstone: true
                }
            ]
        },
        {
            id: 'disk-forensics',
            name: 'Disk & File System Forensics',
            shortName: 'Disk Forensics',
            description: 'File system internals, disk imaging, Autopsy, file carving, metadata extraction, and forensic integrity verification.',
            icon: '/assets/images/icons/icon-cabinet.webp',
            color: '#34d399',
            colorDim: 'rgba(52, 211, 153, 0.12)',
            moduleCount: 10,
            modules: [
                {
                    id: 'df-11',
                    title: 'File System Internals',
                    subtitle: 'NTFS, ext4, FAT32, APFS, HFS+ deep dive',
                    href: 'sections/disk-forensics/df-11-file-systems.module.html',
                    isNew: true
                },
                {
                    id: 'df-12',
                    title: 'Disk Imaging',
                    subtitle: 'dd, dcfldd, FTK Imager, Guymager',
                    href: 'sections/disk-forensics/df-12-disk-imaging.module.html',
                    isNew: true
                },
                {
                    id: 'df-13',
                    title: 'Autopsy Walkthrough',
                    subtitle: 'Full case creation and analysis workflow',
                    href: 'sections/disk-forensics/df-13-autopsy.module.html',
                    isNew: true
                },
                {
                    id: 'df-14',
                    title: 'File Carving & Recovery',
                    subtitle: 'PhotoRec, Scalpel, foremost techniques',
                    href: 'sections/disk-forensics/df-14-file-carving.module.html',
                    isNew: true
                },
                {
                    id: 'df-15',
                    title: 'Metadata Extraction',
                    subtitle: 'ExifTool and FOCA deep-dive',
                    href: 'sections/disk-forensics/df-15-metadata.module.html',
                    isNew: true
                },
                {
                    id: 'df-16',
                    title: 'Deleted File Recovery Simulation',
                    subtitle: 'Hands-on deleted file recovery lab',
                    href: 'sections/disk-forensics/df-16-deleted-recovery.module.html',
                    isNew: true,
                    crossLink: '/houses/script/applets/linux/script-clh-019-disk-forensics.applet.html'
                },
                {
                    id: 'df-17',
                    title: 'MFT Analysis & Inode Examination',
                    subtitle: 'Master File Table and inode forensics',
                    href: 'sections/disk-forensics/df-17-mft-inodes.module.html',
                    isNew: true
                },
                {
                    id: 'df-18',
                    title: 'Slack Space & Hidden Data',
                    subtitle: 'Unallocated space and hidden data detection',
                    href: 'sections/disk-forensics/df-18-slack-space.module.html',
                    isNew: true
                },
                {
                    id: 'df-19',
                    title: 'Write Blockers & Forensic Integrity',
                    subtitle: 'Hash verification with MD5 and SHA-256',
                    href: 'sections/disk-forensics/df-19-write-blockers.module.html',
                    isNew: true
                },
                {
                    id: 'df-20',
                    title: 'Disk Forensics Capstone',
                    subtitle: 'Full disk forensics investigation lab',
                    href: 'sections/disk-forensics/df-20-disk-capstone.module.html',
                    isNew: true,
                    isCapstone: true
                }
            ]
        },
        {
            id: 'memory-forensics',
            name: 'Memory Forensics',
            shortName: 'Memory Forensics',
            description: 'Volatile evidence acquisition, Volatility framework, process analysis, malware artifacts, and registry extraction from memory.',
            icon: '/assets/images/icons/icon-memory.webp',
            color: '#f472b6',
            colorDim: 'rgba(244, 114, 182, 0.12)',
            moduleCount: 10,
            modules: [
                {
                    id: 'df-21',
                    title: 'Volatile vs Non-Volatile Evidence',
                    subtitle: 'Acquisition order and evidence prioritization',
                    href: 'sections/memory-forensics/df-21-volatile-evidence.module.html',
                    isNew: true
                },
                {
                    id: 'df-22',
                    title: 'Memory Acquisition Tools',
                    subtitle: 'FTK Imager, WinPmem, LiME, DumpIt',
                    href: 'sections/memory-forensics/df-22-acquisition-tools.module.html',
                    isNew: true
                },
                {
                    id: 'df-23',
                    title: 'Volatility Framework Setup',
                    subtitle: 'Profile selection and configuration',
                    href: 'sections/memory-forensics/df-23-volatility-setup.module.html',
                    isNew: true
                },
                {
                    id: 'df-24',
                    title: 'Process Analysis',
                    subtitle: 'pslist, pstree, psscan deep dive',
                    href: 'sections/memory-forensics/df-24-process-analysis.module.html',
                    isNew: true
                },
                {
                    id: 'df-25',
                    title: 'DLL & Code Injection Detection',
                    subtitle: 'Identifying injection artifacts in memory',
                    href: 'sections/memory-forensics/df-25-injection-detection.module.html',
                    isNew: true
                },
                {
                    id: 'df-26',
                    title: 'Malware Artifact Recovery',
                    subtitle: 'Extracting malware samples from RAM',
                    href: 'sections/memory-forensics/df-26-malware-recovery.module.html',
                    isNew: true
                },
                {
                    id: 'df-27',
                    title: 'Registry Hive Extraction',
                    subtitle: 'Pulling registry data from memory dumps',
                    href: 'sections/memory-forensics/df-27-registry-extraction.module.html',
                    isNew: true
                },
                {
                    id: 'df-28',
                    title: 'Network Connections from Memory',
                    subtitle: 'netscan, connscan, and socket analysis',
                    href: 'sections/memory-forensics/df-28-network-connections.module.html',
                    isNew: true
                },
                {
                    id: 'df-29',
                    title: 'Memory Forensics Workflow Lab',
                    subtitle: 'Complete memory analysis simulation',
                    href: 'sections/memory-forensics/df-29-workflow-lab.module.html',
                    isNew: true,
                    crossLink: '/houses/eye/applets/cyberops/week7/labs/eye-memory-forensics.lab.html'
                },
                {
                    id: 'df-30',
                    title: 'Memory Analysis Capstone',
                    subtitle: 'Full investigation from memory dump',
                    href: 'sections/memory-forensics/df-30-memory-capstone.module.html',
                    isNew: true,
                    isCapstone: true
                }
            ]
        },
        {
            id: 'network-forensics',
            name: 'Network Forensics',
            shortName: 'Network Forensics',
            description: 'Packet capture, Wireshark mastery, DNS exfiltration, encrypted traffic analysis, and wireless forensics.',
            icon: '/assets/images/icons/icon-antenna.webp',
            color: '#38bdf8',
            colorDim: 'rgba(56, 189, 248, 0.12)',
            moduleCount: 10,
            modules: [
                {
                    id: 'df-31',
                    title: 'Packet Capture Fundamentals',
                    subtitle: 'tcpdump, Wireshark, tshark essentials',
                    href: 'sections/network-forensics/df-31-packet-capture.module.html',
                    isNew: true
                },
                {
                    id: 'df-32',
                    title: 'Wireshark Deep-Dive',
                    subtitle: 'Filters, coloring rules, protocol dissection',
                    href: 'sections/network-forensics/df-32-wireshark.module.html',
                    isNew: true
                },
                {
                    id: 'df-33',
                    title: 'TCP Stream Reconstruction',
                    subtitle: 'Session analysis and stream reassembly',
                    href: 'sections/network-forensics/df-33-tcp-streams.module.html',
                    isNew: true
                },
                {
                    id: 'df-34',
                    title: 'DNS Exfiltration Detection',
                    subtitle: 'Identifying covert DNS channels',
                    href: 'sections/network-forensics/df-34-dns-exfiltration.module.html',
                    isNew: true
                },
                {
                    id: 'df-35',
                    title: 'Encrypted Traffic Analysis',
                    subtitle: 'TLS/SSL behavioral indicators',
                    href: 'sections/network-forensics/df-35-encrypted-traffic.module.html',
                    isNew: true
                },
                {
                    id: 'df-36',
                    title: 'NetFlow & IPFIX Analysis',
                    subtitle: 'Flow-based traffic investigation',
                    href: 'sections/network-forensics/df-36-netflow.module.html',
                    isNew: true
                },
                {
                    id: 'df-37',
                    title: 'PCAP Evidence Extraction',
                    subtitle: 'Files, credentials, IoCs from captures',
                    href: 'sections/network-forensics/df-37-pcap-extraction.module.html',
                    isNew: true,
                    crossLink: '/houses/eye/applets/cyberops/week7/labs/eye-pcap-forensics.lab.html'
                },
                {
                    id: 'df-38',
                    title: 'IDS/IPS Log Correlation',
                    subtitle: 'Snort/Suricata rule forensics',
                    href: 'sections/network-forensics/df-38-ids-correlation.module.html',
                    isNew: true
                },
                {
                    id: 'df-39',
                    title: 'Wireless Forensics',
                    subtitle: '802.11 capture and rogue AP detection',
                    href: 'sections/network-forensics/df-39-wireless.module.html',
                    isNew: true
                },
                {
                    id: 'df-40',
                    title: 'Network Forensics Capstone',
                    subtitle: 'Full network investigation lab',
                    href: 'sections/network-forensics/df-40-network-capstone.module.html',
                    isNew: true,
                    isCapstone: true,
                    crossLink: '/houses/eye/applets/cyberops/week7/labs/eye-network-forensics.lab.html'
                }
            ]
        },
        {
            id: 'log-timeline',
            name: 'Log & Timeline Analysis',
            shortName: 'Logs & Timelines',
            description: 'Windows Event Logs, Linux syslog, super timelines with plaso, SIEM queries, browser forensics, and registry analysis.',
            icon: '/assets/images/icons/icon-clock.webp',
            color: '#fbbf24',
            colorDim: 'rgba(251, 191, 36, 0.12)',
            moduleCount: 10,
            modules: [
                {
                    id: 'df-41',
                    title: 'Windows Event Log Architecture',
                    subtitle: 'Security, System, Application, Sysmon',
                    href: 'sections/log-timeline/df-41-windows-events.module.html',
                    isNew: true
                },
                {
                    id: 'df-42',
                    title: 'Linux Log Analysis',
                    subtitle: 'syslog, journald, auth.log deep-dive',
                    href: 'sections/log-timeline/df-42-linux-logs.module.html',
                    isNew: true
                },
                {
                    id: 'df-43',
                    title: 'Log Correlation Techniques',
                    subtitle: 'Cross-source evidence linking',
                    href: 'sections/log-timeline/df-43-log-correlation.module.html',
                    isNew: true
                },
                {
                    id: 'df-44',
                    title: 'Super Timeline with Plaso',
                    subtitle: 'log2timeline setup and usage',
                    href: 'sections/log-timeline/df-44-plaso-timeline.module.html',
                    isNew: true
                },
                {
                    id: 'df-45',
                    title: 'Timeline Construction Lab',
                    subtitle: 'Building forensic timelines from evidence',
                    href: 'sections/log-timeline/df-45-timeline-lab.module.html',
                    isNew: true
                },
                {
                    id: 'df-46',
                    title: 'SIEM Integration for Forensics',
                    subtitle: 'Splunk/ELK query patterns',
                    href: 'sections/log-timeline/df-46-siem-integration.module.html',
                    isNew: true
                },
                {
                    id: 'df-47',
                    title: 'Browser Forensics',
                    subtitle: 'History, cache, cookies, IndexedDB',
                    href: 'sections/log-timeline/df-47-browser-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-48',
                    title: 'Email Header Analysis',
                    subtitle: 'SMTP trace, SPF, DKIM, ARC',
                    href: 'sections/log-timeline/df-48-email-headers.module.html',
                    isNew: true
                },
                {
                    id: 'df-49',
                    title: 'Windows Registry Forensics',
                    subtitle: 'SAM, SYSTEM, SOFTWARE, NTUSER.DAT',
                    href: 'sections/log-timeline/df-49-registry-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-50',
                    title: 'Timeline Reconstruction Capstone',
                    subtitle: 'Reconstruct full attack timeline',
                    href: 'sections/log-timeline/df-50-timeline-capstone.module.html',
                    isNew: true,
                    isCapstone: true
                }
            ]
        },
        {
            id: 'advanced-forensics',
            name: 'Advanced & Specialized Forensics',
            shortName: 'Advanced Topics',
            description: 'Anti-forensics detection, cloud forensics, mobile analysis, IoT, steganography, and incident response integration.',
            icon: '/assets/images/icons/icon-microscope.webp',
            color: '#fb923c',
            colorDim: 'rgba(251, 146, 60, 0.12)',
            moduleCount: 10,
            modules: [
                {
                    id: 'df-51',
                    title: 'Anti-Forensics & Detection',
                    subtitle: 'Timestomping, log clearing, encryption',
                    href: 'sections/advanced-forensics/df-51-anti-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-52',
                    title: 'Cloud Forensics',
                    subtitle: 'AWS CloudTrail, Azure Logs, GCP Audit',
                    href: 'sections/advanced-forensics/df-52-cloud-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-53',
                    title: 'Mobile Forensics Introduction',
                    subtitle: 'iOS and Android acquisition and artifacts',
                    href: 'sections/advanced-forensics/df-53-mobile-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-54',
                    title: 'IoT & Embedded Device Forensics',
                    subtitle: 'Firmware extraction and analysis',
                    href: 'sections/advanced-forensics/df-54-iot-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-55',
                    title: 'Malware Forensics',
                    subtitle: 'Static and dynamic analysis integration',
                    href: 'sections/advanced-forensics/df-55-malware-forensics.module.html',
                    isNew: true
                },
                {
                    id: 'df-56',
                    title: 'Steganography Detection',
                    subtitle: 'stegdetect, zsteg, binwalk',
                    href: 'sections/advanced-forensics/df-56-steganography.module.html',
                    isNew: true
                },
                {
                    id: 'df-57',
                    title: 'Incident Response Integration',
                    subtitle: 'NIST 800-61R2 lifecycle alignment',
                    href: 'sections/advanced-forensics/df-57-incident-response.module.html',
                    isNew: true,
                    crossLink: '/houses/shield/labs/shield-ir-forensics.lab.html'
                },
                {
                    id: 'df-58',
                    title: 'Forensic Tool Validation',
                    subtitle: 'Daubert standard and ISO 17025',
                    href: 'sections/advanced-forensics/df-58-tool-validation.module.html',
                    isNew: true
                },
                {
                    id: 'df-59',
                    title: 'Live vs Dead-Box Analysis',
                    subtitle: 'When and how for each approach',
                    href: 'sections/advanced-forensics/df-59-live-vs-dead.module.html',
                    isNew: true
                },
                {
                    id: 'df-60',
                    title: 'Advanced Capstone Investigation',
                    subtitle: 'Full multi-source investigation lab',
                    href: 'sections/advanced-forensics/df-60-advanced-capstone.module.html',
                    isNew: true,
                    isCapstone: true
                }
            ]
        }
    ],

    // Cross-linked existing modules from other houses
    existingModules: [
        { source: 'Eye / CySA+', path: '/houses/eye/cysa/presentations/eye-cysa-ch13-forensics.presentation.html', title: 'CySA+ Ch13 Forensics Presentation' },
        { source: 'Eye / CySA+', path: '/houses/eye/cysa/labs/eye-cysa-ch13-forensics.lab.html', title: 'CySA+ Ch13 Forensics Lab' },
        { source: 'Eye / CyberOps', path: '/houses/eye/applets/cyberops/eye-forensic-elements.applet.html', title: 'Forensic Elements Applet' },
        { source: 'Eye / CyberOps', path: '/houses/eye/applets/cyberops/eye-evidence-types.applet.html', title: 'Evidence Types Applet' },
        { source: 'Eye / CyberOps', path: '/houses/eye/applets/cyberops/week7/labs/eye-pcap-forensics.lab.html', title: 'PCAP Forensics Lab' },
        { source: 'Eye / CyberOps', path: '/houses/eye/applets/cyberops/week7/labs/eye-network-forensics.lab.html', title: 'Network Forensics Lab' },
        { source: 'Eye / CyberOps', path: '/houses/eye/applets/cyberops/week7/labs/eye-memory-forensics.lab.html', title: 'Memory Forensics Lab' },
        { source: 'Eye / Games', path: '/houses/eye/games/eye-memory-forensics.applet.html', title: 'Memory Forensics Game' },
        { source: 'Shield', path: '/houses/shield/labs/shield-ir-forensics.lab.html', title: 'IR Forensics Lab' },
        { source: 'Script', path: '/houses/script/applets/linux/script-clh-019-disk-forensics.applet.html', title: 'Linux Disk Forensics Applet' },
        { source: 'Dark Arts', path: '/houses/dark-arts/games/dark-network-forensics-lab.applet.html', title: 'Network Forensics Lab (Dark Arts)' },
        { source: 'Web / Backbone', path: '/houses/web/backbone/forensics/index.html', title: 'Backbone Network Forensics (10 modules)' },
        { source: 'Operator', path: '/operator/missions/forensics-01.mission.html', title: 'Forensics Mission 1' },
        { source: 'Operator', path: '/operator/missions/forensics-02.mission.html', title: 'Forensics Mission 2' },
        { source: 'Operator', path: '/operator/missions/forensics-03.mission.html', title: 'Forensics Mission 3' }
    ],

    // Cert hubs nested under the Forensics Hub (Stragglers Phase 2 — 2026-04-30).
    // Each entry has a corresponding ContentCatalog module (id matches) and a
    // physical hub at certs/{id-without-prefix}/index.html. Listed here so the
    // orphan-finder's mechanism 6 (dedicated engine pattern) detects them as
    // reachable, and so renderHub can iterate them for the Cert Paths section.
    certHubs: [
        { id: 'forensics-chfi-hub', name: 'CHFI v10', body: 'EC-Council', href: 'certs/chfi/index.html', certId: 'chfi' },
        { id: 'forensics-gcfa-hub', name: 'GCFA',    body: 'GIAC / SANS', href: 'certs/gcfa/index.html', certId: 'gcfa' },
        { id: 'forensics-gcfe-hub', name: 'GCFE',    body: 'GIAC / SANS', href: 'certs/gcfe/index.html', certId: 'gcfe' }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForensicsData;
}
