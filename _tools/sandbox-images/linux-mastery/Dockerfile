# Linux Mastery Workbench — real-terminal lab box for the script-house
# Linux Mastery path (53 modules). Resettable (lab reset / relaunch),
# adjustable (scenario levels). Pattern source: cell-sigma.
# RAM target: 256MB. Connect: ttyd on :7681.
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Core toolset a beginner meets across the course + the lab framework deps.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ttyd bash bash-completion sudo \
    vim nano less man-db manpages \
    coreutils findutils grep sed gawk diffutils \
    tree file jq curl ca-certificates wget \
    procps psmisc iproute2 net-tools dnsutils \
    tar gzip zip unzip bzip2 xz-utils \
    cron openssh-client rsync \
    && rm -rf /var/lib/apt/lists/*

# Student account: passwordless sudo — students SHOULD be able to break
# things; `lab reset` / relaunch is the safety net.
RUN userdel -r ubuntu 2>/dev/null || true; \
    useradd -m -s /bin/bash -u 1000 student && \
    echo 'student ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/student && \
    chmod 440 /etc/sudoers.d/student

# systemctl shim (cell-sigma pattern): no systemd in a container; the shim
# gives service-flavored scenarios a real start/stop/status surface.
COPY systemctl-shim /usr/local/bin/systemctl
RUN chmod 755 /usr/local/bin/systemctl

# Scenario framework.
COPY hexlab /opt/hexlab
RUN chmod 755 /opt/hexlab/bin/lab && \
    find /opt/hexlab/scenarios -name '*.sh' -exec chmod 755 {} \; && \
    mkdir -p /opt/hexlab/state && chown -R student:student /opt/hexlab/state && \
    ln -s /opt/hexlab/bin/lab /usr/local/bin/lab

# Friendly landing: what to type first.
RUN printf '\n\033[1;32mHEXWORTH LINUX MASTERY WORKBENCH\033[0m\nType \033[1mlab list\033[0m to see available labs, \033[1mlab start <id>\033[0m to begin.\nBroke something? \033[1mlab reset\033[0m restores the current lab. \n\n' > /etc/motd && \
    echo 'cat /etc/motd' >> /home/student/.bashrc && \
    printf '\n# lab wrapper: after start/reset the workspace is rebuilt, so return\n# the interactive shell to a valid directory (avoids stale-cwd getcwd errors).\nlab() {\n  command lab "$@"; local rc=$?\n  case "$1" in start|reset) cd "$HOME/lab" 2>/dev/null || cd "$HOME";; esac\n  return $rc\n}\n' >> /home/student/.bashrc

USER student
WORKDIR /home/student
CMD ["ttyd", "-p", "7681", "-W", "bash", "-l"]
