import { parseFountain } from 'fountain-parser';
import { renderHtml, getScreenplayCss } from 'fountain-renderer';
import { watch } from 'fs';
import { resolve } from 'path';
import crypto from 'crypto';

// --- 1. Argument Parsing ---
const args = Bun.argv.slice(2);
let filePath = '';
let port = 4444;
let shouldOpen = true;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' || args[i] === '-f') {
    filePath = args[i + 1];
    i++;
  } else if (args[i] === '--port' || args[i] === '-p') {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--no-open') {
    shouldOpen = false;
  } else if (!args[i].startsWith('-') && !filePath) {
    filePath = args[i];
  }
}

// --- 2. Interactive File Path Handler ---
if (!filePath) {
  console.log(`
  🚀 Fontaine Preview
  -------------------
  No file provided. Drag and drop a .fountain file here or type the path.
  `);
}

while (!filePath) {
  const input = prompt('File path:');
  if (input === null) {
    console.log('\nOperation cancelled.');
    process.exit(0);
  }
  filePath = input.trim().replace(/^["']|["']$/g, '').trim();
  
  if (filePath) {
    const absolutePath = resolve(process.cwd(), filePath);
    if (!await Bun.file(absolutePath).exists()) {
      console.error(`❌ File not found: ${absolutePath}`);
      filePath = ''; 
    }
  }
}

const FILE_PATH = resolve(process.cwd(), filePath);
let cachedScriptHtml = '';
let cachedCss = '';

// --- 3. HTML Template ---
function renderPage(scriptHtml: string, css: string, nonce: string) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fountain Preview</title>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline';">
        <style>${css}</style>
        <script nonce="${nonce}">
          function connect() {
            const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(protocol + '//' + location.host + '/ws');
            ws.onmessage = (event) => {
              const data = JSON.parse(event.data);
              if (data.type === 'update') {
                const scrollY = window.scrollY;
                document.getElementById('content').innerHTML = data.html;
                window.scrollTo(0, scrollY);
              }
            };
            ws.onopen = () => console.log('Connected to preview server');
            ws.onclose = () => {
              console.log('Disconnected, reconnecting...');
              setTimeout(connect, 1000);
            };
          }
          connect();
        </script>
      </head>
      <body>
        <div id="content">${scriptHtml}</div>
      </body>
      </html>
    `;
}

// --- 4. Initial Content Load ---
try {
  const text = await Bun.file(FILE_PATH).text();
  cachedScriptHtml = renderHtml(parseFountain(text));
  cachedCss = getScreenplayCss();
} catch (error) {
  console.error('Initial load failed:', error);
}

// --- 5. Server Setup ---
const server = Bun.serve({
  port: port,
  fetch(req, server) {
    const url = new URL(req.url);
    
    if (url.pathname === '/ws') {
      return server.upgrade(req) ? undefined : new Response('Upgrade failed', { status: 500 });
    }
    
    if (url.pathname === '/preview') {
      const nonce = crypto.randomBytes(16).toString('base64');
      return new Response(renderPage(cachedScriptHtml, cachedCss, nonce), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Security-Policy': `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline';`
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  },
  websocket: {
    open(ws) { ws.subscribe('updates'); },
    message() {},
    close(ws) { ws.unsubscribe('updates'); }
  }
});

// --- 6. Update & Watch Logic ---
async function publishUpdates() {
  try {
    const text = await Bun.file(FILE_PATH).text();
    cachedScriptHtml = renderHtml(parseFountain(text));
    server.publish('updates', JSON.stringify({ type: 'update', html: cachedScriptHtml }));
  } catch (error) {
    console.error('Error updating content:', error);
  }
}

let watchTimeout: Timer;
watch(FILE_PATH, (event) => {
  if (event === 'change') {
    clearTimeout(watchTimeout);
    watchTimeout = setTimeout(() => {
      console.log(`Updating preview...`);
      publishUpdates();
    }, 100); 
  }
});

// --- 7. Browser Opener (Hot-Reload Safe) ---
const previewUrl = `http://localhost:${server.port}/preview`;

// globalThis persists across Bun hot-reloads
declare global { var browserOpened: boolean | undefined; }

if (shouldOpen && !globalThis.browserOpened) {
  globalThis.browserOpened = true; // Set the flag so it doesn't open again
  
  try {
    const cmd = process.platform === 'darwin' ? ['open', previewUrl] :
                process.platform === 'win32' ? ['cmd', '/c', 'start', previewUrl] :
                ['xdg-open', previewUrl];
    Bun.spawn(cmd as string[]);
  } catch (e) {
    console.error(`Please open manually: ${previewUrl}`);
  }
}

console.log(`\n🚀 Fontaine Preview Server`);
console.log(`--------------------------`);
console.log(`URL:           ${previewUrl}`);
console.log(`Watching:      ${FILE_PATH}`);
console.log(`Press Ctrl+C to stop.\n`);