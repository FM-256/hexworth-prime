/**
 * EduScan - Fixers Module
 *
 * Auto-fix capabilities for detected issues.
 */

const LearningPathsFixer = require('./learning-paths-fixer');
const RenameMapper = require('./rename-mapper');
const RenameApplier = require('./rename-applier');
const RenameUndo = require('./rename-undo');
const NamingFixer = require('./naming-fixer');

module.exports = {
    LearningPathsFixer,
    RenameMapper,
    RenameApplier,
    RenameUndo,
    NamingFixer
};
