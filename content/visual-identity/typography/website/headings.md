---
title: web headings
summary: headline type on the web: fluid sizes, weights, and what loads
tags: [typography, visual identity, web]
order: 2
date: 2026-10-19
---

web headlines scale with the screen, not with the designer's mood. fluid type, two weights, no surprises.

## the scale

- sizes use `clamp()`, not breakpoints: the headline grows continuously between floors and ceilings
- the ratio between rungs follows the [[type hierarchy]]: one scale, every medium
- mobile headlines are not shrunk desktops: the clamp floor is designed for the phone, not a compromise

## weights and loading

- display weight and regular, that's the pair: a third weight on the web is a performance tax
- `font-display: swap` always; the fallback flashes, the layout holds

## fallback behavior

- the system-ui fallback must hold the space: match its metrics or size the clamp so a swap never reflows the page
- see [[loading & fallbacks]] for the full loading contract
