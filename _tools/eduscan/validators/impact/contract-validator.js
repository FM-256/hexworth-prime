/**
 * EduScan — Component Contract Validator
 *
 * Validates that shared component files still export the methods
 * defined in .eduscan/contracts.json. Catches API-breaking changes
 * before they cascade to downstream files.
 *
 * Rules:
 * - CONTRACT-001: Method missing from component (critical if component is critical)
 * - CONTRACT-002: Method signature changed (parameter count mismatch)
 * - CONTRACT-003: Component file missing entirely
 */

const fs = require('fs');
const path = require('path');

class ContractValidator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.contractsPath = options.contractsPath ||
            path.join(__dirname, '..', '..', '.eduscan', 'contracts.json');
    }

    /**
     * Validate all component contracts
     * @returns {Object} { issues: [], summary: {} }
     */
    validate() {
        const issues = [];
        const summary = {
            componentsChecked: 0,
            methodsChecked: 0,
            contractsPassed: 0,
            contractsFailed: 0
        };

        // Load contracts
        let contracts;
        try {
            const raw = fs.readFileSync(this.contractsPath, 'utf8');
            contracts = JSON.parse(raw);
        } catch (err) {
            if (this.verbose) {
                console.log(`[CONTRACT] Cannot load contracts: ${err.message}`);
            }
            return { issues, summary };
        }

        const componentContracts = contracts.contracts || {};

        for (const [compName, contract] of Object.entries(componentContracts)) {
            summary.componentsChecked++;

            const compPath = path.join(this.rootPath, contract.path);

            // CONTRACT-003: Check file exists
            if (!fs.existsSync(compPath)) {
                issues.push({
                    code: 'CONTRACT-003',
                    severity: contract.critical ? 'critical' : 'high',
                    category: 'contract',
                    message: `Component file missing: ${contract.path}`,
                    file: contract.path,
                    fix: `Restore ${compName} component file`
                });
                summary.contractsFailed++;
                continue;
            }

            // Read component source
            const source = fs.readFileSync(compPath, 'utf8');

            // Check each contracted method
            for (const [methodName, spec] of Object.entries(contract.methods || {})) {
                summary.methodsChecked++;

                // CONTRACT-001: Check method exists
                // Look for: compName.methodName, this.methodName, function methodName,
                // methodName: function, methodName(, static methodName
                const methodPatterns = [
                    // IIFE pattern: compName.methodName = function
                    new RegExp(`${compName}\\.${methodName}\\s*=`, 'g'),
                    // IIFE return pattern: methodName: methodName or methodName,
                    new RegExp(`\\b${methodName}\\s*[:,]`, 'g'),
                    // function methodName(
                    new RegExp(`function\\s+${methodName}\\s*\\(`, 'g'),
                    // static methodName(
                    new RegExp(`static\\s+${methodName}\\s*\\(`, 'g'),
                    // methodName( — as class method
                    new RegExp(`\\b${methodName}\\s*\\(`, 'g')
                ];

                const found = methodPatterns.some(p => p.test(source));

                if (!found) {
                    issues.push({
                        code: 'CONTRACT-001',
                        severity: contract.critical ? 'high' : 'medium',
                        category: 'contract',
                        message: `Contracted method missing: ${compName}.${methodName}()`,
                        file: contract.path,
                        fix: `Restore or rename ${compName}.${methodName}() — downstream files depend on it`
                    });
                    summary.contractsFailed++;
                    continue;
                }

                // CONTRACT-002: Check parameter count (approximate)
                // Find the function definition and count params
                if (spec.minParams !== undefined) {
                    const paramCount = this._countMethodParams(source, methodName);
                    if (paramCount !== null && paramCount < spec.minParams) {
                        issues.push({
                            code: 'CONTRACT-002',
                            severity: contract.critical ? 'high' : 'medium',
                            category: 'contract',
                            message: `Parameter signature changed: ${compName}.${methodName}() has ${paramCount} params, contract requires at least ${spec.minParams}`,
                            file: contract.path,
                            fix: `Verify ${compName}.${methodName}() still accepts the expected parameters`
                        });
                        summary.contractsFailed++;
                        continue;
                    }
                }

                summary.contractsPassed++;
            }
        }

        if (this.verbose) {
            console.log(`[CONTRACT] Checked ${summary.componentsChecked} components, ${summary.methodsChecked} methods`);
            console.log(`[CONTRACT] ${summary.contractsPassed} passed, ${summary.contractsFailed} failed`);
        }

        return { issues, summary };
    }

    /**
     * Count parameters of a method definition
     * Returns null if can't determine
     */
    _countMethodParams(source, methodName) {
        // Try to find: functionName(param1, param2, ...)
        // or: functionName = function(param1, ...)
        const patterns = [
            new RegExp(`function\\s+${methodName}\\s*\\(([^)]*)\\)`, 'g'),
            new RegExp(`${methodName}\\s*\\(([^)]*)\\)\\s*\\{`, 'g'),
            new RegExp(`${methodName}\\s*=\\s*function\\s*\\(([^)]*)\\)`, 'g'),
            new RegExp(`${methodName}\\s*=\\s*\\(([^)]*)\\)\\s*=>`, 'g')
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(source);
            if (match) {
                const params = match[1].trim();
                if (params === '') return 0;
                // Count non-empty params (split by comma)
                return params.split(',').filter(p => p.trim()).length;
            }
        }

        return null; // Can't determine
    }
}

module.exports = ContractValidator;
