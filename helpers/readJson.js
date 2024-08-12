import { readFileSync } from "fs";
export default function readJSON(file) {
  try {
    const fileContent = readFileSync(file, "utf-8")
      .split("\n")
      .filter((i) => !i.trim().startsWith("//"))
      .join("\n");
    return JSON.parse(fileContent);
  } catch (e) {
    console.log("Error reading " + file);
    return {};
  }
}
