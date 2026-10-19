---
title: website typography
summary: type on the web: what changes, what loads, and how it scales
tags: [typography, visual identity, web]
date: 2026-10-18
---

web type is brand type on a budget: fewer weights, fluid sizes, performance limits.

## loading

- self-hosted woff2, `font-display: swap`
- two weights of each face, maximum

## web rules

- body minimum 16px, line-height 1.6
- measure: 60-75 characters per line
- headlines scale with `clamp()`, not breakpoints: see [[type hierarchy]] for the ratio
- system-ui is the fallback stack

## ui-only additions

- monospace for code, tags, and meta labels
- links: always underlined, brand pink. affordance beats aesthetic
