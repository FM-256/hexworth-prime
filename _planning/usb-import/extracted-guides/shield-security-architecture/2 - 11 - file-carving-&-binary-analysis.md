## File Carving & Binary Analysis


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, use forensic analysis tools.

### External Resources:

File Carving & Binary Analysis

 What do you need to know about File Carving tools? -

 foremost - Linux-based forensic data recovery utility used to extract deleted
 or corrupted data from a disk partition

    • command-line based
    • able to recover data that has no underlying file system

 strings - extract text strings used within a binary file that would otherwise
 be difficult to identify using manual methods

    • can reveal important attributes regarding the internal structure of the
    program, including code comments, variable names, libraries, & other
    pertinent information
    • can also be used to collect information from memory
    • in Linux issuing the command sudo strings /dev/mem will show string values
    currently present in system memory


 What do you need to know about Binary Analysis tools? -

 hexdump - extract data from binary files & display contents in hexadecimal,
 decimal, octal, or ASCII formats

    • used as part of data recovery &/or reverse engineering processes
    • issuing the command hexdump --canonical against a file of interest can
    reveal the file's MIME type, date of creation, date of access, & other
    pertinent information


 Ghidra - written in Java & shares many of the same features & functionality
 found in the IDA Pro tool; intended for reverse engineering tasks & is most
 closely associated with reverse engineering malware

      https://ghidra-sre.org/


 GNU Project debugger (GDB) - used to identify what is occurring within an
 application while it is running

     • can analyze programs written in several languages, including C/C++,
     Objective-C, Fortran, & Assembly
     • used to analyze how code runs, at a low level, as well as identify shared
     libraries loaded by the program, including the address space that was used
     to load them
     • used to step-through the flow of an application by using breakpoints &
     watchpoints to pause operation


 OllyDbg - debugger, like GDB, but focused on Microsoft Windows & includes a
 graphical user interface

    • can reveal information regarding the internal structures & operation of an
    application without having access to its source code


 strace - used to identify interactions between processes & the Linux kernel

    • interactions can be monitored &/or modified in order to deconstruct how an
    application operates when its source code is not available


 readelf –

   • compiled source code produces an object file that is used to run the program
   defined by the code
   • object file is read & executed by the computer by following structures within
   the object file
   • structures within the object file include ELF, Executable & Linkable Format
   • readelf can identify important information about the file & how it was
   constructed & is useful for reverse engineering tasks


 objdump - Similar to readelf; used to analyze object files & includes a
 disassembler to reveal the assembler commands used by the program


 ldd - used to display a program's dependencies

    • issuing the command sudo ldd /sbin/poweroff displays all of the shared
    libraries required by the Linux poweroff command


 file - displays the type of a file by inspecting its content

    • files include "magic bytes" which can accurately identify the type of a file
    • file will compare the magic bytes of a file to a list of known magic bytes
    to determine its type
    • If the magic bytes do not clearly identify the type, file will examine the
    file to determine if it is a text file & identify if it represents a particular
    encoding format or programming language


 What do you need to know about Inspecting Firmware Images? -

 binwalk - used to inspect binary firmware images to better understand the
 components contained within it & characteristics of its composition for reverse
 engineering

    • common use is to determine if a file is compressed, obfuscated, or
    encrypted by evaluating the amount of entropy contained within it
    • command binwalk -E provides an output graph summarizing the entropy level
    of a file
    • High, flat graphs indicate that compression, obfuscation, &/or encryption
    are in place
    • Zagged graphs indicate that compression, obfuscation, &/or encryption do
    not appear to be present in the file
