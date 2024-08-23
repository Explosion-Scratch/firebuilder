import { appendFileSync, cpSync, writeFileSync } from "fs";
import defaultPrefs from "./constants";
import { ensureFile, ensureFolder } from "./ensure";
import { join, dirname, basename } from "path";
import readFile from "./readFile";

export default function copyFilesToProfile(profilePath, files = []) {
  const dest = join(profilePath);
  ensureFolder(dest);
  for (let file of files) {
    if (typeof file === "string" && file.startsWith("modules/")) {
      file = {
        content: readFile(file),
        name: basename(file),
      };
    }

    if (typeof file === "object" && file.content && file.name) {
      const p = join(dest, file.name);
      ensureFolder(dirname(p));
      if (file.append) {
        ensureFile(p);
        appendFileSync(p, "\n" + file.content);
      } else {
        writeFileSync(p, file.content);
      }
    } else {
      cpSync(file, join(dest, basename(file)));
    }
  }
}
