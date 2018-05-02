import { accessSync, constants } from 'fs'
import { join as joinPath } from 'path'
import { execFile as execFileFromAsar } from 'child_process' // CHECK: https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive

const LINUX_SCROT_EXECUTABLE = joinPath(__dirname, './scrot')

const runLinuxSCROT = (outputFile) => new Promise((resolve, reject) => execFileFromAsar(LINUX_SCROT_EXECUTABLE, [ outputFile ], (error, stdout, stderr) => {
  if (error) return reject(error)
  try {
    accessSync(outputFile, constants.R_OK)
  } catch (error) {
    __DEV__ && console.log('[runLinuxSCROT] accessSync error:', error)
    reject(error)
  }
  __DEV__ && console.log('[runLinuxSCROT]', { stdout, stderr })
  resolve({ stdout, stderr })
}))

export { runLinuxSCROT }
