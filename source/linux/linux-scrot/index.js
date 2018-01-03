import nodeModuleFs from 'fs'
import nodeModulePath from 'path'
import nodeModuleChildProcess from 'child_process'

// CHECK: https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive
const execFileFromAsar = nodeModuleChildProcess.execFile

const LINUX_SCROT_EXECUTABLE = nodeModulePath.join(__dirname, './scrot')

const runLinuxSCROT = (outputFile) => new Promise((resolve, reject) => execFileFromAsar(LINUX_SCROT_EXECUTABLE, [ outputFile ], (error, stdout, stderr) => {
  if (error) return reject(error)
  try {
    nodeModuleFs.accessSync(outputFile, nodeModuleFs.constants.R_OK)
  } catch (error) {
    __DEV__ && console.log('[runLinuxSCROT] accessSync error:', error)
    reject(error)
  }
  __DEV__ && console.log('[runLinuxSCROT]', { stdout, stderr })
  resolve({ stdout, stderr })
}))

export { runLinuxSCROT }
