import type { Metadata } from "next"
import { Background } from "@/components/ui/background"
import { Nav } from "@/components/ui/nav"
import { AnimateIn } from "@/components/ui/animate-in"
import { ProjectGrid } from "@/components/projects/project-grid"
import { enrichProjects } from "@/lib/github"
import staticProjects from "@/data/projects.json"
import type { ProjectStatic } from "@/lib/types"

export const metadata: Metadata = {
  title: "All Projects",
  description: `Explore ${staticProjects.length} open-source projects submitted by the community. Filter by language, tags, or search by name.`,
}

export default async function ProjectsPage() {
  const projects = await enrichProjects(staticProjects as ProjectStatic[])

  return (
    <div className="relative min-h-screen">
      <Background />
      <Nav />

      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-8 sm:px-12 pt-32 pb-16">
          <AnimateIn delay={0.1}>
            <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-4">
              All Projects
            </p>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight gradient-text mb-4">
              Browse the showcase
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <p className="text-base text-muted-foreground leading-relaxed">
              {projects.length} open-source projects, search, filter by tag, or just explore.
            </p>
          </AnimateIn>
        </section>

        <div className="gradient-divider mx-8 sm:mx-12" />

        <section className="max-w-6xl mx-auto px-8 sm:px-12 py-16">
          <ProjectGrid projects={projects} />
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/30 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 text-xs text-muted-foreground font-mono">
          <a
            href="https://github.com/AlesixDev/github-projects"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Source Code ↗
          </a>
        </div>
      </footer>
    </div>
  )
}
