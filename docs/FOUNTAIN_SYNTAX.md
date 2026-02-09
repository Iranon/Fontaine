# Fountain Syntax Guide

Fountain is a simple markup syntax that allows you to write screenplays in plain text. It is designed to be readable and easy to edit.

https://fountain.io/syntax/

This guide covers the syntax rules supported by the Fontaine parser.

## Basic Principles

-   **Plain Text**: Write in any text editor.
-   **Structure**: The parser uses line context (blank lines, capitalization) to determine element types.
-   **Forcing**: You can "force" specific elements using special characters if the parser interprets them incorrectly.

---

## Elements

### Scene Headings

A Scene Heading is any line that starts with `INT`, `EXT`, `EST`, `INT./EXT`, `INT/EXT`, or `I/E` followed by a space or dot. It must be preceded by a blank line.

```fountain
INT. CAFE - DAY

EXT. STREET - NIGHT
```

**Power User**: Force a Scene Heading by starting the line with a period `.`.

```fountain
.SNIPER SCOPE POV
```

**Scene Numbers**:
Hash marks `#` can be used to add scene numbers.

```fountain
INT. HOUSE - DAY #1#
```

### Action

Action (or scene description) is the default element. Any paragraph that doesn't match another rule is considered Action.

```fountain
The quick brown fox jumps over the lazy dog.
```

**Power User**: Force Action by starting the line with an exclamation point `!`.

```fountain
!THE END
```

### Character

A Character name is a line entirely in uppercase, preceded by a blank line and followed by dialogue.

```fountain
STEEL
The man's a myth!
```

**Power User**: Force a Character name by starting the line with an `@` symbol.

```fountain
@McCLANE
Yippie ki-yay!
```

### Dialogue

Dialogue is any text following a Character or Parenthetical element.

```fountain
SANBORN
A good 'ole boy. You know, loves the Army, blood runs green.
```

### Parenthetical

Parentheticals are wrapped in parentheses `()` and must follow a Character or Dialogue element.

```fountain
STEEL
(starting the engine)
So much for retirement!
```

### Dual Dialogue

Dual (simultaneous) dialogue is created by adding a caret `^` after the second character's name.

```fountain
BRICK
Screw retirement.

STEEL ^
Screw retirement.
```

### Transitions

Transitions are uppercase lines ending in `TO:`, preceded and followed by blank lines.

```fountain
CUT TO:
```

**Power User**: Force a Transition by starting the line with a greater-than symbol `>`.

```fountain
> FADE OUT.
```

### Centered Text

Center text by wrapping it in greater-than/less-than symbols `><`.

```fountain
> THE END <
```

### Lyrics

Lines starting with a tilde `~` are treated as lyrics.

```fountain
~Willy Wonka! Willy Wonka!
```

### Sections and Synopses

-   **Sections**: Lines starting with one or more `#` characters. Used for outlining.
    ```fountain
    # Act 1
    ## The Setup
    ```
-   **Synopses**: Lines starting with an equals sign `=`. Used for summarizing sections.
    ```fountain
    = Set up the protagonist and the world.
    ```

### Notes

Inline notes are wrapped in double brackets `[[ ]]`.

```fountain
[[Check this fact]]
```

### Page Breaks

Three or more equals signs `===` on a line create a page break.

```fountain
===
```

### Boneyard

Content wrapped in `/* */` is ignored (treated as a comment/boneyard).

```fountain
/* This scene is cut for now */
```

---

## Emphasis (Markdown Style)

Fontaine supports standard Markdown formatting within text:

-   *Italics*: `*text*`
-   **Bold**: `**text**`
-   ***Bold Italics***: `***text***`
-   _Underline_: `_text_`

To use literal asterisks or underscores, escape them with a backslash `\`.
