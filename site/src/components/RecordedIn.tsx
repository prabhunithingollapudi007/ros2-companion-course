import type { Transcript } from '../transcripts'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Says where and when the lesson's terminal sessions were recorded. */
export function RecordedIn({ transcript }: { transcript: Transcript }) {
  const { recorded, versions } = transcript.meta
  const [year, month, day] = recorded.split('-').map(Number)
  return (
    <p className="dim small">
      Every terminal on this page marked <em>recorded</em> is a real session in the course container: ROS 2 Jazzy on
      Ubuntu {versions.ubuntu}, ros2cli {versions.ros2cli}, recorded on {day} {MONTHS[month - 1]} {year}. When you
      run the same commands, clock times, message counters and measured rates will differ; the rest should match.
    </p>
  )
}
