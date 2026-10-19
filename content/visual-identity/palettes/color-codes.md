---
title: color codes
summary: HEX, RGB, CMYK, Pantone: what each code is for and when to use it
tags: [color, visual identity]
order: 4
date: 2026-10-19
---

the same color, four ways of writing it down. each format exists for a different machine.

## the formats

- **HEX** (`#F27BA9`): the web format, six hex digits of red, green, blue. screens only; never send a hex to print
- **RGB**: the same color as three numbers, 0 to 255 each. what screens are actually mixing
- **CMYK**: ink, not light: cyan, magenta, yellow, black. what a printer mixes; the same swatch in CMYK looks duller than on screen, and that's expected
- **Pantone (PMS)**: the swatch-book system: a printer mixes a physical match, so a spot color prints the same everywhere

## which one goes where

- anything on a screen: HEX (and RGB where a tool asks for it)
- digital print (business cards, stickers): CMYK
- packaging and brand-critical print: Pantone spot colors
- anything sent to a designer: the HEX, plus the [[palette library]] page it came from

## conversions, honestly

- HEX converted to CMYK by formula always looks a little dead; a proofed CMYK value beats a calculated one, so keep both on the swatch
- one Pantone per palette, two maximum: spot ink is priced per color
- {ul:wavy|record the proofed values, not the calculated ones}: the swatch table is the source of truth
