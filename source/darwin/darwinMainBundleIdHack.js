/* edited & reduced from: https://github.com/dr-js/dr-js/blob/master/source/node/system/Process.js
$ npx @dr-js/core --ps tree # some sample output on darwin 10.15
npx: installed 1 in 1.612s
     pid | command
       1 | /sbin/launchd
      87 | ├─ /usr/sbin/syslogd
      88 | ├─ /usr/libexec/UserEventAgent (System)
     244 | ├─ /System/Library/CryptoTokenKit/com.apple.ifdreader.slotd/Contents/MacOS/com.apple.ifdreader
     254 | ├─ /System/Library/CoreServices/backupd.bundle/Contents/Resources/backupd-helper -launchd
     385 | ├─ /System/Library/Frameworks/Accounts.framework/Versions/A/Support/accountsd
     426 | ├─ /System/Library/CoreServices/Spotlight.app/Contents/MacOS/Spotlight
     463 | ├─ /System/Library/CoreServices/Siri.app/Contents/MacOS/Siri launchd
     475 | ├─ /System/Library/Frameworks/CryptoTokenKit.framework/ctkahp.bundle/Contents/MacOS/ctkahp
     493 | ├─ SafeEjectGPUAgent
     503 | ├─ /System/Library/CoreServices/SubmitDiagInfo server-init
     901 | ├─ /System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal
    1743 | │  └─ login -pfl dr /bin/bash -c exec -la zsh /bin/zsh
    1744 | │     └─ -zsh
    1890 | │        └─ node /usr/local/bin/npx @dr-js/core --ps tree
    1893 | │           └─ ps ax -ww -o pid,ppid,args
    1210 | ├─ /System/Library/Frameworks/CoreSpotlight.framework/CoreSpotlightService
    1233 | └─ /usr/libexec/amfid
*/

const execAsync = (command, ...args) => new Promise((resolve) => require('child_process').execFile(
  command,
  args,
  { maxBuffer: 8 * 1024 * 1024 },
  (_, stdout) => resolve(String(stdout || '')))
)

// NOTE: not a fast command (linux: ~100ms)
const getProcessListAsync = async () => {
  const [ titleLine, ...rowList ] = (await execAsync('ps', 'ax', '-ww', '-o', 'pid,ppid,args')).split('\n')
  const keyList = [ 'pid', 'ppid', 'command' ]
  const colStartIndexList = parseTitleCol(titleLine)
  if (colStartIndexList.length !== keyList.length) throw new Error(`title col mismatch: ${colStartIndexList.length}, expect: ${keyList.length}`)
  return rowList.map((rowString) => rowString && parseRow(rowString, colStartIndexList, keyList, [ valueProcessInteger, valueProcessInteger, valueProcessString ])).filter(Boolean)
}
// a col means \w+\s+, or \s+\w+ (for this output)
// so every 2 \w\s flip means a col
const parseTitleCol = (titleString) => {
  let flipCharType = titleString.charAt(0) === ' '
  let flipCount = 2

  const colStartIndexList = [ 0 ] // colStartIndex

  for (let index = 0, indexMax = titleString.length; index < indexMax; index++) {
    const charType = titleString.charAt(index) === ' '
    if (flipCharType === charType) continue
    flipCharType = !flipCharType
    flipCount--
    if (flipCount === 0) {
      colStartIndexList.push(index)
      flipCount = 2
    }
  }
  return colStartIndexList
}
const parseRow = (rowString, colStartIndexList, keyList, valueProcessList) => {
  const itemMap = {}
  for (let index = 0, indexMax = colStartIndexList.length; index < indexMax; index++) {
    itemMap[ keyList[ index ] ] = valueProcessList[ index ](rowString.slice(
      colStartIndexList[ index ],
      colStartIndexList[ index + 1 ]
    ))
  }
  return itemMap
}
const valueProcessString = (string) => String(string).trim()
const valueProcessInteger = (string) => parseInt(string)

const toProcessPidMap = (processList) => (processList).reduce((o, info) => {
  o[ info.pid ] = info
  return o
}, {})

const getDarwinMainBundleIdHackAsync = async () => {
  const processList = await getProcessListAsync()
  const processMap = toProcessPidMap(processList)

  // find the upper main process with ppid=1 (for /sbin/launchd)
  let mainProcess = processMap[ process.pid ]
  while (mainProcess && mainProcess.ppid !== 1) mainProcess = processMap[ mainProcess.ppid ]
  if (!mainProcess) throw new Error('failed to get main process pid')

  // https://stackoverflow.com/questions/8840149/how-to-obtain-an-applications-bundle-id-or-plist-path-from-only-the-pid
  // execfile=`ps -ww -o comm= -p 48022` && [[ ${execfile%/*} =~ ^.+/Contents/MacOS$ ]] && defaults read "${execfile%/*/*}"/Info CFBundleIdentifier
  // pathMainAppBinary will be something like:
  //   /System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal
  //   /System/Applications/Utilities/Activity Monitor.app/Contents/MacOS/Activity Monitor
  const pathMainAppBinary = (await execAsync('ps', '-ww', '-o', 'comm=', '-p', mainProcess.pid)).trim()
  const pathMainApp = pathMainAppBinary.slice(0, pathMainAppBinary.indexOf('/Contents/MacOS'))
  if (!pathMainApp) throw new Error('failed to get main path app')

  const mainBundleId = (await execAsync('defaults', 'read', `${pathMainApp}/Contents/Info`, 'CFBundleIdentifier')).trim()
  if (!mainProcess) throw new Error('failed to get main bundle id')

  return mainBundleId
}

// test with: `node darwinMainBundleIdHack.js`
// getDarwinMainBundleIdHackAsync().then(console.log)

module.exports = { getDarwinMainBundleIdHackAsync }
