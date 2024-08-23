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
  let out = `/* ${defaultPrefs.preamble} */\n\n\n`;

  for (let p of enabled) {
    log.debug(`userjs: Enabling module ${p}`);
    out += `/// BEGIN_MODULE: ${p}\n${
      readFile(`${modulesPath}/${p}`)?.trim() ||
      "/// ERROR: Couldn't find module " + p
    }\n/// END_MODULE: ${p}\n\n`;
  }
  copyFilesToProfile(profilePath, [
    {
      name: "user.js",
      append: true,
      content: out,
    },
  ]);
}
