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
  let out = `/* ${defaultPrefs.preamble} */\n\n\n`;

  for (let p of enabled) {
    log.debug(`usercss: Enabling module ${p}`);
    copyFilesToProfile(join(profilePath, "chrome", "content_css_files"), [
      join(modulesPath, p),
    ]);
  }
  copyFilesToProfile(join(profilePath, "chrome"), [
    {
      name: "userContent.css",
      append: true,
      content:
        `/* ${defaultPrefs.preamble} */\n\n` +
        enabled
          .map(
            (i) => `@import url(${JSON.stringify(`content_css_files/${i}`)});`,
          )
          .join("\n"),
    },
  ]);
}
