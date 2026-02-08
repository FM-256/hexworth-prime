- Filename: intro-to-iot-pentesting-2-10-1-qemu.md
- Show Name: Intro to IoT Pentesting
- Topic Name: Tools
- Episode Name: QEMU

================================================================================


QEMU
--------------------------------------------------------------------------------

Objectives:
--------------------------------------------------------------------------------
+ Become familiar with the function and use-case of QEMU in the context of IoT
  Penetration Testing.
--------------------------------------------------------------------------------


+ What is QEMU?
  - https://qemu.org

+ QEMU does a lot, but what exactly are we going to use it for?
  - Testing firmware binaries

+ Where do we begin?  
  - Running QEMU can be a bit tricky.
    + You need to know if you're working with BIG or LITTLE ENDIAN.
      - `file busybox`
        + MSB Executable is BIG
        + LSB Executable is LITTLE
          - qemu-mips for BIG
          - qemu-mipsel for LITTLE

+ What's next?
  - Emulate the binary
	  + `$ qemu-mips -L ./path/to/desired-binary/ ./path/to/desired-binary/binary`
      - EXAMPLES:
        + `$ qemu-mips -L ./sqaushfs-root/bin/ ./squashfs-root/bin/busybox ./squashfs-root/bin/sh`
        + `$ qemu-mips -L ./squashfs-root/bin/ ./squashfs-root/usr/sbin/telnetd -p9999 -l ./squashfs-root/bin/sh`
	      + `$ telnet 127.0.0.1 9999`
