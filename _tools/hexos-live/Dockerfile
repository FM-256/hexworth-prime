# Build environment for Hex Live. Nothing is installed on the host: bc2 runs a live cloudflared
# tunnel and should not acquire a permanent toolchain to produce a one-off artefact.
#
# THE BASE MATCHES THE TARGET, and that is not cosmetic. Running Ubuntu's live-build against a
# Debian target produced "The repository 'http://security.debian.org trixie/updates Release' does
# not have a Release file": Debian renamed that suite to trixie-security, and the older live-build
# still emits the pre-bookworm form. A build tool that does not know its target's archive layout
# will keep finding new ways to be wrong, so the toolchain is pinned to the distribution it builds.
FROM debian:trixie

ENV DEBIAN_FRONTEND=noninteractive

# live-build drives the respin; debootstrap fetches the base; xorriso and squashfs-tools make the
# ISO bootable. Pinned to the LTS repos so a rebuild six months from now resolves the same way.
RUN apt-get update && apt-get install -y --no-install-recommends \
        live-build debootstrap xorriso squashfs-tools \
        ca-certificates curl file rsync \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY build.sh /usr/local/bin/build-hexlive
RUN chmod +x /usr/local/bin/build-hexlive
ENTRYPOINT ["/usr/local/bin/build-hexlive"]
