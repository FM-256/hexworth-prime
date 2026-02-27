/**
 * EduScan — Impact Analyzer
 *
 * Orchestrates dependency mapping, contract validation, and impact analysis.
 * Provides a unified interface for the CLI.
 *
 * Usage:
 *   const ImpactAnalyzer = require('./validators/impact');
 *   const analyzer = new ImpactAnalyzer({ rootPath: './_app' });
 *
 *   // Full analysis
 *   const results = analyzer.analyze();
 *
 *   // Impact of specific file change
 *   const impact = analyzer.analyzeFile('components/FirebaseAuth.js');
 */

const DependencyMap = require('./dependency-map');
const ContractValidator = require('./contract-validator');

class ImpactAnalyzer {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;

        this.depMap = new DependencyMap({
            rootPath: this.rootPath,
            verbose: this.verbose
        });

        this.contractValidator = new ContractValidator({
            rootPath: this.rootPath,
            verbose: this.verbose
        });
    }

    /**
     * Run full impact analysis: dependency map + contract validation
     * @returns {Object} { dependencies, contracts, issues, summary }
     */
    analyze() {
        const startTime = Date.now();

        // Build dependency map
        const depResult = this.depMap.build();

        // Validate contracts
        const contractResult = this.contractValidator.validate();

        // Combine issues
        const issues = [...contractResult.issues];

        const summary = {
            totalComponents: depResult.summary.totalComponents,
            usedComponents: depResult.summary.usedComponents,
            unusedComponents: depResult.summary.unusedComponents,
            mostDepended: depResult.summary.mostDepended,
            mostDependedCount: depResult.summary.mostDependedCount,
            contractsChecked: contractResult.summary.componentsChecked,
            methodsChecked: contractResult.summary.methodsChecked,
            contractsPassed: contractResult.summary.contractsPassed,
            contractsFailed: contractResult.summary.contractsFailed,
            totalIssues: issues.length,
            duration: Date.now() - startTime
        };

        return {
            dependencies: depResult,
            contracts: contractResult,
            issues,
            summary
        };
    }

    /**
     * Analyze impact of changes to a specific file
     * @param {string} filePath - Relative path from rootPath
     * @returns {Object} Impact analysis
     */
    analyzeFile(filePath) {
        const depResult = this.depMap.build();
        const fullPath = require('path').resolve(this.rootPath, filePath);
        return this.depMap.analyzeImpact(fullPath, depResult);
    }

    /**
     * Get the top N most-depended components
     * @param {number} n - Number of components to return
     * @returns {Array} Sorted component list
     */
    getTopComponents(n = 20) {
        const depResult = this.depMap.build();
        return Object.values(depResult.components)
            .filter(c => c.dependencyCount > 0)
            .sort((a, b) => b.dependencyCount - a.dependencyCount)
            .slice(0, n);
    }

    /**
     * Get unused components (candidates for cleanup)
     * @returns {Array} Unused component names
     */
    getUnusedComponents() {
        const depResult = this.depMap.build();
        return Object.values(depResult.components)
            .filter(c => c.dependencyCount === 0)
            .map(c => ({ name: c.name, path: c.path, category: c.category }));
    }
}

module.exports = ImpactAnalyzer;
