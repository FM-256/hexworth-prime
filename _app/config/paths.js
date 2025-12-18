/**
 * Hexworth Prime - Encoded Path Registry
 *
 * All sensitive and proprietary paths are stored here in encoded form.
 * Use PathCipher.decode() to retrieve actual paths at runtime.
 *
 * DO NOT store decoded paths in this file.
 */

const EncodedPaths = {
    // ==========================================
    // DARK ARTS - The Forbidden House
    // ==========================================
    darkArts: {
        entry: 'yflivi/urix-rkzj/xrkv.yzdc',
        gates: {
            gate1: 'yflivi/urix-rkzj/xrkv.yzdc',
            gate2: 'yflivi/urix-rkzj/xrkvj/xrkv-9.yzdc',
            gate3: 'yflivi/urix-rkzj/xrkvj/xrkv-0.yzdc',
            gate4: 'yflivi/urix-rkzj/xrkvj/xrkv-1.yzdc',
            gate5: 'yflivi/urix-rkzj/xrkvj/xrkv-2.yzdc'
        },
        vault: {
            index: 'yflivi/urix-rkzj/mrlck/zeuvo.yzdc',
            modules: {
                staticAnalysis: 'yflivi/urix-rkzj/mrlck/dfuvcvj/jkrkzt-rercpjzj/',
                behavioral: 'yflivi/urix-rkzj/mrlck/dfuvcvj/svyrmzfirc/',
                malwareFamilies: 'yflivi/urix-rkzj/mrlck/dfuvcvj/drcnriv-wrdzczvj/',
                redTeam: 'yflivi/urix-rkzj/mrlck/dfuvcvj/ivu-kvrd/',
                blueTeam: 'yflivi/urix-rkzj/mrlck/dfuvcvj/sclv-kvrd/'
            }
        },
        assets: {
            dtmfAudio: 'yflivi/urix-rkzj/rjjvkj/czjkve.dg1',
            stegoImage: 'yflivi/urix-rkzj/rjjvkj/jyrunf.gex'
        }
    },

    // ==========================================
    // HIDDEN FEATURES & EASTER EGGS
    // ==========================================
    hidden: {
        easterEgg1: 'rjjvkj/yzuuve/jvtivk.yzdc',
        devConsole: 'rgg/uvm/tfejfcv.yzdc'
    },

    // ==========================================
    // PREMIUM / ADVANCED CONTENT
    // ==========================================
    premium: {
        advancedLabs: 'crsj/rumretvu/zeuvo.yzdc',
        instructorDashboard: 'rudzr/zejkiltkfi/urjysfriu.yzdc',
        certificationPaths: 'gividld/tvikj/zeuvo.yzdc'
    },

    // ==========================================
    // DIGITAL LIFE ECOSYSTEM
    // ==========================================
    digitalLife: {
        core: 'jit/uzxzkrc-czwv/tfiv/',
        behaviors: 'jit/uzxzkrc-czwv/svyrmzfij/',
        effects: 'jit/uzxzkrc-czwv/vwwvtkj/',
        config: 'tfewzx/uzxzkrc-czwv.aj'
    }
};

/**
 * Get a decoded path by key
 * @param {string} category - Top level category (e.g., 'darkArts', 'hidden')
 * @param {string} path - Dot-notation path within category (e.g., 'gates.gate2')
 * @returns {string} - Decoded path
 */
function getPath(category, path) {
    if (!EncodedPaths[category]) {
        console.warn(`Unknown path category: ${category}`);
        return null;
    }

    // Navigate nested path
    const parts = path ? path.split('.') : [];
    let value = EncodedPaths[category];

    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part];
        } else {
            console.warn(`Path not found: ${category}.${path}`);
            return null;
        }
    }

    // Decode if string, return object if nested
    if (typeof value === 'string') {
        return PathCipher.decode(value);
    }

    return value;
}

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EncodedPaths, getPath };
}
