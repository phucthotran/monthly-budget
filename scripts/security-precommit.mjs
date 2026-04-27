import { spawnSync } from 'node:child_process'
import process from 'node:process'

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    ...opts,
  })
  if (result.status !== 0 && result.status !== null) {
    process.exit(result.status)
  }
  if (result.error) {
    console.error(result.error)
    process.exit(1)
  }
}

function hasCommand(name) {
  if (process.platform === 'win32') {
    const result = spawnSync('where', [name], {
      encoding: 'utf8',
      shell: true,
    })
    return result.status === 0
  }
  const result = spawnSync('which', [name], { encoding: 'utf8' })
  return result.status === 0
}

function requireTool(name, installHint) {
  if (!hasCommand(name)) {
    console.error(`${name} not found in PATH. ${installHint}`)
    process.exit(1)
  }
}

run('pnpm', ['audit', '--audit-level=high'])

requireTool('gitleaks', 'Install: https://github.com/gitleaks/gitleaks#installing (e.g. brew install gitleaks)')
run('gitleaks', ['protect', '--staged', '--redact', '--no-banner', '--log-level', 'warn'])

requireTool('trivy', 'Install: https://trivy.dev/latest/getting-started/installation/ (e.g. brew install trivy)')
run('trivy', [
  'fs',
  '--quiet',
  '--scanners',
  'secret,misconfig',
  '--skip-dirs',
  'node_modules',
  '--skip-dirs',
  'dist',
  '--skip-dirs',
  '.git',
  '--skip-dirs',
  'dev-dist',
  '--skip-dirs',
  'coverage',
  '--severity',
  'HIGH,CRITICAL',
  '--exit-code',
  '1',
  '--ignorefile',
  '.trivyignore',
  '.',
])
