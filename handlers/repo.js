import { existsSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "fs";
import defaultPrefs from "../helpers/constants";
import copyFilesToProfile from "../helpers/copyFilesToProfile";
import log from "../helpers/log";
import { exec as _exec } from "child_process";
import { promisify } from "util";
import { resolve, join, dirname } from "path";
import readJSON from "../helpers/readJson";
import { ensureFolder } from "../helpers/ensure";

const exec = promisify(_exec);

export default async function handle({
  profilePath,
  modulesPath,
  options = {},
  enabled = [],
}) {
  for (let p of enabled) {
    const repo = { ...readJSON(join(modulesPath, p)), ...(options[p] || {}) };
    if (repo.prefs) {
      for (let [k, v] of Object.entries(repo.prefs)) {
        copyFilesToProfile(profilePath, [
          {
            name: "user.js",
            append: true,
            content: `// EXT_PREF: ${
              repo.id
            }\nuser_pref("${k}", ${JSON.stringify(v)});`,
          },
        ]);
      }
    }

    const PATH = resolve(profilePath, "repos", repo.id);

    if (repo.useReleases) {
      const id = repo.url.replace(/\/$/, "").split("/").slice(-2).join("/");
      log.debug('Getting latest release for "' + id + '"');
      const tags = await fetch(
        `https://api.github.com/repos/${id}/releases/latest`
      ).then((r) => r.json());
      const url = tags.assets.find((i) =>
        i.name.startsWith(repo.useReleases)
      )?.browser_download_url;
      if (!url) {
        throw new Error("Couldn't find download url");
      }
      const ZIP_PATH = `${PATH}.zip`;
      log.info("Downloading ZIP from releases ", url);
      const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
      ensureFolder(dirname(ZIP_PATH));
      writeFileSync(ZIP_PATH, buf);
      log.info("Unzipping " + ZIP_PATH);
      await exec(
        `unzip ${JSON.stringify(ZIP_PATH)} -d ${JSON.stringify(PATH)}`
      );
      log.debug("Done unzipping, removing file " + ZIP_PATH);
      rmSync(ZIP_PATH);
    } else {
      log.info('Cloning repo "' + repo.url + '"');
      await exec(
        `git clone ${JSON.stringify(repo.url)} ${JSON.stringify(PATH)}`
      );
      log.debug("Done cloning repo");
    }
    let bypass = false;
    const custom = {
      userChrome: "customUserChrome",
      userContent: "customUserContent",
    };
    if (repo.userChrome) {
      bypass = true;
      writeFileSync(resolve(PATH, custom.userChrome + ".css"), repo.userChrome);
    }
    if (repo.userContent) {
      bypass = true;
      writeFileSync(
        resolve(PATH, custom.userContent + ".css"),
        repo.userContent
      );
    }
    const filesToLink = bypass
      ? [
          ["userChrome.css", resolve(PATH, custom.userChrome + ".css")],
          ["userContent.css", resolve(PATH, custom.userContent + ".css")],
        ]
      : [
          ["userChrome.css", resolve(PATH, "dist", "userChrome.css")],
          ["userContent.css", resolve(PATH, "dist", "userContent.css")],
          ["userChrome.css", resolve(PATH, "userChrome.css")],
          ["userContent.css", resolve(PATH, "userContent.css")],
          ["userChrome.css", resolve(PATH, "css", "userChrome.css")],
          ["userContent.css", resolve(PATH, "css", "userContent.css")],
          ["userChrome.css", resolve(PATH, "chrome", "userChrome.css")],
          ["userContent.css", resolve(PATH, "chrome", "userContent.css")],
        ];
    let alreadyDone = [];
    for (let [k, v] of filesToLink) {
      if (alreadyDone.includes(k)) {
        continue;
      }
      if (existsSync(v)) {
        log.debug(`repo: Enabling module ${p} - ${k}`);
        copyFilesToProfile(join(profilePath, "chrome"), [
          {
            name: k,
            append: true,
            content: `/* REPO: ${repo.id} - ${
              repo.url
            } - ${k} */\n@import url(${JSON.stringify(v)});`,
          },
        ]);
        alreadyDone.push(k);
      }
    }

    if (existsSync(resolve(PATH, "user.js"))) {
      copyFilesToProfile(profilePath, [
        {
          name: "user.js",
          append: true,
          content:
            "/* Imported from" +
            resolve(PATH, "user.js") +
            " */\n" +
            readFileSync(resolve(PATH, "user.js"), "utf-8"),
        },
      ]);
    }
  }
  return;
}
