/**
 * ForensicsCertAlignment.js — Certification Objective Mapping
 *
 * Maps all 60 Digital Forensics modules to industry certification objectives:
 *   - CompTIA CySA+ (CS0-003) — Domain 4: Incident Response
 *   - CompTIA Security+ (SY0-701) — Forensics-related objectives
 *   - EC-Council CHFI (v10) — All 14 modules
 *   - GIAC GCFE — Certified Forensic Examiner objectives
 *   - GIAC GCFA — Certified Forensic Analyst objectives
 *
 * Usage:
 *   ForensicsCertAlignment.getModuleCerts('df-01')
 *   ForensicsCertAlignment.getCertModules('CompTIA CySA+ (CS0-003)')
 */

const ForensicsCertAlignment = {

    certifications: [
        {
            id: 'cysa-plus',
            name: 'CompTIA CySA+ (CS0-003)',
            domain: 'Domain 4: Incident Response',
            objectives: [
                '4.1 — Explain the incident response process',
                '4.2 — Apply the appropriate incident response procedure',
                '4.3 — Given an incident, analyze potential indicators of compromise',
                '4.4 — Analyze data as part of a forensic investigation',
                '4.5 — Explain the importance of communication during incident response'
            ],
            modules: [
                'df-01', 'df-02', 'df-03', 'df-04', 'df-05', 'df-06', 'df-07', 'df-08', 'df-09', 'df-10',
                'df-11', 'df-12', 'df-13', 'df-14', 'df-15', 'df-16', 'df-17', 'df-19', 'df-20',
                'df-21', 'df-22', 'df-23', 'df-24', 'df-26', 'df-29', 'df-30',
                'df-31', 'df-32', 'df-37', 'df-40',
                'df-41', 'df-42', 'df-43', 'df-44', 'df-45', 'df-46', 'df-47', 'df-49', 'df-50',
                'df-51', 'df-55', 'df-57', 'df-58', 'df-59', 'df-60'
            ]
        },
        {
            id: 'security-plus',
            name: 'CompTIA Security+ (SY0-701)',
            domain: 'Domain 4: Security Operations',
            objectives: [
                '4.8 — Explain appropriate incident response activities',
                '4.9 — Given a scenario, use data sources to support an investigation'
            ],
            modules: [
                'df-01', 'df-02', 'df-03', 'df-04', 'df-05', 'df-07', 'df-08', 'df-10',
                'df-11', 'df-12', 'df-14', 'df-15', 'df-16', 'df-19', 'df-20',
                'df-21', 'df-22', 'df-29', 'df-30',
                'df-31', 'df-32', 'df-37',
                'df-41', 'df-42', 'df-43', 'df-44', 'df-46', 'df-47', 'df-49', 'df-50',
                'df-51', 'df-52', 'df-57', 'df-59', 'df-60'
            ]
        },
        {
            id: 'chfi',
            name: 'EC-Council CHFI (v10)',
            domain: 'All 14 Modules',
            objectives: [
                'Module 1 — Computer Forensics in Today\'s World',
                'Module 2 — Computer Forensics Investigation Process',
                'Module 3 — Understanding Hard Disks and File Systems',
                'Module 4 — Data Acquisition and Duplication',
                'Module 5 — Defeating Anti-Forensics Techniques',
                'Module 6 — Windows Forensics',
                'Module 7 — Linux and Mac Forensics',
                'Module 8 — Network Forensics',
                'Module 9 — Investigating Web Attacks',
                'Module 10 — Dark Web Forensics',
                'Module 11 — Database Forensics',
                'Module 12 — Cloud Forensics',
                'Module 13 — Investigating Email Crimes',
                'Module 14 — Malware Forensics'
            ],
            modules: [
                'df-01', 'df-02', 'df-03', 'df-04', 'df-05', 'df-06', 'df-07', 'df-08', 'df-09', 'df-10',
                'df-11', 'df-12', 'df-13', 'df-14', 'df-15', 'df-16', 'df-17', 'df-18', 'df-19', 'df-20',
                'df-21', 'df-22', 'df-23', 'df-24', 'df-25', 'df-26', 'df-27', 'df-28', 'df-29', 'df-30',
                'df-31', 'df-32', 'df-33', 'df-34', 'df-35', 'df-36', 'df-37', 'df-38', 'df-39', 'df-40',
                'df-41', 'df-42', 'df-43', 'df-44', 'df-45', 'df-46', 'df-47', 'df-48', 'df-49', 'df-50',
                'df-51', 'df-52', 'df-53', 'df-54', 'df-55', 'df-56', 'df-57', 'df-58', 'df-59', 'df-60'
            ]
        },
        {
            id: 'gcfe',
            name: 'GIAC GCFE (Certified Forensic Examiner)',
            domain: 'Windows & Browser Forensics',
            objectives: [
                'Digital Forensics Methodology and Evidence Handling',
                'Windows File System Forensics (NTFS, FAT)',
                'Windows Artifact Analysis (Registry, Event Logs, Prefetch)',
                'Browser Forensics and Internet Artifacts',
                'Email Forensics',
                'Document Metadata and File Analysis',
                'Timeline Analysis and Event Reconstruction',
                'Evidence Acquisition and Imaging',
                'Anti-Forensics Detection'
            ],
            modules: [
                'df-01', 'df-02', 'df-03', 'df-04', 'df-05', 'df-07', 'df-08', 'df-09', 'df-10',
                'df-11', 'df-12', 'df-13', 'df-14', 'df-15', 'df-16', 'df-17', 'df-18', 'df-19', 'df-20',
                'df-41', 'df-42', 'df-43', 'df-44', 'df-45', 'df-47', 'df-48', 'df-49', 'df-50',
                'df-51', 'df-56', 'df-58', 'df-59', 'df-60'
            ]
        },
        {
            id: 'gcfa',
            name: 'GIAC GCFA (Certified Forensic Analyst)',
            domain: 'Advanced Forensics & Incident Response',
            objectives: [
                'Advanced Incident Response and Digital Forensics',
                'Memory Forensics with Volatility',
                'Timeline Analysis and Super Timelines',
                'Advanced Evidence Acquisition',
                'NTFS Forensics and Artifact Analysis',
                'Malware Detection and Analysis',
                'Network Forensics Essentials',
                'Anti-Forensics and Adversary Detection',
                'Intrusion Analysis and APT Detection',
                'Enterprise Environment Forensics'
            ],
            modules: [
                'df-01', 'df-02', 'df-03', 'df-04', 'df-09', 'df-10',
                'df-11', 'df-12', 'df-13', 'df-14', 'df-15', 'df-16', 'df-17', 'df-18', 'df-19', 'df-20',
                'df-21', 'df-22', 'df-23', 'df-24', 'df-25', 'df-26', 'df-27', 'df-28', 'df-29', 'df-30',
                'df-31', 'df-32', 'df-33', 'df-34', 'df-37', 'df-38', 'df-40',
                'df-41', 'df-42', 'df-43', 'df-44', 'df-45', 'df-46', 'df-49', 'df-50',
                'df-51', 'df-52', 'df-55', 'df-57', 'df-58', 'df-59', 'df-60'
            ]
        }
    ],

    moduleMap: {
        // Track 1: Evidence Foundations & Legal Framework
        'df-01': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M1', 'GCFE Evidence Handling', 'GCFA Evidence Acquisition'],
        'df-02': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFE Evidence Handling', 'GCFA Evidence Acquisition'],
        'df-03': ['CySA+ 4.1', 'Security+ 4.8', 'CHFI M2', 'GCFE Methodology', 'GCFA Advanced IR'],
        'df-04': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFE Evidence Handling', 'GCFA Evidence Acquisition'],
        'df-05': ['CySA+ 4.5', 'Security+ 4.8', 'CHFI M1', 'GCFE Methodology'],
        'df-06': ['CySA+ 4.5', 'CHFI M1'],
        'df-07': ['CySA+ 4.5', 'Security+ 4.8', 'CHFI M1', 'GCFE Methodology'],
        'df-08': ['CySA+ 4.5', 'Security+ 4.8', 'CHFI M2', 'GCFE Methodology'],
        'df-09': ['CySA+ 4.5', 'CHFI M1', 'GCFE Methodology', 'GCFA Advanced IR'],
        'df-10': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFE Evidence Handling', 'GCFA Evidence Acquisition'],

        // Track 2: Disk & File System Forensics
        'df-11': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M3', 'GCFE Windows FS', 'GCFA NTFS Forensics'],
        'df-12': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M4', 'GCFE Evidence Acquisition', 'GCFA Evidence Acquisition'],
        'df-13': ['CySA+ 4.4', 'CHFI M3', 'GCFE Windows FS', 'GCFA NTFS Forensics'],
        'df-14': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M3', 'GCFE File Analysis', 'GCFA NTFS Forensics'],
        'df-15': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M3', 'GCFE Document Metadata', 'GCFA NTFS Forensics'],
        'df-16': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M3', 'GCFE Windows FS', 'GCFA NTFS Forensics'],
        'df-17': ['CySA+ 4.4', 'CHFI M3', 'GCFE Windows FS', 'GCFA NTFS Forensics'],
        'df-18': ['CHFI M3', 'GCFE Windows FS', 'GCFA NTFS Forensics'],
        'df-19': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M4', 'GCFE Evidence Acquisition', 'GCFA Evidence Acquisition'],
        'df-20': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M3', 'GCFE Windows FS', 'GCFA NTFS Forensics'],

        // Track 3: Memory Forensics
        'df-21': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFA Memory Forensics'],
        'df-22': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M4', 'GCFA Memory Forensics'],
        'df-23': ['CySA+ 4.4', 'CHFI M2', 'GCFA Memory Forensics'],
        'df-24': ['CySA+ 4.3', 'CHFI M6', 'GCFA Memory Forensics'],
        'df-25': ['CHFI M14', 'GCFA Malware Detection'],
        'df-26': ['CySA+ 4.3', 'CHFI M14', 'GCFA Malware Detection'],
        'df-27': ['CHFI M6', 'GCFA Memory Forensics'],
        'df-28': ['CHFI M8', 'GCFA Memory Forensics'],
        'df-29': ['CySA+ 4.4', 'CHFI M2', 'GCFA Memory Forensics'],
        'df-30': ['CySA+ 4.4', 'CHFI M2', 'GCFA Memory Forensics'],

        // Track 4: Network Forensics
        'df-31': ['CySA+ 4.3', 'Security+ 4.9', 'CHFI M8', 'GCFA Network Forensics'],
        'df-32': ['CySA+ 4.3', 'Security+ 4.9', 'CHFI M8', 'GCFA Network Forensics'],
        'df-33': ['CHFI M8', 'GCFA Network Forensics'],
        'df-34': ['CHFI M8', 'GCFA Network Forensics'],
        'df-35': ['CHFI M8'],
        'df-36': ['CHFI M8'],
        'df-37': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M8', 'GCFA Network Forensics'],
        'df-38': ['CHFI M8', 'GCFA Intrusion Analysis'],
        'df-39': ['CHFI M8'],
        'df-40': ['CySA+ 4.4', 'CHFI M8', 'GCFA Network Forensics'],

        // Track 5: Log & Timeline Analysis
        'df-41': ['CySA+ 4.3', 'Security+ 4.9', 'CHFI M6', 'GCFE Windows Artifacts', 'GCFA Timeline Analysis'],
        'df-42': ['CySA+ 4.3', 'Security+ 4.9', 'CHFI M7', 'GCFE Windows Artifacts', 'GCFA Timeline Analysis'],
        'df-43': ['CySA+ 4.3', 'Security+ 4.9', 'CHFI M2', 'GCFA Timeline Analysis'],
        'df-44': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFE Timeline Analysis', 'GCFA Super Timelines'],
        'df-45': ['CySA+ 4.4', 'CHFI M2', 'GCFE Timeline Analysis', 'GCFA Super Timelines'],
        'df-46': ['CySA+ 4.3', 'Security+ 4.9', 'CHFI M2', 'GCFA Enterprise Forensics'],
        'df-47': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M9', 'GCFE Browser Forensics'],
        'df-48': ['CySA+ 4.3', 'CHFI M13', 'GCFE Email Forensics'],
        'df-49': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M6', 'GCFE Windows Artifacts', 'GCFA NTFS Forensics'],
        'df-50': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFE Timeline Analysis', 'GCFA Super Timelines'],

        // Track 6: Advanced & Specialized Forensics
        'df-51': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M5', 'GCFE Anti-Forensics', 'GCFA Anti-Forensics'],
        'df-52': ['Security+ 4.9', 'CHFI M12', 'GCFA Enterprise Forensics'],
        'df-53': ['CHFI M1'],
        'df-54': ['CHFI M1'],
        'df-55': ['CySA+ 4.3', 'CHFI M14', 'GCFA Malware Detection'],
        'df-56': ['CHFI M5', 'GCFE Anti-Forensics'],
        'df-57': ['CySA+ 4.1', 'Security+ 4.8', 'CHFI M2', 'GCFA Advanced IR'],
        'df-58': ['CySA+ 4.4', 'CHFI M2', 'GCFE Methodology', 'GCFA Advanced IR'],
        'df-59': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFE Methodology', 'GCFA Advanced IR'],
        'df-60': ['CySA+ 4.4', 'Security+ 4.9', 'CHFI M2', 'GCFA Advanced IR']
    },

    /**
     * Get all certification alignments for a specific module
     * @param {string} moduleId - e.g., 'df-01'
     * @returns {Array} Array of certification objective strings
     */
    getModuleCerts(moduleId) {
        return this.moduleMap[moduleId] || [];
    },

    /**
     * Get all modules aligned to a specific certification
     * @param {string} certName - e.g., 'CompTIA CySA+ (CS0-003)'
     * @returns {Array} Array of module IDs
     */
    getCertModules(certName) {
        const cert = this.certifications.find(c => c.name === certName);
        return cert ? cert.modules : [];
    },

    /**
     * Get certification coverage stats
     * @returns {Object} Coverage percentages per cert
     */
    getCoverageStats() {
        const total = 60;
        return this.certifications.map(cert => ({
            name: cert.name,
            domain: cert.domain,
            moduleCount: cert.modules.length,
            coverage: Math.round((cert.modules.length / total) * 100) + '%'
        }));
    },

    /**
     * Get all certs a module aligns to (with full cert info)
     * @param {string} moduleId
     * @returns {Array} Array of { certName, objectives }
     */
    getModuleCertDetails(moduleId) {
        const objectives = this.moduleMap[moduleId] || [];
        return objectives.map(obj => {
            const certId = obj.split(' ')[0];
            const certMap = {
                'CySA+': 'CompTIA CySA+ (CS0-003)',
                'Security+': 'CompTIA Security+ (SY0-701)',
                'CHFI': 'EC-Council CHFI (v10)',
                'GCFE': 'GIAC GCFE (Certified Forensic Examiner)',
                'GCFA': 'GIAC GCFA (Certified Forensic Analyst)'
            };
            return {
                certification: certMap[certId] || certId,
                objective: obj
            };
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForensicsCertAlignment;
}
