#!/usr/bin/env python3
"""
build-ch25.py — A+ Core 2, Chapter 25: Virtualization.

@catalog what   Builds the ch25 virtualization presentation for A+ Core 2 by lifting the
@catalog what   shell (style + nav engine) from an approved Core 2 deck and emitting slides.
@catalog run    python3 _planning/aplus-core2-virtualization/build-ch25.py
@catalog status TOOL

WHY IT LIFTS RATHER THAN RETYPES
  Core 2 presentations share one visual system: .slide / .slide-inner / .slide-meta /
  .slide-title with an <span class="accent">, hand-drawn inline SVG diagrams, a fixed nav
  bar and a slide engine that restarts SVG animations on entry. Retyping that would drift
  from the other thirteen decks on day one. The <style> and the engine are copied byte for
  byte out of forge-malware.presentation.html; only TOTAL, the title, the counter and the
  ModuleProgress id are substituted.

SCOPE — CHAPTER ONLY, NO LAB YET
  Operator: "lets add a chapter on virtualization the concepts of hypervisors, Type 1,
  Type 2, oracle box, vm ware and once we get it dona and we are happy with how it came
  out we will design a lab for the chapter." So this builds the chapter hub and the
  presentation. The lab is deliberately NOT built, and the hub does not pretend it exists:
  it shows the lab and quiz as not-yet-built rather than linking to a 404.
"""
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
C2 = REPO / '_app/houses/forge/applets/comptia-aplus/core-2'
SOURCE = C2 / 'presentations/forge-malware.presentation.html'
OUT_PRES = C2 / 'presentations/forge-virtualization.presentation.html'
OUT_HUB = C2 / 'chapters/ch25-virtualization/index.html'

TITLE = 'Virtualization &amp; Hypervisors | A+ Core 2'
PROGRESS_ID = 'forge-core2-virtualization-pres'


def die(m):
    print('ABORTED: ' + m, file=sys.stderr)
    sys.exit(1)


def slide(n, total, title_plain, title_accent, subtitle, body):
    return f'''
<!-- ==================== SLIDE {n} ==================== -->
<section class="slide{' active' if n == 1 else ''}" id="slide-{n}">
    <div class="slide-inner">
        <div class="slide-meta">Slide {n} of {total}</div>
        <div class="slide-title">{title_plain} <span class="accent">{title_accent}</span></div>
        <div class="slide-subtitle">{subtitle}</div>
{body}
    </div>
</section>'''


# ── SVG fragments ────────────────────────────────────────────────────────────
# Drawn, not stock. Each one carries the slide's single idea; a diagram that does not
# enact the point is decoration, and the Core 1/2 decks do not use decoration.

SVG_STACK = '''
        <div class="diagram-center">
        <svg width="900" height="250" viewBox="0 0 900 250" role="img"
             aria-label="Type 1 hypervisor runs on bare metal; Type 2 runs on top of a host operating system">
          <text x="215" y="20" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="13" font-weight="700" fill="#22d3ee">TYPE 1 &#8212; Bare Metal</text>
          <rect x="70" y="34" width="290" height="34" rx="5" fill="#0f0f1a" stroke="#334155"/>
          <text x="215" y="56" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="12" fill="#94a3b8">VM &nbsp;|&nbsp; VM &nbsp;|&nbsp; VM</text>
          <rect x="70" y="76" width="290" height="40" rx="5" fill="rgba(34,211,238,.12)" stroke="#22d3ee" stroke-width="2"/>
          <text x="215" y="101" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="13" font-weight="700" fill="#22d3ee">HYPERVISOR</text>
          <rect x="70" y="124" width="290" height="36" rx="5" fill="#0f0f1a" stroke="#475569"/>
          <text x="215" y="147" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="12" fill="#cbd5e1">PHYSICAL HARDWARE</text>
          <text x="215" y="182" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="11" fill="#4ade80">No host OS in the path</text>

          <text x="685" y="20" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="13" font-weight="700" fill="#ffd86b">TYPE 2 &#8212; Hosted</text>
          <rect x="540" y="34" width="290" height="34" rx="5" fill="#0f0f1a" stroke="#334155"/>
          <text x="685" y="56" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="12" fill="#94a3b8">VM &nbsp;|&nbsp; VM</text>
          <rect x="540" y="76" width="290" height="34" rx="5" fill="rgba(255,216,107,.12)" stroke="#ffd86b" stroke-width="2"/>
          <text x="685" y="98" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="13" font-weight="700" fill="#ffd86b">HYPERVISOR (an app)</text>
          <rect x="540" y="118" width="290" height="34" rx="5" fill="#0f0f1a" stroke="#a855f7"/>
          <text x="685" y="140" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="12" fill="#c4b5fd">HOST OS (Windows / macOS / Linux)</text>
          <rect x="540" y="160" width="290" height="34" rx="5" fill="#0f0f1a" stroke="#475569"/>
          <text x="685" y="182" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="12" fill="#cbd5e1">PHYSICAL HARDWARE</text>
          <text x="685" y="214" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="11" fill="#f97316">One extra layer to cross</text>

          <line x1="450" y1="30" x2="450" y2="220" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
        </svg>
        </div>'''

SVG_NET = '''
        <div class="diagram-center">
        <svg width="900" height="200" viewBox="0 0 900 200" role="img"
             aria-label="Four virtual network modes: NAT, Bridged, Host-only and Internal">
          <g font-family="'Segoe UI',sans-serif">
            <rect x="20" y="30" width="195" height="140" rx="8" fill="#0f0f1a" stroke="#22d3ee" stroke-width="1.6"/>
            <text x="117" y="52" text-anchor="middle" font-size="13" font-weight="700" fill="#22d3ee">NAT</text>
            <text x="117" y="76" text-anchor="middle" font-size="11" fill="#cbd5e1">VM &#8594; host &#8594; internet</text>
            <text x="117" y="98" text-anchor="middle" font-size="11" fill="#4ade80">Out: yes</text>
            <text x="117" y="118" text-anchor="middle" font-size="11" fill="#f97316">In: no</text>
            <text x="117" y="150" text-anchor="middle" font-size="10.5" fill="#64748b">The default. Safest.</text>

            <rect x="235" y="30" width="195" height="140" rx="8" fill="#0f0f1a" stroke="#4ade80" stroke-width="1.6"/>
            <text x="332" y="52" text-anchor="middle" font-size="13" font-weight="700" fill="#4ade80">BRIDGED</text>
            <text x="332" y="76" text-anchor="middle" font-size="11" fill="#cbd5e1">VM gets its own LAN IP</text>
            <text x="332" y="98" text-anchor="middle" font-size="11" fill="#4ade80">Out: yes</text>
            <text x="332" y="118" text-anchor="middle" font-size="11" fill="#4ade80">In: yes</text>
            <text x="332" y="150" text-anchor="middle" font-size="10.5" fill="#64748b">A peer on the network.</text>

            <rect x="450" y="30" width="195" height="140" rx="8" fill="#0f0f1a" stroke="#ffd86b" stroke-width="1.6"/>
            <text x="547" y="52" text-anchor="middle" font-size="13" font-weight="700" fill="#ffd86b">HOST-ONLY</text>
            <text x="547" y="76" text-anchor="middle" font-size="11" fill="#cbd5e1">VM &#8596; host only</text>
            <text x="547" y="98" text-anchor="middle" font-size="11" fill="#f97316">Out: no</text>
            <text x="547" y="118" text-anchor="middle" font-size="11" fill="#4ade80">Host: yes</text>
            <text x="547" y="150" text-anchor="middle" font-size="10.5" fill="#64748b">Private lab wire.</text>

            <rect x="665" y="30" width="195" height="140" rx="8" fill="#0f0f1a" stroke="#a855f7" stroke-width="1.6"/>
            <text x="762" y="52" text-anchor="middle" font-size="13" font-weight="700" fill="#a855f7">INTERNAL</text>
            <text x="762" y="76" text-anchor="middle" font-size="11" fill="#cbd5e1">VM &#8596; VM only</text>
            <text x="762" y="98" text-anchor="middle" font-size="11" fill="#f97316">Out: no</text>
            <text x="762" y="118" text-anchor="middle" font-size="11" fill="#f97316">Host: no</text>
            <text x="762" y="150" text-anchor="middle" font-size="10.5" fill="#64748b">Sealed. Malware work.</text>
          </g>
        </svg>
        </div>'''

SVG_SNAPSHOT = '''
        <div class="diagram-center">
        <svg width="880" height="170" viewBox="0 0 880 170" role="img"
             aria-label="A snapshot is a restore point on a chain, not a backup">
          <line x1="60" y1="70" x2="820" y2="70" stroke="#334155" stroke-width="2"/>
          <g font-family="'Segoe UI',sans-serif" font-size="11">
            <circle cx="120" cy="70" r="13" fill="#0f0f1a" stroke="#4ade80" stroke-width="2.4"/>
            <text x="120" y="45" text-anchor="middle" fill="#4ade80" font-weight="700">Clean install</text>
            <text x="120" y="100" text-anchor="middle" fill="#64748b">snapshot 1</text>

            <circle cx="360" cy="70" r="13" fill="#0f0f1a" stroke="#22d3ee" stroke-width="2.4"/>
            <text x="360" y="45" text-anchor="middle" fill="#22d3ee" font-weight="700">Tools installed</text>
            <text x="360" y="100" text-anchor="middle" fill="#64748b">snapshot 2</text>

            <circle cx="600" cy="70" r="13" fill="#0f0f1a" stroke="#f97316" stroke-width="2.4"/>
            <text x="600" y="45" text-anchor="middle" fill="#f97316" font-weight="700">Before the risky change</text>
            <text x="600" y="100" text-anchor="middle" fill="#64748b">snapshot 3</text>

            <circle cx="790" cy="70" r="9" fill="#ef4444"/>
            <text x="790" y="45" text-anchor="middle" fill="#ef4444" font-weight="700">Broken</text>
            <path d="M 782 88 Q 690 130 608 88" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
            <text x="700" y="146" text-anchor="middle" fill="#ef4444" font-size="11.5">revert &#8594; seconds, not a reinstall</text>
          </g>
        </svg>
        </div>'''



# Added in the hexify pass. Measured gap: 8 of 18 slides had NO visual, against 3 of 21
# on the approved sibling deck. Identity rule 4.1 is open-book -- the visual carries the
# same content in visual form, so a slide of bullets alone does not meet it.

SVG_JOBS = '''
        <div class="diagram-center">
        <svg width="900" height="205" viewBox="0 0 900 205" role="img"
             aria-label="The hypervisor's four jobs">
          <g font-family="'Segoe UI',sans-serif">
            <rect x="330" y="8" width="240" height="34" rx="8" fill="rgba(34,211,238,.14)" stroke="#22d3ee" stroke-width="2"/>
            <text x="450" y="30" text-anchor="middle" font-size="13" fill="#22d3ee" font-weight="700">HYPERVISOR</text>
            <rect x="20" y="72" width="200" height="120" rx="8" fill="#0f0f1a" stroke="#4ade80" stroke-width="1.6"/>
            <text x="120" y="94" text-anchor="middle" font-size="12" fill="#4ade80" font-weight="700">SCHEDULING</text>
            <text x="120" y="122" text-anchor="middle" font-size="11" fill="#cbd5e1">Real cores shared in time slices</text>
            <text x="120" y="166" text-anchor="middle" font-size="10.5" fill="#64748b">as an OS shares one core</text>
            <rect x="240" y="72" width="200" height="120" rx="8" fill="#0f0f1a" stroke="#22d3ee" stroke-width="1.6"/>
            <text x="340" y="94" text-anchor="middle" font-size="12" fill="#22d3ee" font-weight="700">MEMORY MAPPING</text>
            <text x="340" y="122" text-anchor="middle" font-size="11" fill="#cbd5e1">Every guest starts at zero</text>
            <text x="340" y="166" text-anchor="middle" font-size="10.5" fill="#64748b">translated to real addresses</text>
            <rect x="460" y="72" width="200" height="120" rx="8" fill="#0f0f1a" stroke="#ffd86b" stroke-width="1.6"/>
            <text x="560" y="94" text-anchor="middle" font-size="12" fill="#ffd86b" font-weight="700">DEVICE EMULATION</text>
            <text x="560" y="122" text-anchor="middle" font-size="11" fill="#cbd5e1">Guest sees a disk</text>
            <text x="560" y="142" text-anchor="middle" font-size="11" fill="#cbd5e1">Host sees a file</text>
            <rect x="680" y="72" width="200" height="120" rx="8" fill="#0f0f1a" stroke="#a855f7" stroke-width="1.6"/>
            <text x="780" y="94" text-anchor="middle" font-size="12" fill="#a855f7" font-weight="700">ISOLATION</text>
            <text x="780" y="122" text-anchor="middle" font-size="11" fill="#cbd5e1">No guest reads another</text>
            <text x="780" y="166" text-anchor="middle" font-size="10.5" fill="#4ade80">everything rests on this</text>
          </g>
        </svg>
        </div>'''

SVG_VBOX = '''
        <div class="diagram-center">
        <svg width="890" height="175" viewBox="0 0 890 175" role="img"
             aria-label="A new VM is an empty computer until an ISO is attached and guest tools installed">
          <g font-family="'Segoe UI',sans-serif">
            <rect x="20" y="40" width="190" height="115" rx="8" fill="#0f0f1a" stroke="#ef4444" stroke-width="1.8"/>
            <text x="115" y="66" text-anchor="middle" font-size="12" fill="#ef4444" font-weight="700">NEW VM</text>
            <text x="115" y="92" text-anchor="middle" font-size="11" fill="#cbd5e1">No OS. Nothing on disk.</text>
            <text x="115" y="120" text-anchor="middle" font-size="10.5" fill="#f97316">&#8220;No bootable medium&#8221;</text>
            <rect x="240" y="40" width="190" height="115" rx="8" fill="#0f0f1a" stroke="#ffd86b" stroke-width="1.8"/>
            <text x="335" y="66" text-anchor="middle" font-size="12" fill="#ffd86b" font-weight="700">ATTACH THE ISO</text>
            <text x="335" y="92" text-anchor="middle" font-size="11" fill="#cbd5e1">Virtual optical drive</text>
            <text x="335" y="120" text-anchor="middle" font-size="10.5" fill="#64748b">now it can boot</text>
            <rect x="460" y="40" width="190" height="115" rx="8" fill="#0f0f1a" stroke="#22d3ee" stroke-width="1.8"/>
            <text x="555" y="66" text-anchor="middle" font-size="12" fill="#22d3ee" font-weight="700">INSTALL THE OS</text>
            <text x="555" y="92" text-anchor="middle" font-size="11" fill="#cbd5e1">Guest is real now</text>
            <text x="555" y="120" text-anchor="middle" font-size="10.5" fill="#64748b">fixed res, no clipboard</text>
            <rect x="680" y="40" width="190" height="115" rx="8" fill="#0f0f1a" stroke="#4ade80" stroke-width="1.8"/>
            <text x="775" y="66" text-anchor="middle" font-size="12" fill="#4ade80" font-weight="700">GUEST ADDITIONS</text>
            <text x="775" y="92" text-anchor="middle" font-size="11" fill="#cbd5e1">Installed INSIDE the guest</text>
            <text x="775" y="120" text-anchor="middle" font-size="10.5" fill="#4ade80">resize + clipboard fixed</text>
          </g>
        </svg>
        </div>'''

SVG_VMWARE = '''
        <div class="diagram-center">
        <svg width="860" height="190" viewBox="0 0 860 190" role="img"
             aria-label="A VMDK moves from Workstation to ESXi without conversion">
          <g font-family="'Segoe UI',sans-serif">
            <rect x="30" y="45" width="230" height="105" rx="8" fill="#0f0f1a" stroke="#22d3ee" stroke-width="1.8"/>
            <text x="145" y="72" text-anchor="middle" font-size="12.5" fill="#22d3ee" font-weight="700">YOUR BENCH</text>
            <text x="145" y="96" text-anchor="middle" font-size="11" fill="#cbd5e1">Workstation Pro / Fusion</text>
            <text x="145" y="120" text-anchor="middle" font-size="11" fill="#94a3b8">Type 2, on your laptop</text>
            <rect x="345" y="70" width="170" height="56" rx="8" fill="rgba(255,216,107,.12)" stroke="#ffd86b" stroke-width="2"/>
            <text x="430" y="94" text-anchor="middle" font-size="13" fill="#ffd86b" font-weight="700">.VMDK</text>
            <text x="430" y="114" text-anchor="middle" font-size="10.5" fill="#cbd5e1">one virtual disk file</text>
            <rect x="600" y="45" width="230" height="105" rx="8" fill="#0f0f1a" stroke="#4ade80" stroke-width="1.8"/>
            <text x="715" y="72" text-anchor="middle" font-size="12.5" fill="#4ade80" font-weight="700">PRODUCTION</text>
            <text x="715" y="96" text-anchor="middle" font-size="11" fill="#cbd5e1">ESXi / vSphere</text>
            <text x="715" y="120" text-anchor="middle" font-size="11" fill="#94a3b8">Type 1, in the rack</text>
            <text x="430" y="175" text-anchor="middle" font-size="11.5" fill="#4ade80">No conversion step. The habits travel with the file.</text>
          </g>
        </svg>
        </div>'''

SVG_RAM = '''
        <div class="diagram-center">
        <svg width="860" height="200" viewBox="0 0 860 200" role="img"
             aria-label="Guest RAM is taken from host RAM while the VM runs">
          <g font-family="'Segoe UI',sans-serif">
            <text x="30" y="28" text-anchor="start" font-size="12.5" fill="#cbd5e1" font-weight="700">A 16 GB host, budgeted honestly</text>
            <rect x="30" y="42" width="800" height="44" rx="8" fill="#0f0f1a" stroke="#475569" stroke-width="1.6"/>
            <rect x="32" y="44" width="298" height="40" rx="5" fill="rgba(168,85,247,.25)"/>
            <text x="181" y="69" text-anchor="middle" font-size="12" fill="#c4b5fd" font-weight="700">HOST OS + apps &#183; 6 GB</text>
            <rect x="332" y="44" width="198" height="40" rx="5" fill="rgba(34,211,238,.25)"/>
            <text x="431" y="69" text-anchor="middle" font-size="12" fill="#22d3ee" font-weight="700">VM 1 &#183; 4 GB</text>
            <rect x="532" y="44" width="198" height="40" rx="5" fill="rgba(74,222,128,.25)"/>
            <text x="631" y="69" text-anchor="middle" font-size="12" fill="#4ade80" font-weight="700">VM 2 &#183; 4 GB</text>
            <rect x="732" y="44" width="96" height="40" rx="5" fill="rgba(148,163,184,.18)"/>
            <text x="780" y="69" text-anchor="middle" font-size="11" fill="#94a3b8">headroom</text>
            <text x="30" y="122" text-anchor="start" font-size="12.5" fill="#ef4444" font-weight="700">Over-allocated &#8212; the host swaps and everything crawls</text>
            <rect x="30" y="136" width="800" height="44" rx="8" fill="#0f0f1a" stroke="#ef4444" stroke-width="1.6"/>
            <rect x="32" y="138" width="298" height="40" rx="5" fill="rgba(168,85,247,.25)"/>
            <text x="181" y="163" text-anchor="middle" font-size="12" fill="#c4b5fd" font-weight="700">HOST OS + apps &#183; 6 GB</text>
            <rect x="332" y="138" width="396" height="40" rx="5" fill="rgba(239,68,68,.28)"/>
            <text x="530" y="163" text-anchor="middle" font-size="12" fill="#fca5a5" font-weight="700">VM 1 &#183; 8 GB &nbsp;+&nbsp; VM 2 &#183; 8 GB</text>
            <rect x="730" y="138" width="98" height="40" rx="5" fill="rgba(239,68,68,.5)"/>
            <text x="779" y="163" text-anchor="middle" font-size="11" fill="#fecaca">overflow</text>
          </g>
        </svg>
        </div>'''

SVG_BIOS = '''
        <div class="diagram-center">
        <svg width="880" height="200" viewBox="0 0 880 200" role="img"
             aria-label="Enable VT-x in firmware, then check what else claims it">
          <g font-family="'Segoe UI',sans-serif">
            <rect x="20" y="30" width="185" height="96" rx="8" fill="#0f0f1a" stroke="#22d3ee" stroke-width="1.6"/>
            <text x="112" y="56" text-anchor="middle" font-size="12" fill="#22d3ee" font-weight="700">1 &#183; REBOOT</text>
            <text x="112" y="80" text-anchor="middle" font-size="11" fill="#cbd5e1">Del / F2 / F10 / F12</text>
            <text x="112" y="102" text-anchor="middle" font-size="10.5" fill="#64748b">during POST</text>
            <rect x="225" y="30" width="185" height="96" rx="8" fill="#0f0f1a" stroke="#ffd86b" stroke-width="1.6"/>
            <text x="317" y="56" text-anchor="middle" font-size="12" fill="#ffd86b" font-weight="700">2 &#183; FIND IT</text>
            <text x="317" y="78" text-anchor="middle" font-size="10.5" fill="#cbd5e1">Advanced / CPU Config</text>
            <text x="317" y="98" text-anchor="middle" font-size="10.5" fill="#94a3b8">VT-x &#183; SVM &#183; AMD-V</text>
            <rect x="430" y="30" width="185" height="96" rx="8" fill="#0f0f1a" stroke="#4ade80" stroke-width="1.6"/>
            <text x="522" y="56" text-anchor="middle" font-size="12" fill="#4ade80" font-weight="700">3 &#183; ENABLE + SAVE</text>
            <text x="522" y="78" text-anchor="middle" font-size="10.5" fill="#cbd5e1">Full power cycle</text>
            <text x="522" y="98" text-anchor="middle" font-size="10.5" fill="#64748b">warm reboot may not take</text>
            <rect x="635" y="30" width="225" height="96" rx="8" fill="#0f0f1a" stroke="#a855f7" stroke-width="1.6"/>
            <text x="747" y="56" text-anchor="middle" font-size="12" fill="#a855f7" font-weight="700">4 &#183; CONFIRM</text>
            <text x="747" y="78" text-anchor="middle" font-size="10.5" fill="#cbd5e1">Task Manager &#8594; Performance</text>
            <text x="747" y="98" text-anchor="middle" font-size="10.5" fill="#4ade80">&#8220;Virtualization: Enabled&#8221;</text>
            <rect x="20" y="142" width="840" height="48" rx="7" fill="rgba(239,68,68,.10)" stroke="#ef4444" stroke-width="1.4"/>
            <text x="36" y="164" text-anchor="start" font-size="11.5" fill="#fca5a5" font-weight="700">Enabled and VirtualBox still complains?</text>
            <text x="36" y="182" text-anchor="start" font-size="11" fill="#cbd5e1">Hyper-V &#183; WSL2 &#183; Windows Sandbox &#183; Memory Integrity &#183; Credential Guard claim the same extensions.</text>
          </g>
        </svg>
        </div>'''

SVG_SEC = '''
        <div class="diagram-center">
        <svg width="880" height="215" viewBox="0 0 880 215" role="img"
             aria-label="The VM boundary holds except through holes you deliberately open">
          <g font-family="'Segoe UI',sans-serif">
            <rect x="40" y="35" width="330" height="140" rx="10" fill="#0f0f1a" stroke="#ef4444" stroke-width="2"/>
            <text x="205" y="60" text-anchor="middle" font-size="12.5" fill="#ef4444" font-weight="700">GUEST &#8212; assume hostile</text>
            <text x="205" y="90" text-anchor="middle" font-size="11" fill="#cbd5e1">Malware runs here</text>
            <text x="205" y="114" text-anchor="middle" font-size="11" fill="#94a3b8">Cannot read host memory</text>
            <text x="205" y="138" text-anchor="middle" font-size="11" fill="#94a3b8">Cannot read other guests</text>
            <text x="205" y="162" text-anchor="middle" font-size="10.5" fill="#64748b">isolation is the whole feature</text>
            <rect x="510" y="35" width="330" height="140" rx="10" fill="#0f0f1a" stroke="#4ade80" stroke-width="2"/>
            <text x="675" y="60" text-anchor="middle" font-size="12.5" fill="#4ade80" font-weight="700">HOST &#8212; protect it</text>
            <text x="675" y="90" text-anchor="middle" font-size="11" fill="#cbd5e1">Your real machine</text>
            <text x="675" y="114" text-anchor="middle" font-size="11" fill="#cbd5e1">Your real network</text>
            <text x="675" y="138" text-anchor="middle" font-size="11" fill="#cbd5e1">Your real credentials</text>
            <line x1="440" y1="32" x2="440" y2="178" stroke="#22d3ee" stroke-width="3"/>
            <text x="440" y="24" text-anchor="middle" font-size="11" fill="#22d3ee" font-weight="700">BOUNDARY</text>
            <g stroke="#f97316" stroke-width="2" stroke-dasharray="5 3">
              <line x1="372" y1="72" x2="508" y2="72"/><line x1="372" y1="104" x2="508" y2="104"/>
              <line x1="372" y1="136" x2="508" y2="136"/></g>
            <text x="440" y="200" text-anchor="middle" font-size="11.5" fill="#f97316">Shared folders &#183; clipboard &#183; bridged networking &#8212; holes YOU opened</text>
          </g>
        </svg>
        </div>'''


def cards(items, cls='card'):
    out = ['        <div class="card-grid">']
    for label, desc in items:
        out.append(f'            <div class="{cls}"><div class="card-label">{label}</div>'
                   f'<div class="card-desc">{desc}</div></div>')
    out.append('        </div>')
    return '\n'.join(out)


def kps(items):
    out = ['        <div class="kp-list">']
    for t in items:
        out.append(f'            <div class="kp-row"><span class="kp-dot"></span><span>{t}</span></div>')
    out.append('        </div>')
    return '\n'.join(out)


def box(label, text):
    return (f'        <div class="box"><div class="box-label">{label}</div>'
            f'<div>{text}</div></div>')


# ── SLIDES ───────────────────────────────────────────────────────────────────
SLIDES = [
    ('Virtualization', 'and Hypervisors',
     'One physical machine, many independent computers. The idea underneath cloud, labs and modern IT.',
     kps([
         'A <b>virtual machine</b> is a complete computer &mdash; CPU, memory, disk, network card &mdash; that exists as files on a real one.',
         'The <b>hypervisor</b> is the software that creates those machines and hands them slices of the real hardware.',
         'The guest OS does not know. It boots, sees hardware, and behaves exactly as it would on metal.',
         'This chapter: what a hypervisor is, the two types, and the two Type 2 products you will actually install.',
     ]) + box('Why an A+ technician cares',
              'Every cloud service you have ever used runs in a VM. Every safe place to test a suspicious file '
              'is a VM. Every "can you support Windows 10 and 11 and Linux on one laptop" is a VM.')),

    ('The problem', 'virtualization solves',
     'Before VMs, one physical server ran one workload &mdash; and mostly sat idle.',
     cards([
         ('One box, one job', 'A server running a single application typically used 5&ndash;15% of its CPU. The other 85% was paid for, powered, cooled, and wasted.'),
         ('Slow to provision', 'Needing a new server meant purchasing, racking, cabling and installing. Weeks.'),
         ('Fragile to test', 'Trying a patch meant trying it on the real thing, or buying a second real thing.'),
         ('Hard to recover', 'A broken OS meant a reinstall from media, then reconfiguration from memory.'),
     ]) + box('The shift',
              'Virtualization turns a computer into a file. Files can be copied, moved, paused, duplicated, '
              'rolled back and deleted. Every advantage below follows from that one sentence.')),

    ('What a hypervisor', 'actually does',
     'It is a traffic controller for real hardware, handing time-slices and address ranges to guests that think they own the machine.',
     SVG_JOBS + kps([
         '<b>Scheduling.</b> Real CPU cores are shared between guests, the way an OS shares one core between programs.',
         '<b>Memory mapping.</b> Each guest sees an address space starting at zero. The hypervisor translates to real addresses.',
         '<b>Device emulation.</b> The guest sees an ordinary disk and NIC; the hypervisor turns those into a file and a virtual switch.',
         '<b>Isolation.</b> A guest cannot read another guest\'s memory. This is the property everything else depends on.',
     ]) + box('The term to keep straight',
              '<b>Host</b> = the physical machine and the software running the VMs. <b>Guest</b> = the operating '
              'system inside a VM. Exam questions are frequently just testing whether you read that the right way round.')),

    ('Type 1 vs Type 2', '&mdash; the distinction that matters',
     'The only real question: is there a host operating system between the hypervisor and the hardware?',
     SVG_STACK + box('How to answer this in one sentence',
                     'Type 1 IS the operating system. Type 2 RUNS ON an operating system. If you can minimise it '
                     'and check your email, it is Type 2.')),

    ('Type 1', 'in the wild',
     'Bare-metal hypervisors. What data centres and cloud providers run.',
     cards([
         ('VMware ESXi', 'The long-standing enterprise standard. Managed at scale by vCenter.'),
         ('Microsoft Hyper-V', 'A Windows Server role. Also present on Windows Pro, where it still installs beneath the OS.'),
         ('KVM', 'Built into the Linux kernel. What most public clouds and our own OpenStack sandbox run on.'),
         ('Xen', 'The open-source hypervisor behind a large share of early cloud infrastructure.'),
     ]) + kps([
         '<b>Faster</b>, because there is no host OS to traverse for every instruction.',
         '<b>More stable</b>, because there is no host OS to crash underneath the guests.',
         '<b>Not for a laptop.</b> Installing one wipes the machine &mdash; it becomes the operating system.',
     ])),

    ('Type 2', 'in the wild',
     'Hosted hypervisors. What you install on a computer you are already using.',
     cards([
         ('Oracle VirtualBox', 'Free, open source, runs on Windows, macOS and Linux. The usual teaching choice.'),
         ('VMware Workstation Pro', 'Now free for personal use. Stronger performance and snapshot tooling.'),
         ('VMware Fusion', 'The macOS member of the same family, including Apple Silicon.'),
         ('Parallels Desktop', 'macOS only, paid, tuned for running Windows smoothly beside macOS.'),
     ]) + box('The trade you are making',
              'Slower than Type 1 and dependent on the host staying up &mdash; in exchange for installing in five '
              'minutes on a machine you still use for everything else. For a technician bench, that trade is correct.')),

    ('Oracle VirtualBox', 'up close',
     'The one most students will install first, and the one most likely to appear in a lab.',
     SVG_VBOX + kps([
         '<b>Cost.</b> Free under the GPL. The Extension Pack (USB 2/3, RDP, disk encryption) has separate licensing &mdash; free for personal use, not for commercial.',
         '<b>Guest Additions.</b> Drivers installed <i>inside</i> the guest. Without them: fixed resolution, no shared clipboard, no drag and drop. Installing them is the fix for "the screen will not resize".',
         '<b>Disk format.</b> VDI by default; also reads VMDK, VHD and HDD.',
         '<b>Snapshots.</b> Full tree, unlimited branches.',
     ]) + box('The one students trip on',
              'A brand-new VM boots to "FATAL: No bootable medium found". That is correct behaviour &mdash; it is an '
              'empty computer. You still have to attach an ISO to the virtual optical drive.')),

    ('VMware', 'up close',
     'Workstation Pro on Windows and Linux, Fusion on macOS. Same engine, same file formats.',
     SVG_VMWARE + kps([
         '<b>Cost.</b> Workstation Pro and Fusion Pro became free for personal use in 2024. Commercial use still requires a licence.',
         '<b>VMware Tools.</b> The equivalent of Guest Additions, and the same first fix for resolution, clipboard and time-sync complaints.',
         '<b>Disk format.</b> VMDK. Splittable into 2&nbsp;GB chunks for transport across filesystems that dislike very large files.',
         '<b>Why people pay attention to it.</b> A VM built here moves to ESXi and vSphere in production without conversion.',
     ]) + box('Choosing between them, honestly',
              'For learning, VirtualBox: free everywhere, runs on everything, enormous documentation. For work that '
              'ends up on VMware infrastructure, Workstation: the file formats and the habits transfer.')),

    ('VirtualBox vs VMware', 'side by side',
     'They do the same job. The differences are licensing, polish and where the VM goes next.',
     cards([
         ('Price', 'VirtualBox: free (Extension Pack restricted commercially). VMware Workstation/Fusion: free for personal use, licensed for commercial.'),
         ('Platforms', 'VirtualBox: Windows, macOS (Intel), Linux, Solaris. VMware: Workstation on Windows/Linux, Fusion on macOS including Apple Silicon.'),
         ('Performance', 'VMware is generally faster on 3D and heavy I/O. For a text-mode Linux guest, you will struggle to tell them apart.'),
         ('Guest tooling', 'Guest Additions vs VMware Tools. Same purpose, not interchangeable &mdash; install the one that matches the hypervisor.'),
         ('Disk format', 'VDI vs VMDK. Both read the other; VMDK travels better into enterprise VMware.'),
         ('Snapshots', 'VirtualBox: unlimited tree, free. VMware: unlimited tree, with a clearer manager UI.'),
     ])),

    ('What the hardware', 'has to provide',
     'Virtualization is a CPU feature. Without it you get either a refusal or unusable speed.',
     SVG_RAM + kps([
         '<b>CPU extensions.</b> Intel <b>VT-x</b> or AMD <b>AMD-V</b>. Almost always present since roughly 2010 &mdash; and frequently disabled in firmware.',
         '<b>64-bit CPU</b>, and enough <b>cores</b> that host and guests are not fighting over one.',
         '<b>RAM is the usual ceiling.</b> Guest RAM is taken from the host while the VM runs. 16&nbsp;GB is a comfortable two-VM bench; 8&nbsp;GB is one small guest.',
         '<b>Disk.</b> Budget the full installed size of every guest, plus snapshot growth. SSD strongly preferred &mdash; VMs are I/O-bound.',
         '<b>Nested virtualization</b> is a separate CPU feature, needed only when a VM must itself run VMs.',
     ]) + box('The error you will actually see',
              '"VT-x is not available (VERR_VMX_NO_VMX)" or "This host supports Intel VT-x, but it is disabled." '
              'Neither is a broken install. Both mean: reboot into UEFI/BIOS and turn it on.')),

    ('Turning it on', 'in UEFI/BIOS',
     'The single most common blocker between a student and their first VM.',
     SVG_BIOS + kps([
         'Reboot and enter firmware setup &mdash; usually <b>Del</b>, <b>F2</b>, <b>F10</b> or <b>F12</b> during POST.',
         'Find it under <i>Advanced</i>, <i>CPU Configuration</i>, or <i>Security</i>. Named <b>Intel Virtualization Technology</b>, <b>VT-x</b>, <b>SVM Mode</b> or <b>AMD-V</b>.',
         'Enable, save, exit. A full power cycle is sometimes required &mdash; a warm reboot may not apply it.',
         'On Windows, <b>Task Manager &#8594; Performance &#8594; CPU</b> reports "Virtualization: Enabled" once it takes.',
     ]) + box('The conflict worth knowing',
              'Hyper-V, WSL2, Windows Sandbox, Memory Integrity and Credential Guard all claim the virtualization '
              'extensions. When they hold them, VirtualBox and VMware run degraded or refuse. Modern versions '
              'cooperate, older ones do not &mdash; if a Type 2 hypervisor misbehaves on Windows, check what else '
              'is using the CPU extensions first.')),

    ('Anatomy of', 'a virtual machine',
     'Everything the guest believes is hardware, and what it really is on the host.',
     cards([
         ('vCPU', 'Scheduled time on real cores. Assigning more vCPUs than you have cores makes guests slower, not faster.'),
         ('vRAM', 'Reserved from host RAM while running. Over-allocate and the host swaps &mdash; everything crawls.'),
         ('Virtual disk', 'One file: .vdi, .vmdk, .vhdx. Dynamically allocated grows as used; fixed size is faster and pre-claims the space.'),
         ('Virtual NIC', 'Plugged into a virtual switch. Its behaviour is entirely decided by the network mode.'),
         ('Virtual optical drive', 'Where you attach the installer ISO. The reason a new VM will not boot.'),
         ('Config file', 'The .vbox or .vmx describing the machine. The VM is this file plus its disk &mdash; nothing else.'),
     ])),

    ('Virtual networking', '&mdash; four modes',
     'The setting that decides whether the guest can reach the internet, the host, or nothing at all.',
     SVG_NET + box('Pick by intent',
                   'Just needs updates: <b>NAT</b>. Must be reachable as a server: <b>Bridged</b>. Talking only to the '
                   'host: <b>Host-only</b>. Detonating something dangerous: <b>Internal</b> &mdash; and confirm it, '
                   'because "I thought it was isolated" is how a lab machine infects a network.')),

    ('Snapshots', 'and why they are not backups',
     'Freeze a machine\'s exact state, break it deliberately, and return.',
     SVG_SNAPSHOT + kps([
         '<b>What it stores.</b> Disk state, plus memory and CPU state if taken while running &mdash; so a resume can land mid-application.',
         '<b>What it is for.</b> The moment before a risky change: a patch, a driver, a registry edit, opening a suspicious file.',
         '<b>Why not a backup.</b> A snapshot lives on the same disk, inside the same VM, and depends on the original. Lose the disk and both are gone together.',
         '<b>The cost.</b> Every snapshot grows a delta file. A long chain silently consumes disk and slows the VM.',
     ])),

    ('What it is', 'actually used for',
     'The A+ objectives phrase these as use cases. They are also the reasons you will personally run one.',
     cards([
         ('Sandboxing', 'Open the suspicious attachment somewhere that can be deleted. The single most valuable habit in this chapter.'),
         ('Testing and development', 'Try the patch, the upgrade, the unfamiliar distribution &mdash; on a copy.'),
         ('Legacy application support', 'The application that only runs on Windows 7 keeps running, inside a VM, on a supported host.'),
         ('Cross-platform work', 'Run Linux on a Windows laptop, or Windows on a Mac, without dual-booting.'),
         ('Training and labs', 'A whole network of machines on one computer. Break them; rebuild in minutes.'),
         ('Server consolidation', 'Ten lightly-used physical servers become ten VMs on one well-used host.'),
     ])),

    ('Security', 'in both directions',
     'A VM is a strong boundary and a real attack surface. Both are true.',
     SVG_SEC + kps([
         '<b>Isolation is the feature.</b> Malware in a guest cannot ordinarily touch the host or other guests.',
         '<b>VM escape</b> is the exception &mdash; a hypervisor vulnerability that crosses the boundary. Rare, severe, and the reason hypervisors get patched.',
         '<b>Shared folders, shared clipboard and drag-and-drop are deliberate holes</b> in that boundary. Turn them off before analysing anything hostile.',
         '<b>Network mode is a security control.</b> Bridged puts a possibly-infected guest directly on the LAN.',
         '<b>VM sprawl.</b> Forgotten VMs stay unpatched and keep their credentials. An unpatched machine is not safer for being virtual.',
     ]) + box('The exam framing',
              'Analysing malware: Internal or Host-only networking, shared folders off, snapshot first, revert after.')),

    ('When it goes wrong', '&mdash; the usual four',
     'Nearly every first-VM problem is on this slide.',
     cards([
         ('Will not power on / VT-x error', 'Virtualization is disabled in UEFI/BIOS, or Hyper-V has claimed the extensions.'),
         ('No bootable medium', 'No ISO attached to the virtual optical drive. The VM is an empty computer.'),
         ('Host crawls when the VM runs', 'Over-allocated vRAM or vCPU. Give the guest less; the host needs its own.'),
         ('Screen will not resize, no clipboard', 'Guest Additions or VMware Tools not installed &mdash; in the guest, not the host.'),
     ]) + box('Order of attack',
              'Check the firmware, check the ISO, check the allocation, check the guest tools. In that order, that is '
              'most tickets closed.')),

    ('Chapter summary', 'and the exam answers',
     'What to carry out of here.',
     kps([
         'A <b>hypervisor</b> creates and isolates virtual machines by scheduling real hardware between them.',
         '<b>Type 1</b> runs on bare metal and is the operating system. <b>Type 2</b> runs as an application on a host OS.',
         '<b>VirtualBox</b> is free and cross-platform; <b>VMware Workstation/Fusion</b> is free for personal use and transfers into enterprise VMware.',
         '<b>VT-x / AMD-V must be enabled in firmware</b>, and RAM is usually the real limit.',
         '<b>Guest Additions / VMware Tools</b> are installed in the guest and fix resolution, clipboard and time.',
         '<b>Snapshots are restore points, not backups.</b>',
         '<b>NAT</b> out-only, <b>Bridged</b> a LAN peer, <b>Host-only</b> host-and-guest, <b>Internal</b> sealed.',
     ])),
]


def main():
    if not SOURCE.exists():
        die(f'{SOURCE} missing -- it supplies the approved Core 2 style and engine')
    src = SOURCE.read_text(encoding='utf-8', errors='replace')

    anchors = [m.start() for m in re.finditer(r'<!-- =+ SLIDE|<section class="slide"', src)]
    if not anchors:
        die('could not locate the first slide in the source deck')
    head = src[:anchors[0]]
    tail = src[src.rfind('</section>') + len('</section>'):]

    for needle in ('progress-bar', 'slide-counter', 'AccessGuard'):
        if needle not in head + tail:
            die(f'lifted shell is missing {needle}')

    total = len(SLIDES)
    head = head.replace('Malware &amp; Social Engineering | A+ Core 2', TITLE)
    tail = (tail.replace('const TOTAL = 21;', f'const TOTAL = {total};')
                .replace('>1 / 21<', f'>1 / {total}<')
                .replace('forge-core2-malware-pres', PROGRESS_ID))
    if f'const TOTAL = {total};' not in tail:
        die('TOTAL substitution failed -- the engine would navigate to the wrong slide count')
    if PROGRESS_ID not in tail:
        die('ModuleProgress id substitution failed')

    body = ''.join(slide(i + 1, total, *s) for i, s in enumerate(SLIDES))
    OUT_PRES.write_text(head + body + tail, encoding='utf-8')

    w = OUT_PRES.read_text(encoding='utf-8')
    got = len(re.findall(r'<section class="slide', w))
    if got != total:
        die(f'{got} slides on disk, expected {total}')
    if w.count('class="slide active"') != 1:
        die('not exactly one active slide')
    for t in ('section', 'div', 'svg'):
        o, c = len(re.findall(r'<' + t + r'[ >]', w)), w.count(f'</{t}>')
        if o != c:
            die(f'unbalanced <{t}>: {o} open, {c} close')
    print(f'presentation: {total} slides, tags balanced, {len(w)//1024} KB')
    print(f'  wrote {OUT_PRES.relative_to(REPO)}')

    OUT_HUB.parent.mkdir(parents=True, exist_ok=True)
    OUT_HUB.write_text(HUB.replace('{{TOTAL}}', str(total)), encoding='utf-8')
    print(f'  wrote {OUT_HUB.relative_to(REPO)}')
    return 0


HUB = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter 25: Virtualization &amp; Hypervisors | A+ Core 2</title>
    <script src="../../../../../../../components/AccessGuard.js"></script>
    <script>AccessGuard.require('sorted');</script>
    <style>
        :root { --accent: #0891b2; --accent-dark: #0e7490; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #fafaf9 0%, #ecfeff 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        .back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--accent); text-decoration: none; margin-bottom: 20px; }
        .back-link:hover { text-decoration: underline; }
        .header { background: linear-gradient(135deg, #164e63 0%, var(--accent) 100%); color: white; padding: 40px; border-radius: 16px; margin-bottom: 30px; }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .header .subtitle { opacity: 0.9; font-size: 1.1rem; }
        .domain-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; margin-top: 15px; font-size: 0.9rem; }
        .content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .card:hover { transform: translateY(-3px); }
        .card h2 { color: var(--accent-dark); margin-bottom: 10px; }
        .card p { color: #666; font-size: 0.9rem; margin-bottom: 15px; }
        .card-link { display: inline-block; background: var(--accent); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; }
        .card-link:hover { background: var(--accent-dark); }
        /* Not-yet-built pieces say so instead of linking to a 404. */
        .card.pending { opacity: .72; }
        .pending-tag { display: inline-block; background: #e2e8f0; color: #475569; padding: 10px 20px; border-radius: 8px; font-size: .9rem; }
        .objectives { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .objectives h2 { color: var(--accent-dark); margin-bottom: 15px; }
        .objectives ul { margin-left: 20px; color: #444; }
        .objectives li { margin-bottom: 8px; }
        .complete-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 30px; background: linear-gradient(135deg, #22c55e, #16a34a); border: none; border-radius: 8px; color: white; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .complete-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(34, 197, 94, 0.4); }
    </style>
    <script src="../../../../../../../components/ModuleProgress.js"></script>
</head>
<body>
    <div class="container">
        <a href="../../index.html" class="back-link">&larr; Back to Core 2</a>
        <div class="header">
            <h1>Chapter 25: Virtualization &amp; Hypervisors</h1>
            <p class="subtitle">Hypervisors, Type 1 vs Type 2, Oracle VirtualBox and VMware</p>
            <span class="domain-badge">Domain 1: Operating Systems (31%)</span>
        </div>
        <div class="content-grid">
            <div class="card">
                <h2><img src="/assets/images/icons/icon-books.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block"> Presentation</h2>
                <p>Hypervisor types, the hardware requirements, VM anatomy, networking modes, snapshots and the four faults you will actually meet.</p>
                <a href="../../presentations/forge-virtualization.presentation.html" class="card-link">View Presentation</a>
            </div>
            <div class="card pending">
                <h2><img src="/assets/images/icons/icon-microscope.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block"> Hands-On Lab</h2>
                <p>Build a virtual machine end to end: enable the CPU extensions, create the VM, attach the ISO, install guest tools, take a snapshot and revert.</p>
                <span class="pending-tag">Being designed &mdash; not yet available</span>
            </div>
            <div class="card pending">
                <h2><img src="/assets/images/icons/icon-notepad.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block"> Chapter Quiz</h2>
                <p>Test hypervisor types, requirements, networking modes and snapshot behaviour.</p>
                <span class="pending-tag">Being designed &mdash; not yet available</span>
            </div>
        </div>
        <div class="objectives">
            <h2>Learning Objectives</h2>
            <ul>
                <li>Explain what a hypervisor does: scheduling, memory mapping, device emulation and isolation</li>
                <li>Distinguish Type 1 (bare-metal) from Type 2 (hosted) and give examples of each</li>
                <li>Identify Oracle VirtualBox and VMware Workstation/Fusion, and choose between them for a given job</li>
                <li>State the hardware requirements: Intel VT-x / AMD-V, RAM, cores, disk</li>
                <li>Enable virtualization in UEFI/BIOS and recognise conflicts with Hyper-V, WSL2 and Credential Guard</li>
                <li>Describe VM components: vCPU, vRAM, virtual disk, virtual NIC, virtual optical drive</li>
                <li>Select the correct virtual network mode &mdash; NAT, Bridged, Host-only, Internal</li>
                <li>Explain snapshots, and why a snapshot is not a backup</li>
                <li>Apply virtualization security: isolation, VM escape, shared folders, VM sprawl</li>
                <li>Troubleshoot the four common failures: VT-x disabled, no bootable medium, over-allocation, missing guest tools</li>
            </ul>
        </div>
        <div style="text-align: center; padding: 30px;">
            <button class="complete-btn" onclick="markComplete()">Mark Complete</button>
        </div>
    </div>
    <script>
        function saveProgress() {
            try {
                const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
                if (!progress.forge) progress.forge = {};
                progress.forge['core2-ch25-index'] = {
                    completed: true,
                    completedAt: new Date().toISOString(),
                    score: 100
                };
                localStorage.setItem('hexworth_progress', JSON.stringify(progress));
            } catch (e) {
                console.warn('[Forge] Failed to save:', e);
            }
        }
        function markComplete() {
            if (typeof ModuleProgress !== 'undefined') ModuleProgress.complete('forge', 'forge-aplus-core2-ch25');
            saveProgress();
            const btn = document.querySelector('.complete-btn');
            if (btn) { btn.innerHTML = 'Completed'; btn.disabled = true; }
        }
    </script>
    <script src="/components/ObservatoryTelemetry.js"></script>
</body>
</html>
'''

if __name__ == '__main__':
    sys.exit(main())
