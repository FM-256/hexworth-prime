#!/usr/bin/env bash
# Engine 1: build the unattended-install answer ISO.
# CREATE ONLY. Writes new files under /srv/hexworth/engine1; removes nothing.
set -euo pipefail
BASE=/srv/hexworth/engine1
V="${1:-v1}"
OUT="$BASE/provision/$V"
mkdir -p "$OUT"

# The admin password is generated ON THIS HOST and never leaves it. 0600.
CRED="${CRED_PATH:-$BASE/config/engine1-admin.cred}"
if [ ! -f "$CRED" ]; then
  umask 077
  { printf 'Administrator\n'; tr -dc 'A-Za-z0-9!@#%^_+=' </dev/urandom | head -c 28; printf '\n'; } > "$CRED"
  chmod 600 "$CRED"
  echo "generated new admin credential at $CRED (0600)"
else
  echo "reusing existing credential at $CRED"
fi
PW="$(sed -n 2p "$CRED")"

WCM='xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State"'
PSH='C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe'

cat > "$OUT/autounattend.xml" <<XML
<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend">
  <settings pass="windowsPE">
    <component name="Microsoft-Windows-International-Core-WinPE" processorArchitecture="amd64"
               publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <SetupUILanguage><UILanguage>en-US</UILanguage></SetupUILanguage>
      <InputLocale>en-US</InputLocale><SystemLocale>en-US</SystemLocale>
      <UILanguage>en-US</UILanguage><UserLocale>en-US</UserLocale>
    </component>
    <component name="Microsoft-Windows-Setup" processorArchitecture="amd64"
               publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <DiskConfiguration>
        <Disk wcm:action="add" $WCM>
          <DiskID>0</DiskID>
          <WillWipeDisk>true</WillWipeDisk>
          <CreatePartitions>
            <CreatePartition wcm:action="add"><Order>1</Order><Type>Primary</Type><Extend>true</Extend></CreatePartition>
          </CreatePartitions>
          <ModifyPartitions>
            <ModifyPartition wcm:action="add">
              <Order>1</Order><PartitionID>1</PartitionID><Format>NTFS</Format>
              <Label>System</Label><Letter>C</Letter><Active>true</Active>
            </ModifyPartition>
          </ModifyPartitions>
        </Disk>
      </DiskConfiguration>
      <ImageInstall>
        <OSImage>
          <InstallFrom><MetaData wcm:action="add" $WCM>
            <Key>/IMAGE/INDEX</Key><Value>1</Value>
          </MetaData></InstallFrom>
          <InstallTo><DiskID>0</DiskID><PartitionID>1</PartitionID></InstallTo>
          <WillShowUI>OnError</WillShowUI>
        </OSImage>
      </ImageInstall>
      <UserData>
        <AcceptEula>true</AcceptEula>
        <FullName>Hexworth</FullName><Organization>Hexworth Prime</Organization>
      </UserData>
    </component>
  </settings>
  <settings pass="specialize">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64"
               publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <ComputerName>ENGINE1</ComputerName>
      <TimeZone>UTC</TimeZone>
    </component>
    <component name="Microsoft-Windows-TerminalServices-LocalSessionManager" processorArchitecture="amd64"
               publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <fDenyTSConnections>false</fDenyTSConnections>
    </component>
  </settings>
  <settings pass="oobeSystem">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64"
               publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <UserAccounts>
        <AdministratorPassword><Value>$PW</Value><PlainText>true</PlainText></AdministratorPassword>
      </UserAccounts>
      <AutoLogon>
        <Password><Value>$PW</Value><PlainText>true</PlainText></Password>
        <Enabled>true</Enabled><LogonCount>1</LogonCount><Username>Administrator</Username>
      </AutoLogon>
      <OOBE>
        <HideEULAPage>true</HideEULAPage><HideLocalAccountScreen>true</HideLocalAccountScreen>
        <HideOnlineAccountScreens>true</HideOnlineAccountScreens><HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>
        <NetworkLocation>Work</NetworkLocation><ProtectYourPC>3</ProtectYourPC>
      </OOBE>
      <FirstLogonCommands>
        <SynchronousCommand wcm:action="add" $WCM>
          <Order>1</Order><Description>Install OpenSSH Server</Description>
          <CommandLine>powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"</CommandLine>
        </SynchronousCommand>
        <SynchronousCommand wcm:action="add" $WCM>
          <Order>2</Order><Description>Enable and start sshd</Description>
          <CommandLine>powershell -NoProfile -Command "Set-Service -Name sshd -StartupType Automatic; Start-Service sshd"</CommandLine>
        </SynchronousCommand>
        <SynchronousCommand wcm:action="add" $WCM>
          <Order>3</Order><Description>PowerShell as the default SSH shell</Description>
          <CommandLine>powershell -NoProfile -Command "New-ItemProperty -Path HKLM:\SOFTWARE\OpenSSH -Name DefaultShell -Value '$PSH' -PropertyType String -Force"</CommandLine>
        </SynchronousCommand>
        <SynchronousCommand wcm:action="add" $WCM>
          <Order>4</Order><Description>Firewall: allow SSH and RDP</Description>
          <CommandLine>powershell -NoProfile -Command "New-NetFirewallRule -Name engine1-ssh -DisplayName 'Engine1 SSH' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22; Enable-NetFirewallRule -DisplayGroup 'Remote Desktop'"</CommandLine>
        </SynchronousCommand>
        <SynchronousCommand wcm:action="add" $WCM>
          <Order>5</Order><Description>Provision marker the host polls for completion</Description>
          <CommandLine>powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path C:\Hexworth | Out-Null; Set-Content -Path C:\Hexworth\PROVISIONED.txt -Value ('engine1 base ready ' + (Get-Date -Format o))"</CommandLine>
        </SynchronousCommand>
      </FirstLogonCommands>
    </component>
  </settings>
</unattend>
XML

chmod 600 "$OUT/autounattend.xml"
python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse('$OUT/autounattend.xml'); print('autounattend.xml is well-formed XML')"
genisoimage -quiet -o "$OUT/engine1-unattend-$V.iso" -J -r -V UNATTEND "$OUT/autounattend.xml"
chmod 600 "$OUT/engine1-unattend-$V.iso"
echo "built $OUT/engine1-unattend-$V.iso"
ls -la "$OUT"
