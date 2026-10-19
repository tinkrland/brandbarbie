---
title: contrast & accessibility
summary: contrast requirements: readable is a brand value, not a chore
tags: [color, visual identity, accessibility]
order: 3
date: 2026-10-19
---

cute that can't be read is broken. contrast requirements are part of the aesthetic, not a tax on it.

## the requirements

- body text on background: {hl:yellow|4.5:1 minimum} (WCAG AA)
- large text (24px+, or 19px and bold): 3:1 minimum
- icons, buttons, focus rings: 3:1 against their surroundings
- never rely on color alone: pair it with a shape, a label, or an underline

## the safe pairs

- cocoa ink on cream: always passes, no review needed
- rose on cream: large text only
- bubblegum on cream: {hl:orange|decorative only, never text}
- white on rose: large text and buttons

## checking

- run a contrast checker on every new pair; the check takes ten seconds, retrofitting takes ten hours
- test at real size: a pair that passes at 60px headline can fail at 16px body
- print is exempt from WCAG but not from eyes: squint before you ship

see [[color codes]] for the values themselves, and [[color ratios]] for how much of anything you're allowed to use.
