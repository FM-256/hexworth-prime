# Linux Practice Sandbox — a free-play, resettable Ubuntu shell for the Hexworth
# Observatory. Unlike the linux-mastery Workbench (scenario + grader framework),
# this is an open playground: a real Linux box a student can explore, break, and
# reset (relaunch = factory-fresh). Pattern source: linux-mastery / cell-sigma.
# RAM target: 512MB. Connect: ttyd on :7681.
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# A well-rounded toolset for practicing real Linux: shell + editors + docs, the
# classic text-processing and filesystem tools, process/network inspection, an
# archive suite, plus git / python3 / tmux / sqlite3 so learners can practice
# scripting, version control, and multiplexing without hitting "command not found".
RUN apt-get update && apt-get install -y --no-install-recommends \
    ttyd bash bash-completion sudo \
    vim nano less man-db manpages \
    coreutils findutils grep sed gawk diffutils \
    tree file jq bc \
    curl wget ca-certificates \
    procps psmisc htop iproute2 net-tools dnsutils iputils-ping \
    tar gzip zip unzip bzip2 xz-utils \
    cron openssh-client rsync \
    git python3 python3-venv tmux sqlite3 ncdu \
    && rm -rf /var/lib/apt/lists/*

# Student account: passwordless sudo. Students SHOULD be able to break things —
# a fresh relaunch is the safety net, and the container is disposable + bounded.
RUN userdel -r ubuntu 2>/dev/null || true; \
    useradd -m -s /bin/bash -u 1000 student && \
    echo 'student ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/student && \
    chmod 440 /etc/sudoers.d/student

# systemctl shim (cell-sigma pattern): no systemd in a container; the shim gives
# a real start/stop/status surface so learners can practice service commands.
COPY systemctl-shim /usr/local/bin/systemctl
RUN chmod 755 /usr/local/bin/systemctl

# hexpractice: a guided-but-open practice menu (categories of things to try, with
# real example commands). Turns a bare shell into a showcase practice environment
# without locking the learner into a graded scenario.
COPY hexpractice /usr/local/bin/hexpractice
RUN chmod 755 /usr/local/bin/hexpractice

# A starter home: a sandbox notes file + a small tree to explore/manipulate, so
# the first thing a learner sees is something to act on, not an empty prompt.
RUN mkdir -p /home/student/playground/logs /home/student/playground/data && \
    printf 'Welcome to your Linux practice sandbox.\nEverything here is yours to change. Break it, fix it, relaunch to reset.\n' > /home/student/playground/README.txt && \
    printf 'user,role\nada,admin\nlinus,kernel\ngrace,compiler\n' > /home/student/playground/data/users.csv && \
    printf '[INFO] service started\n[WARN] disk at 80%%\n[ERROR] connection refused\n[INFO] service stopped\n' > /home/student/playground/logs/app.log

# Friendly landing: banner + first commands to try, shown on every new shell.
RUN printf '\n\033[1;36mHEXWORTH LINUX PRACTICE SANDBOX\033[0m\nA real, disposable Ubuntu box. Explore freely: \033[1msudo\033[0m works, nothing here is precious.\nType \033[1mhexpractice\033[0m for things to try, or \033[1mcd ~/playground\033[0m to poke around.\nWant a badge? \033[1mhexpractice challenge\033[0m has 5 graded tasks to earn Linux Practitioner.\nBroke something for good? Just relaunch the sandbox for a fresh box.\n\n' > /etc/motd && \
    echo 'cat /etc/motd' >> /home/student/.bashrc && \
    chown -R student:student /home/student

# ping: strip the file-capability xattr so exec works under the lab-manager's
# restricted capability bounding set (CapDrop ALL). Unprivileged ICMP still
# works via net.ipv4.ping_group_range (datagram sockets), so ping needs no
# capability at all. (Mission 18 line-check; verified 2026-07-09.)
RUN setcap -r /usr/bin/ping 2>/dev/null || true

USER student
WORKDIR /home/student
CMD ["ttyd", "-p", "7681", "-W", "bash", "-l"]
