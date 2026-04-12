"use client"

type TagFilterProps = {
  tags: string[]
  selected: string[]
  onToggle: (tag: string) => void
}

export function TagFilter({ tags, selected, onToggle }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
      {tags.map((tag) => {
        const isActive = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            aria-pressed={isActive}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 border ${
              isActive
                ? "bg-foreground text-background border-foreground"
                : "bg-card/40 text-muted-foreground border-border hover:border-muted-foreground hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
