import fileSystem from "../asset-bundle.js";

export default function readFile(path) {
  const file = fileSystem[path.replace("modules/", "")];
  if (!file) {
    throw new Error(`File not found: ${path}`);
  }
  return file;
}
