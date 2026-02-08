## Mandatory access control


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, configure and implement endpoint security controls.

### External Resources:

Mandatory access control

 What are Mandatory Access Controls? -

 Mandatory Access Control (MAC) - based on the idea of security clearance levels
 for Subjects & Objects

 SELinux - Execution control is the process of determining what additional
 software or scripts may be installed or run on a host beyond its baseline

    • In Linux, execution control is normally enforced by using a mandatory
    access control (MAC) kernel module or Linux Security Module (LSM)

    • SELinux, Ubuntu AppArmor & SUSE Linux

 SEAndroid - uses mandatory access control (MAC) policies to run apps in sandboxes

    • Android is susceptible to attacks that are not visible to the kernel, such
    as inter-app communication attacks; MAC controls that operate in middleware,
    or in between the kernel & applications are used to prevent this & are
    referred to as middleware MAC (MMAC)
