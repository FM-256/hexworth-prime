#!/bin/bash
# COLD walkthrough of the Cloud Security Sprint: run the packet's LITERAL commands on a fresh
# instance and see what the student sees. Run on bc2.
#
# WHY THIS EXISTS, AND WHY THE PREVIOUS TEST DID NOT CATCH THE BUG IT WAS BUILT TO CATCH
#   The 2026-08-23 end-to-end harness (/tmp/ud-server.sh) declared all four missions passing while
#   the student flow was broken. It wrote its OWN Flask app and its OWN honeypot into /opt as
#   heredocs inside the user-data, then tested those. The packet tells the student to run
#   project3_api.py and project4_honeypot.py -- files that did not exist anywhere on the instance,
#   on a cloud with no egress and no route for scp. Every mission's first command would have been
#   "No such file or directory" in a live class.
#
#   The harness passed because it handed itself the very thing the student is not given. That is
#   the cold-open rule: a probe that supplies its own inputs is measuring the probe.
#
# THE RULE THIS SCRIPT OBEYS
#   The user-data below may contain ONLY commands that appear in the student packet, plus echo
#   markers. It must NEVER create, download, or inline the content of a lab asset. Every asset
#   must come from /opt/sprint-assets, baked by build-sprint-image.sh. If you find yourself adding
#   a heredoc that writes a project file, STOP -- you are rebuilding the bug.
#
# @catalog what    cold-run the sprint packet's literal commands on fresh instances; no asset injection
# @catalog run     bash _tools/openstack-bridge/sprint-student-walkthrough.sh [--image NAME]
# @catalog status  TOOL
set -uo pipefail

IMAGE=${SPRINT_IMAGE:-ubuntu-24.04-sprint}
FLAVOR=${SPRINT_FLAVOR:-ds512M}
SRV_SLOT=${SRV_SLOT:-student-49}
PEER_SLOT=${PEER_SLOT:-student-48}
KEY=${STAGE1_KEY:-$HOME/openstack-stage1/stage1_key}
VMADDR=${STAGE1_VM:-192.168.122.62}
POOL=${POOL_CREDS:-$HOME/openstack-stage1/pool-credentials.env}
SRV_NAME=${SRV_NAME:-sprint-check-server}
PEER_NAME=${PEER_NAME:-sprint-check-peer}
PEER_PORT=${PEER_PORT:-sprint-check-peer-port}
# Throwaway password for the Mission 2 SFTP check, generated per run and never written to the
# repo. It stands in for what the student types at 'sudo passwd ubuntu'. The instances holding it
# are deleted at the start of the next run.
M2PW=${M2PW:-$(openssl rand -base64 12 | tr -d '/+=')}

while [ $# -gt 0 ]; do
  case "$1" in
    --image) IMAGE="$2"; shift 2;;
    *) echo "unknown arg $1"; exit 2;;
  esac
done

[ -r "$POOL" ] || { echo "✗ cannot read $POOL -- run this on bc2"; exit 2; }
pw() { grep "^${1}=" "$POOL" | cut -d= -f2-; }

# Run an openstack command on the DevStack VM as a given student slot.
osrun() {  # osrun <slot> <command...>
  local slot="$1"; shift
  ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$VMADDR" \
    "export OS_AUTH_URL=http://${VMADDR}/identity OS_IDENTITY_API_VERSION=3 \
     OS_USERNAME='$slot' OS_PASSWORD='$(pw "$slot")' OS_PROJECT_NAME='$slot' \
     OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"
}

echo "=== cold sprint walkthrough: image=$IMAGE server=$SRV_SLOT peer=$PEER_SLOT ==="

# ── teardown FIRST, because "cold" is the whole claim ────────────────────────
# Reusing a surviving instance would silently test yesterday's image and report a pass for a
# build that was never booted. These are throwaway artifacts this harness created, under names
# it owns -- but they are still inventoried to a log before removal, per the archive rule.
INVENTORY=${INVENTORY:-$HOME/sprint-walkthrough-inventory.log}
echo "--- teardown of any previous run (inventoried to $INVENTORY) ---"
{ echo "=== teardown $(date -u +%FT%TZ) image=$IMAGE ==="; } >> "$INVENTORY"
for pair in "$SRV_SLOT:$SRV_NAME" "$PEER_SLOT:$PEER_NAME"; do
  slot="${pair%%:*}"; name="${pair##*:}"
  if osrun "$slot" "openstack server show $name -f value -c id" >/dev/null 2>&1; then
    osrun "$slot" "openstack server show $name -f value -c id -c status -c image" 2>/dev/null >> "$INVENTORY"
    osrun "$slot" "openstack server remove volume $name cloud-drop" >/dev/null 2>&1
    osrun "$slot" "openstack server delete --wait $name" >/dev/null 2>&1 \
      && echo "    deleted prior $name in $slot (logged)" || echo "    could not delete $name"
  else
    echo "    no prior $name in $slot"
  fi
done

# Remove the security-group rules and the reserved port from the LAST run. Without this the
# pool's default security group accumulates ingress rules run after run, on live roster slots,
# and every rule outlives the test that needed it. Only IDs this harness recorded are touched --
# nothing pre-existing is guessed at or removed.
RULEFILE=${RULEFILE:-$HOME/.sprint-walkthrough-rules}
if [ -s "$RULEFILE" ]; then
  n=0
  while read -r slot rid; do
    [ -z "${rid:-}" ] && continue
    osrun "$slot" "openstack security group rule delete $rid" >/dev/null 2>&1 && n=$((n+1))
  done < "$RULEFILE"
  { echo "=== rules removed $(date -u +%FT%TZ): $n ==="; cat "$RULEFILE"; } >> "$INVENTORY"
  : > "$RULEFILE"
  echo "    removed $n security-group rule(s) left by the previous run"
else
  echo "    no recorded security-group rules to clean"
fi
osrun "$PEER_SLOT" "openstack port delete $PEER_PORT" >/dev/null 2>&1 \
  && echo "    removed the previous reserved peer port"

# ── the SERVER's user-data: the packet's literal commands, nothing else ──────
# Note what is NOT here: no app source, no honeypot source, no html. Only /opt/sprint-assets.
cat >/tmp/sw-server.sh <<'UD'
#!/bin/bash
# Output MUST go to /dev/console: openstack console log show is the only channel out of an
# instance we hold no key to. The first run of this harness teed to a FILE instead, so every
# SRV:/PEER: line was written perfectly into a log nobody could read, and the run looked silent.
exec > >(tee -a /var/log/sprint-check.log > /dev/console) 2>&1
echo "SRV: ===== cold run: the packet's commands, verbatim ====="
echo "SRV: whoami=$(whoami)"

echo "SRV: --- do the assets even exist? (the whole point) ---"
ls /opt/sprint-assets/ 2>&1 | tr '\n' ' ' | sed 's/^/SRV: assets: /'; echo

echo "SRV: --- MISSION 1 ---"
# packet: sudo systemctl enable --now nginx
sudo systemctl enable --now nginx 2>&1 | sed 's/^/SRV: M1 /'
sleep 2
# packet: sudo cp project1_index.html /var/www/html/index.html   (from the asset dir)
cd /home/ubuntu
cp /opt/sprint-assets/project1_index.html . 2>&1 | sed 's/^/SRV: M1 cp: /'
sudo cp project1_index.html /var/www/html/index.html 2>&1 | sed 's/^/SRV: M1 cp2: /'
# packet: curl http://127.0.0.1
echo "SRV: M1 nginx=$(systemctl is-active nginx)"
echo "SRV: M1 curl=$(curl -s --max-time 5 http://127.0.0.1 | tr -d '\n' | cut -c1-70)"

echo "SRV: --- MISSION 3 ---"
# packet: python3 -c "import flask; print('flask is installed')"
# NOT flask.__version__: that prints a DeprecationWarning which reads like an error to a student,
# which is why the packet no longer uses it -- and this harness must run what the packet says.
echo "SRV: M3 flaskcheck=$(python3 -c "import flask; print('flask is installed')" 2>&1)"
# packet: mkdir -p ~/cloud-api && cd ~/cloud-api
mkdir -p /home/ubuntu/cloud-api && cd /home/ubuntu/cloud-api
# packet: cp /opt/sprint-assets/project3_api.py app.py
cp /opt/sprint-assets/project3_api.py app.py 2>&1 | sed 's/^/SRV: M3 cp: /'
# packet: python3 app.py   (backgrounded here only because user-data cannot hold a terminal;
# a transient unit is used because a nohup child dies with the cloud-init script)
systemd-run --unit=sprint-m3 --collect --working-directory=/home/ubuntu/cloud-api \
  python3 /home/ubuntu/cloud-api/app.py >/dev/null 2>&1
sleep 6
echo "SRV: M3 unit=$(systemctl is-active sprint-m3)"
# packet: curl http://127.0.0.1:5000/health
echo "SRV: M3 health=$(curl -s --max-time 5 http://127.0.0.1:5000/health | tr -d '\n')"
[ "$(systemctl is-active sprint-m3)" = active ] || systemctl status sprint-m3 --no-pager -l 2>&1 | tail -12 | sed 's/^/SRV: M3 ERR /'

echo "SRV: --- MISSION 4 ---"
cd /home/ubuntu
# packet: python3 project4_honeypot.py
cp /opt/sprint-assets/project4_honeypot.py . 2>&1 | sed 's/^/SRV: M4 cp: /'
systemd-run --unit=sprint-m4 --collect --working-directory=/home/ubuntu \
  python3 /home/ubuntu/project4_honeypot.py >/dev/null 2>&1
sleep 5
echo "SRV: M4 unit=$(systemctl is-active sprint-m4)"
echo "SRV: M4 listening=$(ss -lnt | grep -c ':8080')"
[ "$(systemctl is-active sprint-m4)" = active ] || systemctl status sprint-m4 --no-pager -l 2>&1 | tail -12 | sed 's/^/SRV: M4 ERR /'

# The honeypot log is the artifact the student inspects, but it only fills once the PEER sends
# traffic -- which happens after this script has exited. Dump it to the console on a timer so the
# evidence is readable without giving the harness an SSH key into the instance.
systemd-run --on-active=300 --unit=sprint-m4dump --collect \
  bash -c 'echo "SRV4: --- honeypot.log ---" > /dev/console
           sed "s/^/SRV4: /" /home/ubuntu/honeypot.log > /dev/console 2>&1
           echo "SRV4: GETs=$(grep -c GET /home/ubuntu/honeypot.log)" > /dev/console
           echo "SRV4: LOGIN_ATTEMPTS=$(grep -c LOGIN_ATTEMPT /home/ubuntu/honeypot.log)" > /dev/console
           echo "SRV4: usernames=$(grep -oP "username=\"\K[^\"]+" /home/ubuntu/honeypot.log | sort -u | tr "\n" " ")" > /dev/console
           echo "SRV4: password_leaked_MUST_BE_0=$(grep -c TRAINING_ONLY /home/ubuntu/honeypot.log)" > /dev/console
           echo "SRV4: --- M2: did the partner SFTP land? ---" > /dev/console
           echo "SRV4: M2 uploaded=$(ls /home/ubuntu/upload.txt 2>/dev/null || echo NONE)" > /dev/console
           echo "SRV4: M2 on_volume=$(ls /srv/clouddrop 2>/dev/null | tr "\n" " ")" > /dev/console' \
  >/dev/null 2>&1

echo "SRV: --- MISSION 2 target side ---"
echo "SRV: M2 sshd=$(systemctl is-active ssh)"
# The packet says "use SFTP from an approved peer" but never said how the peer AUTHENTICATES.
# Report what sshd will actually accept, rather than assume it.
echo "SRV: M2 pwauth_effective=$(sudo sshd -T 2>/dev/null | awk '/^passwordauthentication/{print $2}')"
# packet: sudo passwd ubuntu -- so the partner has something to log in WITH.
echo "ubuntu:__M2PW__" | sudo chpasswd && echo "SRV: M2 password set for ubuntu"

# The volume is attached by the student AFTER the instance is up, so the disk can appear well
# after this script starts. Wait for it instead of racing it into a false "no second disk".
for i in $(seq 1 40); do lsblk -dno NAME | grep -q '^vdb$' && break; sleep 3; done
echo "SRV: M2 disks=$(lsblk -dno NAME,SIZE | tr '\n' ' ')"
if lsblk -dno NAME | grep -q '^vdb$'; then
  # packet: sudo mkfs.ext4 /dev/vdb ; mkdir ; mount ; echo ... | sudo tee proof.txt
  sudo mkfs.ext4 -q -F /dev/vdb 2>&1 | sed 's/^/SRV: M2 mkfs: /'
  sudo mkdir -p /srv/clouddrop
  sudo mount /dev/vdb /srv/clouddrop 2>&1 | sed 's/^/SRV: M2 mount: /'
  echo "Cinder survived" | sudo tee /srv/clouddrop/proof.txt >/dev/null
  sudo chown ubuntu:ubuntu /srv/clouddrop
  echo "SRV: M2 mounted=$(findmnt -no TARGET /dev/vdb)"
  echo "SRV: M2 proof=$(cat /srv/clouddrop/proof.txt)"
else
  echo "SRV: M2 ✗ no vdb appeared -- volume never attached"
fi
echo "SRV: ===== READY ====="
UD

echo "--- booting SERVER in $SRV_SLOT ---"
# The server heredoc stays QUOTED so its $(...) run on the instance, not here -- which means the
# one value that must come from this host has to be substituted in afterwards. Without this the
# account password is the literal string __M2PW__, the peer's SFTP fails, and the harness reports
# a Mission 2 defect it caused itself.
# -u does not fire on a set-but-EMPTY variable, so an openssl that produced nothing would sail
# through, set a blank password, and fail Mission 2 in a way that looks like a product defect.
[ -n "$M2PW" ] || { echo "✗ M2PW is empty -- refusing to set a blank password"; exit 1; }
sed -i "s|__M2PW__|$M2PW|" /tmp/sw-server.sh
grep -q '__M2PW__' /tmp/sw-server.sh && { echo "✗ password placeholder still present"; exit 1; }
scp -q -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no /tmp/sw-server.sh "stack@$VMADDR:/tmp/sw-server.sh"
osrun "$SRV_SLOT" "openstack server show $SRV_NAME >/dev/null 2>&1 || openstack server create $SRV_NAME \
  --image $IMAGE --flavor $FLAVOR --network shared --user-data /tmp/sw-server.sh -f value -c id >/dev/null"

for i in $(seq 1 40); do
  S=$(osrun "$SRV_SLOT" "openstack server show $SRV_NAME -f value -c status" 2>/dev/null | tr -d '\r')
  { [ "$S" = ACTIVE ] || [ "$S" = ERROR ]; } && break
  sleep 6
done
SRV_IP=$(osrun "$SRV_SLOT" "openstack server show $SRV_NAME -f value -c addresses" 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
echo "  server status=$S"

# The security-group rules the packet has the student create -- scoped to the PARTNER'S /32,
# which is what the packet and runbook now require. This harness previously opened the whole
# 192.168.233.0/24. That was not what students are told to build, so the tight rule was never
# actually tested; and because the image enables SSH password auth for Mission 2, a subnet-wide
# TCP/22 rule would let any student reach any other student's sudo account.
# The peer's IP has to be known BEFORE the rules are written, and the peer instance cannot exist
# yet because its user-data needs the server's IP. Reserving a PORT first breaks that circle:
# Neutron assigns the address now, the rules are scoped to it, and the peer boots onto that same
# port later.
#
# The previous version looked up the peer instance here -- ~90 lines before it was created, and
# right after teardown had deleted any prior one. So the lookup ALWAYS returned empty and the
# "first pass only" fallback opened 22/80/5000/8080 to the entire 192.168.233.0/24 on the pool's
# default security group, on every single run, and never narrowed it. These are live roster
# slots, so a student handed one inherited an instance pre-exposed on exactly the ports Mission 2
# teaches them to restrict -- with password auth enabled. There is no fallback now: no port
# means no rules and a hard exit, because a silently widened rule is worse than a failed test.
osrun "$PEER_SLOT" "openstack port show $PEER_PORT -f value -c id" >/dev/null 2>&1 \
  || osrun "$PEER_SLOT" "openstack port create --network shared $PEER_PORT -f value -c id" >/dev/null 2>&1
PEER_IP=$(osrun "$PEER_SLOT" "openstack port show $PEER_PORT -f value -c fixed_ips" 2>/dev/null \
          | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
[ -n "$PEER_IP" ] || { echo "✗ could not reserve a port for the peer -- refusing to open subnet-wide rules"; exit 1; }
SCOPE="$PEER_IP/32"
echo "    peer address reserved; rules will be scoped to a single /32"

# Every rule this harness creates is recorded so teardown can remove exactly those and nothing
# else. Leaving them behind is what polluted the pool's default security group.
RULEFILE=${RULEFILE:-$HOME/.sprint-walkthrough-rules}
for p in 22 80 5000 8080; do
  rid=$(osrun "$SRV_SLOT" "openstack security group rule create --ingress --protocol tcp --dst-port $p \
    --remote-ip $SCOPE default -f value -c id" 2>/dev/null | tr -d '\r' | tail -1)
  if [ -n "$rid" ]; then
    echo "$SRV_SLOT $rid" >> "$RULEFILE"
    echo "    opened tcp/$p from the peer /32 (recorded for cleanup)"
  else
    echo "    tcp/$p already open"
  fi
done

# Mission 2 infrastructure: the volume the student attaches.
osrun "$SRV_SLOT" "openstack volume show cloud-drop >/dev/null 2>&1 || openstack volume create --size 1 cloud-drop -f value -c id" >/dev/null 2>&1
for i in $(seq 1 20); do
  VS=$(osrun "$SRV_SLOT" "openstack volume show cloud-drop -f value -c status" 2>/dev/null | tr -d '\r')
  [ "$VS" = available ] && break; sleep 3
done
osrun "$SRV_SLOT" "openstack server add volume $SRV_NAME cloud-drop" >/dev/null 2>&1
sleep 8
echo "    volume after attach: $(osrun "$SRV_SLOT" "openstack volume show cloud-drop -f value -c status" 2>/dev/null | tr -d '\r')"

echo "--- waiting for the server's cold run to finish ---"
for i in $(seq 1 40); do
  L=$(osrun "$SRV_SLOT" "openstack console log show $SRV_NAME" 2>/dev/null)
  echo "$L" | grep -q 'SRV: ===== READY' && break
  sleep 10
done
echo "$L" | grep -E '^SRV:' | sed 's/^/  /'

# ── the PEER: cross-project verification, again only packet commands ────────
cat >/tmp/sw-peer.sh <<UD
#!/bin/bash
# Output MUST go to /dev/console: openstack console log show is the only channel out of an
# instance we hold no key to. The first run of this harness teed to a FILE instead, so every
# SRV:/PEER: line was written perfectly into a log nobody could read, and the run looked silent.
exec > >(tee -a /var/log/sprint-check.log > /dev/console) 2>&1
T=$SRV_IP
echo "PEER: ===== cross-project verification ====="
echo "PEER: --- M1: load the peer's page, and scan it ---"
echo "PEER: M1 page=\$(curl -s --max-time 6 http://\$T | tr -d '\n' | cut -c1-70)"
echo "PEER: M1 nmap=\$(nmap -Pn -p 22,80 \$T | grep -c open)"
echo "PEER: --- M3: consume the API from another project ---"
echo "PEER: M3 health=\$(curl -s --max-time 6 http://\$T:5000/health | tr -d '\n')"
echo "PEER: --- M4: run the SHIPPED traffic generator against the honeypot ---"
cp /opt/sprint-assets/project4_generate_traffic.sh . 2>&1 | sed 's/^/PEER: M4 cp: /'
chmod +x project4_generate_traffic.sh
./project4_generate_traffic.sh http://\$T:8080 >/tmp/gen.out 2>&1
echo "PEER: M4 generator_exit=\$?"
tail -3 /tmp/gen.out | sed 's/^/PEER: M4 gen: /'

echo "PEER: --- M2: SFTP a file to the partner's instance ---"
# packet: sftp ubuntu@<PARTNER_IP>, then 'put <file>', then 'bye'.
# A pty driver types the password at the prompt. This is a stand-in for the student's KEYBOARD --
# it supplies no lab asset, which is the line this harness must not cross.
echo "uploaded by the partner" > upload.txt
cat >/tmp/sftp_type.py <<'PYEOF'
import os, pty, sys, time, select
pw, host = sys.argv[1], sys.argv[2]
pid, fd = pty.fork()
if pid == 0:
    os.execvp("sftp", ["sftp", "-o", "StrictHostKeyChecking=no",
                       "-o", "UserKnownHostsFile=/dev/null", "ubuntu@" + host])
buf = b""; sent_pw = sent_cmd = False; end = time.time() + 90
while time.time() < end:
    r, _, _ = select.select([fd], [], [], 2)
    if not r: continue
    try: d = os.read(fd, 4096)
    except OSError: break
    if not d: break
    buf += d; s = buf.decode("utf-8", "replace")
    if not sent_pw and "assword" in s:
        os.write(fd, (pw + "\n").encode()); sent_pw = True
    elif sent_pw and not sent_cmd and "sftp>" in s:
        os.write(fd, b"put upload.txt\nbye\n"); sent_cmd = True
    elif sent_cmd and ("Uploading" in s or "not found" in s) and s.rstrip().endswith("$"):
        break
out = buf.decode("utf-8", "replace")
print("PWPROMPT=" + str(sent_pw), "UPLOADED=" + str("Uploading" in out or "100%" in out))
print(out[-400:])
PYEOF
python3 /tmp/sftp_type.py '$M2PW' \$T 2>&1 | sed 's/^/PEER: M2 /'
echo "PEER: ===== DONE ====="
UD

echo "--- booting PEER in $PEER_SLOT ---"
scp -q -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no /tmp/sw-peer.sh "stack@$VMADDR:/tmp/sw-peer.sh"
osrun "$PEER_SLOT" "openstack server show $PEER_NAME >/dev/null 2>&1 || openstack server create $PEER_NAME \
  --image $IMAGE --flavor $FLAVOR --port $PEER_PORT --user-data /tmp/sw-peer.sh -f value -c id >/dev/null"
for i in $(seq 1 40); do
  PS=$(osrun "$PEER_SLOT" "openstack server show $PEER_NAME -f value -c status" 2>/dev/null | tr -d '\r')
  { [ "$PS" = ACTIVE ] || [ "$PS" = ERROR ]; } && break
  sleep 6
done
echo "  peer status=$PS"
for i in $(seq 1 40); do
  PL=$(osrun "$PEER_SLOT" "openstack console log show $PEER_NAME" 2>/dev/null)
  echo "$PL" | grep -q 'PEER: ===== DONE' && break
  sleep 10
done
echo "$PL" | grep -E '^PEER:' | sed 's/^/  /'

echo "--- M4 evidence ON the honeypot (the log the student inspects) ---"
for i in $(seq 1 30); do
  L2=$(osrun "$SRV_SLOT" "openstack console log show $SRV_NAME" 2>/dev/null)
  echo "$L2" | grep -q 'SRV4: password_leaked' && break
  sleep 15
done
echo "$L2" | grep -E '^SRV4:' | sed 's/^/  /'
echo "=== walkthrough complete ==="
