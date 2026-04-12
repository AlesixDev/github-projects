"use client"

import { useState, useMemo } from "react"
import { AnimateIn } from "@/components/ui/animate-in"
import { SearchBar } from "./search-bar"
import { TagFilter } from "./tag-filter"
import { ProjectCard } from "./project-card"
import type { Project } from "@/lib/types"

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const project of projects) {
      for (const tag of project.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  }, [projects])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return projects.filter((p) => {
      const searchable = `${p.name} ${p.description} ${p.author} ${p.tags.join(" ")} ${p.language}`.toLowerCase()
      if (q && !searchable.includes(q)) return false
      if (selectedTags.length > 0 && !selectedTags.every((t) => p.tags.includes(t))) return false
      return true
    })
  }, [projects, query, selectedTags])

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SearchBar value={query} onChange={setQuery} />
        <TagFilter tags={allTags} selected={selectedTags} onToggle={toggleTag} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-light">No projects found</p>
          <p className="text-sm mt-1">Try a different search or clear filters</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-mono">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <AnimateIn key={project.id} delay={Math.min(i * 0.05, 0.3)} className="h-full">
                <ProjectCard project={project} />
              </AnimateIn>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
