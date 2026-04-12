import Link from "next/link"
import { Background } from "@/components/ui/background"
import { Nav } from "@/components/ui/nav"
import { AnimateIn } from "@/components/ui/animate-in"
import { ProjectCard } from "@/components/projects/project-card"
import { OpenModalButton } from "@/components/submit/open-modal-button"
import { getHomeProjects } from "@/lib/github"
import staticProjects from "@/data/projects.json"
import type { ProjectStatic } from "@/lib/types"

export default async function Home() {
  const top = await getHomeProjects(staticProjects as ProjectStatic[], 6)

  return (
    <div className="relative min-h-screen">
      <Background />
      <Nav />

      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-8 sm:px-12 pt-32 pb-16">
          <AnimateIn delay={0.1}>
            <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-4">
              Open Source
            </p>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight gradient-text mb-6">
              GitHub Projects
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              A curated showcase of open-source projects from the community. Discover tools, libraries, and frameworks worth exploring.
            </p>
          </AnimateIn>
          <AnimateIn delay={0.4}>
            <div className="flex items-center gap-4 flex-wrap">
              <OpenModalButton />
              <Link
                href="/projects"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse all →
              </Link>
            </div>
          </AnimateIn>
        </section>

        <div className="gradient-divider mx-8 sm:mx-12" />

        <section className="max-w-6xl mx-auto px-8 sm:px-12 py-16">
          <AnimateIn delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-light text-foreground">Top picks</h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Ranked by stars · recency · rotation
                </p>
              </div>
              <Link
                href="/projects"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wider"
              >
                View all →
              </Link>
            </div>
          </AnimateIn>

          {top.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-light">No projects yet</p>
              <p className="text-sm mt-1">Be the first to submit one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {top.map((project, i) => (
                <AnimateIn key={project.id} delay={i * 0.05} className="h-full">
                  <ProjectCard project={project} />
                </AnimateIn>
              ))}
            </div>
          )}
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
