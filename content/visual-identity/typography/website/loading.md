---
title: loading & fallbacks
summary: how the web fonts load: self-hosted woff2, swap, and a fallback that holds the line
tags: [typography, visual identity, web]
order: 4
date: 2026-10-19
---

the brand typefaces arrive on the web as files, and files take time. the loading contract keeps the wait invisible.

## the contract

- self-hosted woff2 files: no third-party font CDN, no tracking, no surprise outages
- two weights of each face, maximum: the full family stays in the brand kit
- `font-display: swap`: text renders in the fallback immediately, swaps when the file lands

## the fallback stack

- system-ui is the fallback: round, warm-adjacent, and already on the device
- match what you can: adjust the fallback's size so the swap doesn't reflow (size-adjust, if the tooling allows)
- never let the fallback be the design: a page that lives entirely on system-ui is wearing a loaner

## budget

- both faces, all weights, under 200kb total gzipped; over that, cut a weight, not the quality
- preload only the two weights above the fold; the rest load on arrival
