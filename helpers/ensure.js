import fs from 'fs';

export function ensureFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "");
  }
}
export function ensureFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}
