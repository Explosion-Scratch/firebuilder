import defaultPrefs from "../helpers/constants";
import copyFilesToProfile from "../helpers/copyFilesToProfile";
import log from "../helpers/log";
import readFile from "../helpers/readFile";

export default function handle({
  profilePath,
  modulesPath,
  options = {},
  enabled = [],
}) {
  log.info("Starting userjs handling");
  let out = `/* ${defaultPrefs.preamble} */\n\n\n`;

  for (let p of enabled) {
    log.debug(`userjs: Enabling module ${p}`);
    const moduleContent = readFile(`${modulesPath}/${p}`);
    if (moduleContent) {
      out += `/// BEGIN_MODULE: ${p}\n${moduleContent.trim()}\n/// END_MODULE: ${p}\n\n`;
    } else {
      log.error(`Couldn't find module ${p}`);
      out += `/// ERROR: Couldn't find module ${p}\n\n`;
    }
  }

  log.info("Copying files to profile");
  try {
    copyFilesToProfile(profilePath, [
      {
        name: "user.js",
        append: true,
        content: out,
      },
    ]);
    log.debug("Files copied successfully");
  } catch (error) {
    log.error("Error copying files to profile:", error);
  }

  log.info("userjs handling completed");
}
