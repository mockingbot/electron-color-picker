/* edited & reduced from: https://github.com/dr-js/dr-js/blob/master/source/node/system/Process.js
$ npx @dr-js/core --ps tree # some sample output on darwin 10.15
     pid | command
       1 | /sbin/launchd
      87 | ├─ /usr/sbin/syslogd
     254 | ├─ /System/Library/CoreServices/backupd.bundle/Contents/Resources/backupd-helper -launchd
     385 | ├─ /System/Library/Frameworks/Accounts.framework/Versions/A/Support/accountsd
     426 | ├─ /System/Library/CoreServices/Spotlight.app/Contents/MacOS/Spotlight
     901 | ├─ /System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal
    1743 | │  └─ login -pfl dr /bin/bash -c exec -la zsh /bin/zsh
    1744 | │     └─ -zsh
    1890 | │        └─ node /usr/local/bin/npx @dr-js/core --ps tree
    1893 | │           └─ ps ax -ww -o pid,ppid,args
    1233 | └─ /usr/libexec/amfid
*/

const execAsync = (command, ...args) => new Promise((resolve) => require('child_process').execFile(
  command,
  args,
  { maxBuffer: 8 * 1024 * 1024 },
  (_, stdout) => resolve(String(stdout || '')))
)

const parseTitleCol = (titleString) => { // a col means \w+\s+, or \s+\w+ (for this output), so every 2 \w\s flip means a col
  let flipCharType = titleString.charAt(0) === ' '
  let flipCount = 2
  const colEndIndexList = [] // colEndIndex
  for (let index = 0, indexMax = titleString.length; index < indexMax; index++) {
    const charType = titleString.charAt(index) === ' '
    if (flipCharType === charType) continue
    flipCharType = !flipCharType
    flipCount--
    if (flipCount !== 0) continue
    colEndIndexList.push(index)
    flipCount = 2
  }
  return colEndIndexList
}

const getProcessMapAsync = async () => {
  const [ titleLine, ...rowList ] = (await execAsync('/bin/ps', 'x', '-ww', '-o', 'pid,ppid,comm')).split('\n')
  const [ pidEndIndex, ppidEndIndex ] = parseTitleCol(titleLine)
  const processMap = {}
  for (const rowString of rowList) {
    if (!rowString) continue
    const pid = parseInt(rowString.slice(0, pidEndIndex))
    const ppid = parseInt(rowString.slice(pidEndIndex, ppidEndIndex))
    const comm = rowString.slice(ppidEndIndex).trim()
    processMap[ pid ] = { pid, ppid, comm }
  }
  return processMap
}

const getDarwinMainBundleIdHackAsync = async () => {
  const processMap = await getProcessMapAsync()
  // find the upper main process with ppid=1 (under /sbin/launchd)
  let mainProcess = processMap[ process.pid ]
  while (mainProcess && mainProcess.ppid !== 1) mainProcess = processMap[ mainProcess.ppid ]
  if (!mainProcess) throw new Error('missing mainProcessPid')
  // check: https://stackoverflow.com/questions/8840149/how-to-obtain-an-applications-bundle-id-or-plist-path-from-only-the-pid
  // command: execfile=`ps -ww -o comm= -p 48022` && [[ ${execfile%/*} =~ ^.+/Contents/MacOS$ ]] && defaults read "${execfile%/*/*}"/Info CFBundleIdentifier
  // pathMainAppBinary will be something like: /System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal
  const pathMainAppBinary = mainProcess.comm.trim()
  const pathMainApp = pathMainAppBinary.slice(0, pathMainAppBinary.indexOf('/Contents/MacOS'))
  const mainBundleId = (await execAsync('/usr/bin/defaults', 'read', `${pathMainApp}/Contents/Info`, 'CFBundleIdentifier')).trim()
  if (!mainProcess) throw new Error('missing mainBundleId')
  return mainBundleId
}

// test with: `node darwinMainBundleIdHack.js`
// getDarwinMainBundleIdHackAsync().then(console.log)
module.exports = { getDarwinMainBundleIdHackAsync }
