import { unstable_cache } from "next/cache"
import type { ProjectStatic, Project } from "./types"
import { getTopProjects } from "./scoring"

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const { hostname, pathname } = new URL(url)
    if (hostname !== "github.com") return null
    const [, owner, repo] = pathname.split("/")
    if (!owner || !repo) return null
    return { owner, repo }
  } catch {
    return null
  }
}

async function fetchRepo(owner: string, repo: string) {
  const token = process.env.GH_TOKEN
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // Only attach token if it looks like a real PAT (avoids sending placeholder strings)
    ...(token && token.length > 10 && !token.includes("your_token") && {
      Authorization: `Bearer ${token}`,
    }),
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
  if (!res.ok) return null

  return res.json() as Promise<{
    stargazers_count: number
    language: string | null
    created_at: string
    owner: { login: string; avatar_url: string }
  }>
}

async function _enrichProjects(staticProjects: ProjectStatic[]): Promise<Project[]> {
  const results = await Promise.all(
    staticProjects.map(async (p): Promise<Project> => {
      const parsed = parseGitHubUrl(p.github_url)

      const fallback: Project = {
        ...p,
        author: parsed?.owner ?? "unknown",
        avatar_url: parsed ? `https://avatars.githubusercontent.com/${parsed.owner}` : "",
        language: "Unknown",
        stars: 0,
        created_at: "2020-01-01",
      }

      if (!parsed) return fallback

      const repo = await fetchRepo(parsed.owner, parsed.repo)
      if (!repo) return fallback

      return {
        ...p,
        author: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
        language: repo.language ?? "Unknown",
        stars: repo.stargazers_count,
        created_at: repo.created_at.slice(0, 10),
      }
    })
  )

  return results
}

/**
 * Fetches live GitHub data for every project and merges it with the static JSON.
 * Cached for 1 hour via unstable_cache — works on Vercel and Node.js
 */
export const enrichProjects = unstable_cache(
  _enrichProjects,
  ["enrich-projects"],
  { revalidate: 3600 }
)

/**
 * Enriches and returns the top N scored projects, cached for 1 hour.
 */
export const getHomeProjects = unstable_cache(
  async (staticProjects: ProjectStatic[], count: number) => {
    const all = await _enrichProjects(staticProjects)
    return getTopProjects(all, count)
  },
  ["home-projects"],
  { revalidate: 3600 }
)
