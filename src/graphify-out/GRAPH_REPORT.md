# Graph Report - src  (2026-10-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 117 nodes · 252 edges · 7 communities (6 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `716a2df9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- AboutSection.tsx
- ref_react
- ref_framer_motion
- SoundManager
- ContactModal.tsx
- HeroSection.tsx

## God Nodes (most connected - your core abstractions)
1. `PortfolioContent()` - 14 edges
2. `SoundManager` - 12 edges
3. `useSmoothScroll()` - 9 edges
4. `FadeIn()` - 9 edges
5. `HeroSection()` - 8 edges
6. `ContactButton()` - 7 edges
7. `MarqueeSection()` - 7 edges
8. `ContactModal()` - 7 edges
9. `ProjectData` - 6 edges
10. `AboutSection()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `PortfolioContent()` --calls--> `AboutSection()`  [EXTRACTED]
  App.tsx → components/AboutSection.tsx
- `PortfolioContent()` --calls--> `ContactModal()`  [EXTRACTED]
  App.tsx → components/ContactModal.tsx
- `PortfolioContent()` --calls--> `MarqueeSection()`  [EXTRACTED]
  App.tsx → components/MarqueeSection.tsx
- `PortfolioContent()` --calls--> `ProjectsSection()`  [EXTRACTED]
  App.tsx → components/ProjectsSection.tsx
- `PortfolioContent()` --calls--> `ServicesSection()`  [EXTRACTED]
  App.tsx → components/ServicesSection.tsx

## Import Cycles
- None detected.

## Communities (7 total, 1 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.12
Nodes (19): App(), footerItemReveal, footerReveal, PortfolioContent(), socialLinks, CustomCursor(), HeroSection(), PageTransition() (+11 more)

### Community 1 - "AboutSection.tsx"
Cohesion: 0.14
Nodes (10): AboutSection(), AboutSectionProps, AnimatedText(), AnimatedTextProps, CharProps, FadeIn(), FadeInProps, ServiceItem (+2 more)

### Community 2 - "ref_react"
Cohesion: 0.20
Nodes (9): ContactButton(), ContactButtonProps, MarqueeSection(), MarqueeSectionProps, ScrollReveal(), ScrollRevealProps, ScrollTextMarquee(), ScrollTextMarqueeProps (+1 more)

### Community 3 - "ref_framer_motion"
Cohesion: 0.24
Nodes (9): LiveProjectButton(), LiveProjectButtonProps, ProjectCard(), ProjectCardProps, ProjectData, ProjectModalProps, PROJECTS, ProjectsSection() (+1 more)

### Community 5 - "ContactModal.tsx"
Cohesion: 0.23
Nodes (11): AVAILABLE_SERVICES, BUDGET_OPTIONS, ContactModal(), ContactModalProps, TIMELINE_OPTIONS, TypewriterHeading(), TypewriterServiceList(), WordRevealText() (+3 more)

### Community 6 - "HeroSection.tsx"
Cohesion: 0.24
Nodes (6): HeroParticles(), PALETTE, Particle, HeroSectionProps, Magnet(), MagnetProps

## Knowledge Gaps
- **31 isolated node(s):** `PageTransitionProps`, `Particle`, `SmoothScrollContextType`, `AboutSectionProps`, `AnimatedTextProps` (+26 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 43 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ContactModal()` connect `ContactModal.tsx` to `App.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `PortfolioContent()` connect `App.tsx` to `AboutSection.tsx`, `ref_react`, `ref_framer_motion`, `ContactModal.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `PageTransitionProps`, `Particle`, `SmoothScrollContextType` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
- **Should `AboutSection.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._