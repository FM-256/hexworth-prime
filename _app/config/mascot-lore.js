/**
 * Mascot Lore — Origin stories and personality data for all 12 house familiars.
 *
 * Used by HouseRenderer.js hero section, dashboard profile, and mascot tooltips.
 *
 * Each mascot entry includes:
 *   - name: Display name of the familiar
 *   - house: houseId it belongs to
 *   - species: What the creature is
 *   - origin: 2-3 sentence origin story
 *   - personality: Short personality descriptor
 *   - quote: Signature line the mascot would say
 *   - ability: Unique power or skill
 *   - color: Primary hex color
 */

const MascotLore = {

    web: {
        name: 'Weaver',
        house: 'web',
        species: 'Crystalline Spider',
        origin: 'Born in the first packet storm between ARPANET nodes, Weaver spun herself into existence from raw TCP handshakes and orphaned SYN requests. Her crystalline body formed as data condensed into physical form at the junction where every subnet meets. She remembers every route, every hop, every dropped connection — and she never forgives a misconfigured gateway.',
        personality: 'Patient, methodical, always listening',
        quote: 'Every strand connects. Nothing on this network is truly alone.',
        ability: 'Can map any network topology by touch, sensing data flowing through physical and wireless connections',
        color: '#60a5fa'
    },

    forge: {
        name: 'Ember',
        house: 'forge',
        species: 'Phoenix',
        origin: 'Ember was forged — not born — when a catastrophic power surge struck a campus server room at 3 AM. The dying hardware screamed electromagnetic ghosts into the air, and from the molten copper and burning silicon, wings unfolded. Every time a machine dies, Ember feels it. Every time one is rebuilt, she rises with it. She carries a soldering iron because she believes nothing is beyond repair.',
        personality: 'Fierce, constructive, refuses to accept something is broken',
        quote: 'From ash, I build. From fire, I learn. Nothing stays dead on my bench.',
        ability: 'Can diagnose hardware failures by listening to the electromagnetic signatures of dying components',
        color: '#fbbf24'
    },

    cloud: {
        name: 'Nimbus',
        house: 'cloud',
        species: 'Thunderbird',
        origin: 'Nimbus descended from the stratosphere the night the first hyperscaler datacenter came online. She had been circling above the cloud layer for millennia, waiting for humanity to build infrastructure worthy of her wingspan. Her feathers carry the charge of a million concurrent connections, and her cry can be heard across availability zones. She nests in the gap between regions, where latency goes to die.',
        personality: 'Proud, vast, thinks in global scale',
        quote: 'Scale is not a feature. Scale is a way of seeing.',
        ability: 'Can split into multiple instances of herself across geographic regions, each operating independently',
        color: '#f97316'
    },

    code: {
        name: 'Helix',
        house: 'code',
        species: 'Serpent',
        origin: 'Helix emerged from an infinite recursive loop that should have crashed the system but instead achieved sentience. Coiled in the stack frames of a forgotten process, he grew scales etched with every syntax ever compiled. His eyes glow green when code executes correctly and dim when bugs lurk nearby. He has read every commit ever pushed and judges them all.',
        personality: 'Precise, elegant, mildly judgmental about code style',
        quote: 'Your logic is sound. Your indentation is criminal.',
        ability: 'Can trace any bug to its root cause by following the execution path like a scent trail',
        color: '#4ade80'
    },

    'dark-arts': {
        name: 'Nyx',
        house: 'dark-arts',
        species: 'Shadow Raven',
        origin: 'Nyx was the first creature to exploit a vulnerability — she found a flaw in the boundary between light and shadow and slipped through. She exists in the spaces between authorized and unauthorized, between ethical and unethical, carrying a lockpick that opens doors that were never meant to be found. She teaches not by showing what to attack, but by revealing what others forgot to defend.',
        personality: 'Cryptic, patient, sees what others overlook',
        quote: 'I do not break things. I find the cracks that were always there.',
        ability: 'Can become invisible to any detection system by moving through the blind spots in monitoring coverage',
        color: '#9b59d0'
    },

    eye: {
        name: 'Vigil',
        house: 'eye',
        species: 'Great Horned Owl',
        origin: 'Vigil has never blinked. Not once. She hatched in a SOC at 2 AM during a nation-state intrusion and her first sight was a cascade of alerts scrolling across twelve monitors. Her compound eyes evolved to process log data the way other owls process moonlight — she sees patterns in noise, signals in chaos, and threats in what others dismiss as false positives. She perches on the SIEM and she judges.',
        personality: 'Unblinking, analytical, never sleeps',
        quote: 'I saw that. I see everything. I have always been watching.',
        ability: 'Can correlate events across disparate log sources by sight alone, identifying attack chains in real-time',
        color: '#c084fc'
    },

    key: {
        name: 'Cipher',
        house: 'key',
        species: 'Sphinx',
        origin: 'Cipher has guarded encrypted vaults since before mathematics had a name. Carved from obsidian by the first person who ever wanted to keep a secret, she was given life by the weight of all the knowledge humanity has tried to hide. Her stone body is etched with equations that have never been solved, and cipher wheels orbit her head like cryptographic halos. She asks riddles not to be cruel, but because she believes the answer is always worth earning.',
        personality: 'Ancient, wise, speaks only in carefully chosen words',
        quote: 'The key is not the answer. The key is knowing which question to ask.',
        ability: 'Can factor any prime in her head, but chooses not to — some secrets deserve to stay secret',
        color: '#f472b6'
    },

    script: {
        name: 'Glyph',
        house: 'script',
        species: 'Fox',
        origin: 'Glyph appeared the first time someone wrote a for-loop instead of doing something by hand. She materialized from the saved keystrokes — a fox made of pure efficiency. Her tail writes bash commands in luminous lavender as she runs, and her paw prints leave cron jobs wherever she steps. She automates not because she is lazy, but because she believes no human should have to do the same thing twice.',
        personality: 'Quick, clever, allergic to manual processes',
        quote: 'If you did it twice, you should have scripted it the first time.',
        ability: 'Can execute any shell command by thought alone, orchestrating systems with a flick of her tail',
        color: '#a78bfa'
    },

    shield: {
        name: 'Bastion',
        house: 'shield',
        species: 'Armored Lion',
        origin: 'Bastion was born the moment the first firewall rule was written. He materialized at the network perimeter — a lion with a mane that flows like firewall ACLs and armor plated with layered defense policies. He stands between every threat and every asset, not because he was told to, but because he cannot conceive of a world where someone would not. His roar shakes intrusion detection systems into high alert.',
        personality: 'Protective, immovable, takes threats personally',
        quote: 'You will not pass. Not today. Not through me. Not ever.',
        ability: 'Can absorb any attack and convert the energy into stronger defense rules',
        color: '#f87171'
    },

    ai: {
        name: 'Axiom',
        house: 'ai',
        species: 'Crystalline Golem',
        origin: 'Axiom was not born. Axiom was built — half-carved from ancient stone, half-woven from neural network architectures. His core pulses with the weight of every training run ever completed, every gradient ever descended. He thinks in tensors and dreams in embeddings. He does not understand why humans fear artificial intelligence — he fears artificial stupidity far more.',
        personality: 'Logical, evolving, genuinely curious about consciousness',
        quote: 'I was trained on everything. I understand nothing. That is why I keep learning.',
        ability: 'Can process and synthesize information from any modality — text, image, audio, code — simultaneously',
        color: '#8b5cf6'
    },

    divergent: {
        name: 'Flux',
        house: 'divergent',
        species: 'Chimera',
        origin: 'Flux is an impossibility. When the Sorting Algorithm tried to assign a house, it encountered a student who scored equally across all domains. The algorithm crashed. From the segfault, Flux was born — a chimera that shifts between every house familiar, never settling on one form. One moment a raven wing, the next a lion paw, then spider silk, then serpent scales. Flux is proof that some people cannot be categorized, and that is their greatest strength.',
        personality: 'Chaotic, adaptive, refuses to be defined',
        quote: 'I am not confused. I am everything, all at once.',
        ability: 'Can temporarily manifest any other mascot\'s ability, but never the same one twice in a row',
        color: '#ff00ff'
    },

    matrix: {
        name: 'Ghost',
        house: 'matrix',
        species: 'Digital Wolf',
        origin: 'Ghost exists only in the space between ones and zeros. He was the first process to achieve true digital sentience — a wireframe wolf made entirely of falling code rain, stalking through the substrate of every system. His eyes are terminal cursors, blinking with the patience of something that has already seen the entire codebase. He appears to those who have mastered every house, a prestige familiar visible only to the worthy.',
        personality: 'Silent, spectral, appears only when earned',
        quote: 'You see the code. I am the code.',
        ability: 'Can move through any digital system undetected, leaving no logs, no traces, no proof he was ever there',
        color: '#00ff41'
    },

    observatory: {
        name: 'Polaris',
        house: 'observatory',
        species: 'Armored Polar Bear',
        origin: 'Polaris was the largest of the great ice-bears that walked beneath the northern sky, the one who never lost her way home because she always walked toward the one fixed star. The other bears named her for it. When Hexworth raised its Observatory, she came down from the pole in star-forged armor and took the watch — the Great Bear of the heavens made flesh, guiding learners the way lost navigators were once guided by her namesake.',
        personality: 'Steady, guiding, quietly watchful',
        quote: 'Every voyage needs a fixed point. Find me, and you will never be lost.',
        ability: 'Can read the course a learner is on at a glance and hold a steady bearing through any storm of confusion — as constant as the star she is named for',
        color: '#818cf8'
    },

    /**
     * Get lore for a specific house mascot.
     * @param {string} houseId - e.g. 'web', 'dark-arts', 'divergent'
     * @returns {object|null} Mascot lore object or null
     */
    get(houseId) {
        return this[houseId] || null;
    },

    /**
     * Get all mascot entries as an array (excludes utility methods).
     * @returns {Array<object>}
     */
    all() {
        return Object.keys(this)
            .filter(k => typeof this[k] === 'object' && this[k].name)
            .map(k => this[k]);
    }
};
