#!/bin/sh
# detect architecture
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
EXT=""

# Common bun targets: bun-darwin-arm64, bun-darwin-x64, bun-linux-arm64, bun-linux-x64, bun-windows-x64
if [ "$OS" = "darwin" ]; then
    if [ "$ARCH" = "arm64" ]; then
        TARGET="bun-darwin-arm64"
    else
        TARGET="bun-darwin-x64"
    fi
elif [ "$OS" = "linux" ]; then
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        TARGET="bun-linux-arm64"
    else
        TARGET="bun-linux-x64"
    fi
elif echo "$OS" | grep -qE "mingw|msys|cygwin|windows"; then
    TARGET="bun-windows-x64"
    EXT=".exe"
else
    echo "Unsupported OS: $OS"
    exit 1
fi

TARGET_SUFFIX=${TARGET#bun-}
echo "Compiling for target: $TARGET -> fontaine-preview-$TARGET_SUFFIX$EXT"
bun build --compile --minify --target=$TARGET ./src/server.ts --outfile "fontaine-preview-$TARGET_SUFFIX$EXT"
