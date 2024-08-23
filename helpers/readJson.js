import { readFileSync } from "fs";
import readFile from "./readFile";

export default function readJSON(file, native = false) {
  try {
    const fileContent = (native ? readFileSync(file, "utf-8") : readFile(file))
      .split("\n")
      .filter((i) => !i.trim().startsWith("//"))
      .join("\n");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error(e);
    console.log("Error reading " + file);
    return {};
  }
}
