// Records, or re-checks, the terminal sessions the lessons show.
//
//   npm run transcripts               record every lesson's scenarios again
//   npm run transcripts -- lesson02   record one lesson's
//   npm run transcripts:check         run them again and fail if the output has changed
//
// A lesson never quotes a command from memory. Its commands are listed in
// src/transcripts/lessonNN.scenarios.json; this script runs each scenario in a
// fresh copy of the course container (docker/Dockerfile) and stores what was
// printed in src/transcripts/lessonNN.json, which the lesson page displays.
// It needs Docker, and the image built once:
//
//   docker compose -f docker/compose.yaml build

import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repo = path.resolve(site, '..')
const folder = path.join(site, 'src', 'transcripts')
const IMAGE = 'ros-companion:jazzy'

const [mode, ...only] = process.argv.slice(2)
if (mode !== 'record' && mode !== 'check') {
  console.error('Usage: node scripts/transcripts.mjs record|check [lessonNN ...]')
  process.exit(2)
}
await mkdir(path.join(site, 'public', 'shots'), { recursive: true })
const scratchShots = await mkdtemp(path.join(tmpdir(), 'ros-companion-shots-'))

function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (result.error) {
    throw new Error(`Could not run docker (${result.error.message}). Is Docker installed and running?`)
  }
  return result
}

/** What changes from one run to the next without meaning anything: clock times and generated ids. */
function normalise(text, mask) {
  let out = text
    .replace(/\[\d{9,10}\.\d+\]/g, '[TIME]')
    .replace(/GID: [0-9a-f.]+/g, 'GID: X')
    .replace(/_ros2cli_daemon_\d+_[0-9a-f]+/g, '_ros2cli_daemon_N')
    .replace(/_ros2cli_\d+/g, '_ros2cli_N')
    // RViz and other tf2 users start a listener node named after a memory address.
    .replace(/transform_listener_impl_[0-9a-f]+/g, 'transform_listener_impl_ID')
    // static_transform_publisher gives itself a random name unless told one.
    .replace(/static_transform_publisher_[A-Za-z0-9]{16}/g, 'static_transform_publisher_ID')
    // ros2 launch reports each process's id.
    .replace(/process started with pid \[\d+\]/g, 'process started with pid [N]')
    .replace(/process has finished cleanly \[pid \d+\]/g, 'process has finished cleanly [pid N]')
    // Every action goal gets a random id.
    .replace(/Goal accepted with ID: [0-9a-f]+/g, 'Goal accepted with ID: ID')
    // `ros2 topic pub` prints this only if discovery has not finished when it starts.
    .replace(/^Waiting for at least \d+ matching subscription\(s\)\.\.\.\n/m, '')
    // `ros2 launch` names its log folder after the date, the host and its process id.
    .replace(/\/\.ros\/log\/\S+/g, '/.ros/log/RUN')
  // For output that is all measurements or counters (rates, "Hello World: 12"): compare its shape only.
  if (mask === 'numbers') out = out.replace(/-?\d+(\.\d+)?(e-?\d+)?/g, '#')
  // For messages stamped with the time they were sent: compare everything but the stamp.
  if (mask === 'stamps') out = out.replace(/\b(sec|nanosec): \d+/g, '$1: #')
  return out
}

function runScenario(scenario) {
  const mounts = ['-v', `${path.join(repo, 'docker', 'record.py')}:/tools/record.py:ro`]
  // The labs folder, read-only, with an empty scratch workspace where /labs/ws would be,
  // so a recording can build in the same place a reader does without touching the repository.
  if (scenario.labs) mounts.push('-v', `${path.join(repo, 'labs')}:/labs:ro`, '--tmpfs', '/labs/ws:rw,exec,size=512m')
  // No network: discovery still works inside the container, and nothing running
  // in any other container can join the graph being recorded.
  // A fixed host name, the same as docker/compose.yaml gives readers, because
  // some output (launch's log folders) includes it.
  // Screenshots go to site/public/shots when recording. When checking, they go to a
  // scratch folder: what the windows look like is not compared, only that they open.
  const shots = mode === 'record' ? path.join(site, 'public', 'shots') : scratchShots
  if (scenario.display) mounts.push('-v', `${shots}:/shots`, '--shm-size', '1g')
  const result = docker(
    ['run', '--rm', '-i', '--network', 'none', '--hostname', 'ros-companion', ...mounts, IMAGE, 'python3', '/tools/record.py'],
    JSON.stringify({ steps: scenario.steps, display: scenario.display ?? false }),
  )
  let report
  try {
    report = JSON.parse(result.stdout)
  } catch {
    throw new Error(`Scenario "${scenario.name}" produced no report.\n${result.stdout}\n${result.stderr}`)
  }
  if (report.failed) throw new Error(`Scenario "${scenario.name}" failed.\n${report.failed}`)
  for (const run of report.runs) {
    const step = scenario.steps.find((s) => s.id === run.id)
    if (run.ended === 'exit' && run.code !== 0 && !step.mayFail) {
      throw new Error(`Scenario "${scenario.name}", step "${run.id}": \`${run.command}\` exited with code ${run.code}.\n${run.output}`)
    }
  }
  return report.runs
}

function versions() {
  const query =
    ". /etc/os-release; echo \"ubuntu=$VERSION_ID\"; dpkg-query -W -f='${Package}=${Version}\\n' ros-jazzy-ros2cli ros-jazzy-rclcpp ros-jazzy-rmw-fastrtps-cpp"
  const result = docker(['run', '--rm', IMAGE, 'bash', '-c', query])
  if (result.status !== 0) throw new Error(`Could not read versions from ${IMAGE}. Has the image been built?\n${result.stderr}`)
  return Object.fromEntries(
    result.stdout
      .trim()
      .split('\n')
      .map((line) => line.split('='))
      .map(([name, version]) => [name.replace('ros-jazzy-', ''), version.replace(/-\d+noble.*$/, '')]),
  )
}

const files = (await readdir(folder)).filter((f) => f.endsWith('.scenarios.json')).sort()
const lessons = files.map((f) => f.replace('.scenarios.json', '')).filter((l) => only.length === 0 || only.includes(l))
if (lessons.length === 0) {
  console.error(`No scenario files matched in ${folder}.`)
  process.exit(2)
}

let problems = 0
for (const lesson of lessons) {
  const { scenarios } = JSON.parse(await readFile(path.join(folder, `${lesson}.scenarios.json`), 'utf8'))
  const steps = scenarios.flatMap((s) => s.steps).filter((s) => s.id)
  const ids = steps.map((s) => s.id)
  const repeated = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (repeated.length) throw new Error(`${lesson}: step ids used more than once: ${[...new Set(repeated)].join(', ')}`)
  const unexplained = steps.filter((s) => s.check === false && !s.why).map((s) => s.id)
  if (unexplained.length) throw new Error(`${lesson}: steps left out of the check need a "why": ${unexplained.join(', ')}`)

  const runs = {}
  for (const scenario of scenarios) {
    process.stdout.write(`${lesson} / ${scenario.name} ... `)
    const started = Date.now()
    for (const run of runScenario(scenario)) {
      const entry = { command: run.command, output: run.output, ended: run.ended }
      const step = scenario.steps.find((s) => s.id === run.id)
      if (step.cwd) entry.cwd = step.cwd
      if (run.truncated) entry.truncated = true
      if (run.tail) entry.tail = true
      runs[run.id] = entry
    }
    console.log(`${((Date.now() - started) / 1000).toFixed(0)} s`)
  }

  const target = path.join(folder, `${lesson}.json`)
  if (mode === 'record') {
    const meta = { image: IMAGE, recorded: new Date().toISOString().slice(0, 10), versions: versions() }
    await writeFile(target, JSON.stringify({ meta, runs }, null, 2) + '\n')
    console.log(`${lesson}: recorded ${Object.keys(runs).length} commands to ${path.relative(repo, target)}`)
    continue
  }

  const stored = JSON.parse(await readFile(target, 'utf8')).runs
  for (const step of steps) {
    const was = stored[step.id]
    const now = runs[step.id]
    // A step marked "check": false is run and shown but not compared, because what it
    // prints depends on timing; the scenario must verify the same thing another way.
    if (was && step.check === false) continue
    if (!was) {
      console.error(`\n${lesson}: "${step.id}" has never been recorded.`)
      problems += 1
    } else if (was.command !== now.command || normalise(was.output, step.mask) !== normalise(now.output, step.mask)) {
      console.error(`\n${lesson}: "${step.id}" no longer prints what the lesson shows.\n--- stored\n$ ${was.command}\n${was.output}\n--- now\n$ ${now.command}\n${now.output}`)
      problems += 1
    }
  }
  for (const id of Object.keys(stored)) {
    if (!ids.includes(id)) {
      console.error(`\n${lesson}: "${id}" is stored but no scenario records it any more.`)
      problems += 1
    }
  }
  if (problems === 0) console.log(`${lesson}: all ${ids.length} commands still print what the lesson shows.`)
}

if (problems > 0) {
  console.error(`\n${problems} transcript(s) differ. If the new output is right, record again with: npm run transcripts`)
  process.exit(1)
}
