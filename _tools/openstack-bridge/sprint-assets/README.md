# OpenStack Cloud Security Sprint v2

This package is built for an instructor-authorized OpenStack classroom.

## Files
- `project1_index.html`: Nginx page for Project 1.
- `project2_cinder_guest_setup.sh`: optional guest helper for formatting and mounting a newly attached EMPTY Cinder volume.
- `project3_api.py`: Flask API for Project 3.
- `project4_honeypot.py`: dependency-free training honeypot. It intentionally does not log submitted passwords.
- `project4_generate_traffic.sh`: controlled suspicious-looking traffic generator for Project 4.

## OpenStack services intentionally reinforced
- Horizon: dashboard used to manage resources.
- Keystone: identity/project context behind access.
- Glance: image used to create the instance.
- Nova: compute instance.
- Neutron: the 'shared' tenant network your peers reach you on, plus security groups.
  NOTE: floating IPs on this cloud are 172.24.4.0/24 and are NOT reachable from another
  student's machine. Peer verification is instance-to-instance on 'shared'.
- Cinder: persistent block storage used in Project 2.

## Safety
Scanning and generated traffic must remain inside the instructor-approved lab scope. Do not expose the training honeypot to unapproved networks.

## Boot the `ubuntu-24.04-sprint` image, and do NOT try to install anything

Your instance has **no internet**. `apt install` cannot work and will only waste your time:
the `shared` network is an isolated segment with no route out, on purpose.

Everything the four projects need is already in the image: nginx, python3-flask, nmap, ping,
curl, and both the SSH client and server.

## Where these files are ON your instance

You do not have to upload them. The same files are baked into the image at:

    /opt/sprint-assets/

Copy the one you need into your own directory and work on your copy, for example:

    cp /opt/sprint-assets/project1_index.html ~/

Leave `/opt/sprint-assets/` untouched so you always have a clean original to fall back to.
