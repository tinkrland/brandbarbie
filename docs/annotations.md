# annotations.md

the brandbarbie annotation system: highlighter, pen underlines, and foldable asides, all written inline in the markdown. this document is the reference; the renderer in `src/lib/markdown.tsx` implements exactly what is written here.

## highlights

marker-style highlights, drawn behind the text:

```
{hl:yellow|highlighted text}
```

colors: `yellow`, `sage`, `blue`, `pink`, `orange`, `gray`.

## underlines

pen-style underlines:

```
{ul:solid|underlined text}
{ul:wavy|wavy underline}
{ul:dashed|dashed underline}
{ul:dotted|dotted underline}
```

with a color:

```
{ul:wavy:pink|wavy underline in pink}
```

underline colors: `yellow`, `sage`, `blue`, `pink`, `orange`, `gray`. without a color, each style has its own default ink.

## combining

highlight and underline in one mark:

```
{hl:yellow ul:wavy:orange|text with both}
```

## folds

inline foldable text for asides, asides that should not interrupt the sentence:

```
{fold: visible text | hidden text, revealed on click}
```

the visible part stays inline with a small chevron; clicking expands the hidden part below it. both sides render full inline markdown: wiki links, emphasis, and nested annotations all work inside a fold.

## notes

- annotations nest inside folds, and folds nest inside annotations.
- annotations work everywhere inline markdown renders: body text, list items, table cells, quotes, and callout cards.
- search results and auto-generated excerpts strip the annotation marks, showing only the inner text.
- dark mode has its own tuned highlight shades; nothing extra to write.
