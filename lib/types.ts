/** Fields stored in data/projects.json — curated by humans */
export interface ProjectStatic {
  id: string
  name: string
  description: string
  github_url: string
  demo_url?: string
  tags: string[]
}

/** ProjectStatic + live data fetched from GitHub API */
export interface Project extends ProjectStatic {
  author: string
  avatar_url: string
  language: string
  stars: number
  created_at: string // ISO date, from GitHub repo
}
