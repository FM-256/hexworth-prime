/* QC config for the GPG Keyring Workbench lab. Runs all 4 real public-key
   missions (keygen, encrypt-to-recipient, sign+verify, fingerprint trust) to
   certification; a wrong trust pick / undone missions must not certify. */
export default {
  lab: 'houses/shield/labs/shield-gpg-encryption.lab.html',
  moduleId: 'shield-gpg-encryption',
  solveWaitMs: 7000,
  // page-context: real RSA keygen, encrypt/decrypt to recipient, sign+verify+catch-forgery, fingerprint trust.
  solve: async () => {
    await window.m1generate();
    await window.m2generateBob(); await window.m2encrypt(); await window.m2decrypt();
    await window.m3sign(); await window.m3verify(false); await window.m3verify(true);
    await window.m4generateMorse(); window.m4checkMatch(); window.m4pickTrust('full'); window.m4submit();
  },
  // page-context: generate the contact key but assign the wrong trust level -> mission 4 fails, missions undone -> no cert.
  wrong: async () => {
    await window.m4generateMorse(); window.m4pickTrust('ultimate'); window.m4submit();
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
