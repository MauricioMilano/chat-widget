const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const isWatch = process.argv.includes("--watch");

// Load .env file
function loadEnv() {
  const envPath = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    console.warn("Warning: .env file not found. Using placeholders.");
    return {};
  }
  const env = {};
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    env[key.trim()] = valueParts.join("=").trim();
  }
  return env;
}

// Replace placeholders in test/index.html and write to a separate output file
function prepareTestPage(env) {
  const htmlPath = path.resolve(__dirname, "test/index.html");
  if (!fs.existsSync(htmlPath)) return;

  let html = fs.readFileSync(htmlPath, "utf-8");
  html = html.replace(
    "__CHAT_WIDGET_BASE_URL__",
    env.CHAT_WIDGET_BASE_URL || "https://your-n8n-instance.com",
  );
  html = html.replace("__CHAT_WIDGET_AUTH__", env.CHAT_WIDGET_AUTH || "");
  const outputPath = path.resolve(__dirname, "test/index.dev.html");
  fs.writeFileSync(outputPath, html, "utf-8");
  console.log(`Test page prepared with env values -> ${outputPath}`);
}

const buildConfig = {
  entryPoints: [path.resolve(__dirname, "src/index.ts")],
  bundle: true,
  outfile: path.resolve(__dirname, "dist/chat-widget.js"),
  minify: true,
  sourcemap: !isWatch,
  target: ["es2020"],
  format: "iife",
  treeShaking: true,
  legalComments: "none",
};

async function build() {
  const env = loadEnv();

  // Prepare test page with env values
  if (!isWatch) {
    prepareTestPage(env);
  }

  if (isWatch) {
    const ctx = await esbuild.context(buildConfig);
    await ctx.watch();
    console.log("Watching for changes...");
  } else {
    await esbuild.build(buildConfig);
    console.log("Build complete: dist/chat-widget.js");
  }
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
