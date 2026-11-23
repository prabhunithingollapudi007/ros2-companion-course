// How ROS finds a package when several workspaces are sourced on top of each
// other. AMENT_PREFIX_PATH lists install locations, newest first; the first one
// that has the package wins, and the package is taken whole from there. Copies
// further down the list are hidden, even programs the winning copy does not have.
//
// overlay.test.ts checks this against Lesson 3's recordings.

export interface Prefix {
  /** An install location, as it appears in AMENT_PREFIX_PATH. */
  path: string
  /** The packages installed there, each with its programs. */
  packages: Record<string, string[]>
}

/** AMENT_PREFIX_PATH for these prefixes, first searched first. */
export const amentPrefixPath = (prefixes: Prefix[]) => prefixes.map((p) => p.path).join(':')

/** Where a package is found: the first prefix that has it, or null (`Package not found`). */
export function findPackage(prefixes: Prefix[], name: string): Prefix | null {
  return prefixes.find((p) => name in p.packages) ?? null
}

/** The programs `ros2 run <name> ...` can start: only those of the copy that was found. */
export function executables(prefixes: Prefix[], name: string): string[] {
  const found = findPackage(prefixes, name)
  return found ? [...found.packages[name]].sort() : []
}

/**
 * Sourcing a workspace puts each of its packages in front of what was there,
 * the way colcon's default isolated install does: install/<package> per package.
 */
export function overlay(under: Prefix[], workspace: string, packages: Record<string, string[]>): Prefix[] {
  const added = Object.entries(packages).map(([name, programs]) => ({ path: `${workspace}/install/${name}`, packages: { [name]: programs } }))
  return [...added, ...under]
}
