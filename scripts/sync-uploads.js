import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const serverUploads = path.join(rootDir, "server", "uploads");
const clientPublicUploads = path.join(rootDir, "client", "public", "uploads");

try {
  if (!fs.existsSync(serverUploads)) {
    fs.mkdirSync(serverUploads, { recursive: true });
  }
  if (!fs.existsSync(clientPublicUploads)) {
    fs.mkdirSync(clientPublicUploads, { recursive: true });
  }

  const files = fs.readdirSync(serverUploads);
  let count = 0;
  for (const file of files) {
    const src = path.join(serverUploads, file);
    const dest = path.join(clientPublicUploads, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      count++;
    }
  }
  console.log(`[sync-uploads] Synced ${count} media file(s) from server/uploads -> client/public/uploads.`);
} catch (err) {
  console.warn("[sync-uploads] Warning during uploads sync:", err.message);
}
