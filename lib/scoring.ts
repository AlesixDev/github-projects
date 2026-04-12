import type { Project } from "./types"

/** Deterministic pseudo-random 0–1 from a string seed */
function pseudoRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0
  }
  return ((hash >>> 0) % 10000) / 10000
}

/**
 * Score breakdown (max ~100 pts):
 *  Stars    0–50  — log₂ scale (1k≈30, 10k≈40, 100k≈50)
 *  Recency  0–30  — full 30 pts if < 1 month old, decays to 0 after ~18 months
 *  Rotation 0–20  — seeded by project.id + current day, changes daily
 */
function score(project: Project, dailySeed: string): number {
  const starScore = Math.log2(project.stars + 2) * 8

  const ageMs = Date.now() - new Date(project.created_at).getTime()
  const ageDays = ageMs / 864e5
  const recencyScore = Math.max(0, 30 * (1 - ageDays / 540))

  const rotationScore = pseudoRandom(project.id + dailySeed) * 20

  return starScore + recencyScore + rotationScore
}

export function getTopProjects(projects: Project[], count = 6): Project[] {
  const dailySeed = new Date().toISOString().slice(0, 10)
  return [...projects]
    .sort((a, b) => score(b, dailySeed) - score(a, dailySeed))
    .slice(0, count)
}
