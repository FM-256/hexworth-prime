# LMS Export toolchain

Generators and converters that publish Hexworth content INTO external LMSs (Blackboard Ultra,
Canvas). Design + phases: _docs/architecture/lms-bridge.md. Precedent: _tools/blackboard-export/
(the shipped A+ Core 1 final's deterministic builder -- frozen artifact, superseded by this tree).

POLICY (non-negotiable): answer keys and solution docs NEVER ship in an export. Exports are
GENERATED from the platform's own banks, never hand-edited -- a hand-edited package is drift.

  bb-ultra/            Blackboard Ultra: QTI 2.1 packages + tab-delimited TXT backup
  canvas/              Canvas: QTI (New Quizzes) + Common Cartridge
  common-cartridge/    IMSCC content-page packager + platform-chrome stripper
  completion-codes/    mint/verify tooling for lab completion codes (labs ladder rung 1)
  _shared/             format-agnostic extraction: platform quiz banks -> neutral JSON
