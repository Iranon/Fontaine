# Fontaine

Fontaine is a project for parsing, rendering, and previewing [Fountain](https://fountain.io) screenplays.

## Project Structure

The project is organized as a monorepo with the following structure:

-   **apps/**: Application entry points.
    -   `fontaine-preview-server`: A local server that livestreams a preview of your `.fountain` file as you edit it.
-   **modules/**: Core logic libraries.
    -   `fountain-parser`: Parse Fountain syntax into a structured AST (Abstract Syntax Tree).
    -   `fountain-renderer`: Converts the parsed AST into HTML with screenplay formatting.

## Logic Overview

The core logic flows through the modules as follows:

1.  **Parsing (`fountain-parser`)**:
    -   Reads raw text from a `.fountain` file.
    -   Processes lines to identify screenplay elements (Scene Headings, Action, Dialogue, etc.).
    -   Outputs a JSON object (`FountainScript`) containing an array of elements.

2.  **Rendering (`fountain-renderer`)**:
    -   Takes the `FountainScript` AST.
    -   Generates semantic HTML for each element (`<div class="scene-heading">`, `<div class="dialogue">`, etc.).
    -   Provides CSS to style these elements to look like a traditional screenplay.

3.  **Preview (`fontaine-preview-server`)**:
    -   Uses Bun's native `Bun.serve` to serve a local web page.
    -   Watches the target `.fountain` file for changes using `fs.watch`.
    -   On change, re-parses and re-renders the script.
    -   Pushes updated HTML to the browser via WebSockets (native Bun) for instant feedback.

## Developer Guide

### Prerequisites

-   [Bun](https://bun.sh) (v1.3+)

### Installation

Install dependencies from the root directory:

```bash
bun install
```

### Building

Build all packages and apps:

```bash
bun run build
```

This uses TypeScript project references via `tsc -b` to build modules in the correct order.

### Compiling Standalone Binary

You can compile a standalone executable of the preview server for your current platform:

```bash
bun run compile:preview-server
```

This generates a `fontaine-preview` binary in the root directory (via `apps/preview-server/compile.sh`), which includes the Bun runtime and all dependencies.

### Type Checking

Verify types across the monorepo:

```bash
bun run typecheck
```

### Testing

Run unit tests for all modules using Bun's native test runner:

```bash
bun test
# or run across workspaces
bun run test
```

### Running the Preview Server

To start the preview server for a specific `.fountain` file:

```bash
bun dev --file /path/to/your/script.fountain
```

The server runs with `--hot` reload enabled by default. Open your browser at `http://localhost:4444/preview` to see the rendered script.

### Running the Standalone Binary

If you have compiled the standalone binary, you can run it directly:

```bash
# macOS/Linux
./fontaine-preview-TARGET_SUFFIX [/path/to/script.fountain]

# Windows
./fontaine-preview-TARGET_SUFFIX.exe [/path/to/script.fountain]
```

#### Standalone Features

-   **Interactive Mode**: If no file path is provided, the app will prompt you to enter one (supports drag-and-drop from macOS Finder).
-   **Zero dependencies**: The binary runs without needing Bun or Node.js installed on the target system.
-   **Auto-Open**: Automatically opens your default browser to the preview page.
-   **Custom Port**: Use `-p` or `--port` to change the default port (4444).

## Output Examples
> Browser Rendered Preview
>
> ![preview](https://github.com/Iranon/Fontaine/blob/main/docs/images/preview.png)

> Print Preview
> 
> ![print-preview](https://github.com/Iranon/Fontaine/blob/main/docs/images/print-preview.png)
