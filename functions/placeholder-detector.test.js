'use strict';

const assert = require('assert');
const D = require('./placeholder-detector');

let pass = 0, fail = 0;
function t(name, fn) {
    try {
        fn();
        pass++;
        console.log('  PASS  ' + name);
    } catch (err) {
        fail++;
        console.log('  FAIL  ' + name + ' :: ' + err.message);
    }
}

console.log('placeholder-detector tests');
console.log('==========================');

console.log('\n[isAllSame] period-1 (memory-documented blind spot)');
t('all-1s len=15 returns true', () => assert.strictEqual(D.isAllSame([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]), true));
t('all-2s len=10 returns true', () => assert.strictEqual(D.isAllSame([2,2,2,2,2,2,2,2,2,2]), true));
t('all-zeros len=10 returns true (subset)', () => assert.strictEqual(D.isAllSame([0,0,0,0,0,0,0,0,0,0]), true));
t('mixed returns false', () => assert.strictEqual(D.isAllSame([0,1,0,1,0,1,0,1]), false));
t('empty returns false', () => assert.strictEqual(D.isAllSame([]), false));

console.log('\n[isClassicCycling] i%4');
t('[0,1,2,3,0,1,2,3] true', () => assert.strictEqual(D.isClassicCycling([0,1,2,3,0,1,2,3]), true));
t('len 4 [0,1,2,3] true', () => assert.strictEqual(D.isClassicCycling([0,1,2,3]), true));
t('len 3 false (below min)', () => assert.strictEqual(D.isClassicCycling([0,1,2]), false));
t('shifted [1,2,3,0,1,2,3,0] false', () => assert.strictEqual(D.isClassicCycling([1,2,3,0,1,2,3,0]), false));

console.log('\n[isPeriodCycling] default minLength=8');
t('period-2 [0,1] x5 true', () => assert.strictEqual(D.isPeriodCycling([0,1,0,1,0,1,0,1,0,1]), true));
t('period-3 [1,2,0] true', () => assert.strictEqual(D.isPeriodCycling([1,2,0,1,2,0,1,2,0]), true));
t('period-4 shifted [1,2,3,0]x2 true', () => assert.strictEqual(D.isPeriodCycling([1,2,3,0,1,2,3,0]), true));
t('len 5 default false (below minLength)', () => assert.strictEqual(D.isPeriodCycling([0,1,0,1,0]), false));
t('len 5 with minLength=5 true', () => assert.strictEqual(D.isPeriodCycling([0,1,0,1,0], { minLength: 5 }), true));
t('real-quiz-shape [3,1,2,0,3,1,0,2,1,3] false', () => assert.strictEqual(D.isPeriodCycling([3,1,2,0,3,1,0,2,1,3]), false));

console.log('\n[isPeriodCycling] period-5 (Phase C blast radius)');
t('cert/clh-015 [1,1,2,1,1] x2 true', () => assert.strictEqual(D.isPeriodCycling([1,1,2,1,1,1,1,2,1,1]), true));
t('threat-hunting [1,1,1,1,2] x2 true', () => assert.strictEqual(D.isPeriodCycling([1,1,1,1,2,1,1,1,1,2]), true));

console.log('\n[isNearCycling] head matches i%4 + last 1-2 drift');
t('[0,1,2,3,0,1,2,3,0,1,1] true (last differs)', () => assert.strictEqual(D.isNearCycling([0,1,2,3,0,1,2,3,0,1,1]), true));
t('[0,1,2,3,0,1,2,3,0,3,1] true (last 2 differ)', () => assert.strictEqual(D.isNearCycling([0,1,2,3,0,1,2,3,0,3,1]), true));
t('strict cycle [0,1,2,3,0,1,2,3,0,1,2,3] true (head matches)', () => assert.strictEqual(D.isNearCycling([0,1,2,3,0,1,2,3,0,1,2,3]), true));
t('len 4 false (below min)', () => assert.strictEqual(D.isNearCycling([0,1,2,3]), false));
t('shifted head [1,2,3,0,1,2,3,0,1,2,2] false', () => assert.strictEqual(D.isNearCycling([1,2,3,0,1,2,3,0,1,2,2]), false));

console.log('\n[isExactPlaceholder] caller-supplied patterns');
const PATTERNS = [[0,0,0,0,0,0,0,0], [3,3,3,3,3,3,3,3]];
t('exact match against pattern list true', () => assert.strictEqual(D.isExactPlaceholder([0,0,0,0,0,0,0,0], PATTERNS), true));
t('different length false', () => assert.strictEqual(D.isExactPlaceholder([0,0,0], PATTERNS), false));
t('no patterns supplied returns false (does not throw)', () => assert.strictEqual(D.isExactPlaceholder([0,0,0], undefined), false));
t('empty patterns list false', () => assert.strictEqual(D.isExactPlaceholder([0,0,0], []), false));

console.log('\n[classify] returns category strings');
t('all-zeros -> ALL-ZEROS', () => assert.strictEqual(D.classify([0,0,0,0,0,0,0,0]), 'ALL-ZEROS'));
t('all-1s -> ALL-SAME', () => assert.strictEqual(D.classify([1,1,1,1,1,1,1,1]), 'ALL-SAME'));
t('classic cycle -> CLASSIC-CYCLING', () => assert.strictEqual(D.classify([0,1,2,3,0,1,2,3]), 'CLASSIC-CYCLING'));
t('period-3 -> PERIOD-CYCLING', () => assert.strictEqual(D.classify([1,2,0,1,2,0,1,2,0]), 'PERIOD-CYCLING'));
t('near-cycle -> NEAR-CYCLING', () => assert.strictEqual(D.classify([0,1,2,3,0,1,2,3,0,3,1]), 'NEAR-CYCLING'));
t('real array -> REAL', () => assert.strictEqual(D.classify([3,1,2,0,3,1,0,2,1,3,2,0,1,3,2]), 'REAL'));
t('empty -> EMPTY', () => assert.strictEqual(D.classify([]), 'EMPTY'));
t('exact-match priority over classic', () => {
    const arr = [0,1,2,3,0,1,2,3];
    assert.strictEqual(D.classify(arr, { patterns: [arr] }), 'EXACT-MATCH');
});

console.log('\n[isPlaceholder] boolean union');
t('all-1s placeholder', () => assert.strictEqual(D.isPlaceholder([1,1,1,1,1,1,1,1]), true));
t('classic cycle placeholder', () => assert.strictEqual(D.isPlaceholder([0,1,2,3,0,1,2,3]), true));
t('period-5 with default minLength=8 placeholder', () => assert.strictEqual(D.isPlaceholder([1,1,2,1,1,1,1,2,1,1]), true));
t('real array not placeholder', () => assert.strictEqual(D.isPlaceholder([3,1,2,0,3,1,0,2,1,3,2,0,1,3,2]), false));
t('empty not placeholder', () => assert.strictEqual(D.isPlaceholder([]), false));
t('opts.patterns supplied + matches -> placeholder', () => {
    assert.strictEqual(D.isPlaceholder([5,5,5], { patterns: [[5,5,5]] }), true);
});
t('opts.patterns absent -> exact-match silently skipped (does not throw)', () => {
    assert.strictEqual(D.isPlaceholder([3,1,2,0,3,1,0,2,1,3,2,0,1,3,2]), false);
});

console.log('\n[parity] documented blind-spot fixtures (memory: 14 of 40 P0 LIVE keys)');
t('period-1 all-1s len=20 caught', () => assert.strictEqual(D.isPlaceholder(Array(20).fill(1)), true));
t('period-1 all-3s len=15 caught', () => assert.strictEqual(D.isPlaceholder(Array(15).fill(3)), true));
t('len-5 cycling [0,1,0,1,0] caught with minLength=5', () => {
    assert.strictEqual(D.isPlaceholder([0,1,0,1,0], { minLength: 5 }), true);
});
t('len-6 cycling [2,3,2,3,2,3] caught with minLength=6', () => {
    assert.strictEqual(D.isPlaceholder([2,3,2,3,2,3], { minLength: 6 }), true);
});

console.log('\n==========================');
console.log('Summary: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail > 0 ? 1 : 0);
