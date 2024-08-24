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
  log.info(`Starting handle function with ${enabled.length} enabled modules`);
  let out = `/* ${defaultPrefs.preamble} */\n\n\n`;

  for (let p of enabled) {
    log.debug(`usercss: Enabling module ${p}`);
    try {
      copyFilesToProfile(join(profilePath, "chrome", "content_css_files"), [
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
        name: "userContent.css",
        append: true,
        content:
          `/* ${defaultPrefs.preamble} */\n\n` +
          enabled
            .map(
              (i) =>
                `@import url(${JSON.stringify(`content_css_files/${i}`)});`,
            )
            .join("\n"),
      },
    ]);
    log.info("Successfully created userContent.css");
  } catch (error) {
    log.error(`Failed to create userContent.css: ${error.message}`);
  }

  log.debug("handle function completed");
}
