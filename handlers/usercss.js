import { readFileSync } from "fs";
import defaultPrefs from "../helpers/constants";
import copyFilesToProfile from "../helpers/copyFilesToProfile";
import log from "../helpers/log";
import { join } from "path";

export default function handle({
  profilePath,
  modulesPath,
  options = {},
  enabled = [],
}) {
  log.info(`Starting usercss handling for profile: ${profilePath}`);
  let out = `/* ${defaultPrefs.preamble} */\n\n\n`;

  for (let p of enabled) {
    log.debug(`usercss: Enabling module ${p}`);
    try {
      copyFilesToProfile(join(profilePath, "chrome", "css_files"), [
        join(modulesPath, p),
      ]);
      log.info(`Successfully copied module ${p} to profile`);
    } catch (error) {
      log.error(`Failed to copy module ${p} to profile: ${error.message}`);
    }
  }

  try {
    copyFilesToProfile(join(profilePath, "chrome"), [
      {
        name: "userChrome.css",
        append: true,
        content:
          `/* ${defaultPrefs.preamble} */\n\n` +
          enabled
            .map((i) => `@import url(${JSON.stringify(`css_files/${i}`)});`)
            .join("\n"),
      },
    ]);
    log.info("Successfully created or updated userChrome.css");
  } catch (error) {
    log.error(`Failed to create or update userChrome.css: ${error.message}`);
  }

  log.info("Finished usercss handling");
}
