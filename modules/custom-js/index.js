import { mkdtempSync, cpSync, rmdirSync } from "fs";
import { exec as _exec } from "child_process";
import { promisify } from "util";
import { resolve, join, basename } from "path";
import readJSON from "../../helpers/readJson";
import onExit from "../../helpers/onExit";
import getFirefoxPaths from "../../helpers/firefoxPaths";

const exec = promisify(_exec);

export default async function handle({
  profilePath,
  modulesPath,
  options = {},
  appPath,
  enabled = [],
}) {
  const folder = resolve(mkdtempSync());
  const sourcesFolder = resolve(mkdtempSync());
  onExit(() => {
    rmdirSync(folder, { recursive: true });
  });
  onExit(() => {
    rmdirSync(sourcesFolder, { recursive: true });
  });
  await exec(
    `git clone "https://github.com/MrOtherGuy/fx-autoconfig" ${JSON.stringify(
      folder,
    )}`,
  );
  const resources = getFirefoxPaths().RESOURCES_PATH;
  cpSync(join(folder, "program"), resources, { recursive: true });
  cpSync(join(folder, "profile", "chrome"), resolve(profilePath, "chrome"), {
    recursive: true,
  });
  const prefs = { ...readJSON(resolve(modulesPath, "index.json")), ...options };
  for (let [url, details] of Object.entries(prefs.sources)) {
    const dest = resolve(sourcesFolder, details.id || details.name);
    await exec(`git clone ${JSON.stringify(url)} ${JSON.stringify(dest)}`);
    for (let file of details.enabled) {
      cpSync(
        join(dest, file),
        join(profilePath, "chrome", "JS", basename(file)),
      );
    }
  }
  console.log({
    folder,
  });
}
