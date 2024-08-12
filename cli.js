import inquirer from "inquirer";
import { lstatSync, readdirSync, writeFileSync, existsSync } from "fs";
import meow from "meow";
import readJSON from "./helpers/readJson";
import { extname, join, resolve } from "path";
import log from "./helpers/log";
import run from "./run";
import { spawn, execSync } from "child_process";
import { parseArgs } from "util";

const NAME = `firefox-profile-creator`;
const args = parseArgs({
  args: Bun.argv,
  options: {
    launch: {
      type: "boolean",
    },
  },
  allowPositionals: true,
});
const PROFILE_PATH_CLI = args.positionals[2];

const OPTIONS = Object.fromEntries(
  readdirSync("modules")
    .filter((i) => lstatSync(join("modules", i)).isDirectory())
    .map((i) => ({
      id: i,
      info: readJSON(join("modules", i, "index.json")),
    }))
    .map((i) => [i.id, i.info])
);

const questions = [
  ...Object.entries(OPTIONS)
    .map(([k, v]) => {
      const index = readJSON(join("modules", k, "index.json"));

      if (!v.modules) {
        return {
          type: "confirm",
          message: "Enable " + v.title,
          default: !!index.defaultEnabled,
          name: k + ".isEnabled",
        };
      }
      const fmt = (str, pref) => (str ? `${pref}${str}` : "");
      if (!Object.keys(v.modules).length) {
        return null;
      }
      return {
        type: "checkbox",
        name: k + ".enabled",
        message: v.title,
        loop: false,
        choices: Object.entries(v.modules).map(([k2, v2]) => {
          const possiblejson = join("modules", k, k2);
          const j = {
            ...index.modules[k2],
            ...(extname(possiblejson) == ".json" ? readJSON(possiblejson) : {}),
          };
          return {
            value: k2,
            checked: !!j.defaultEnabled,
            name: `${v2.description}${fmt(
              v2.description == j.description ? null : j.description,
              " - "
            )}`,
          };
        }),
      };
    })
    .filter(Boolean),
  {
    type: "confirm",
    name: "extendProfile",
    message: "Extend an existing firefox profile?",
    default: false,
  },
  {
    type: "input",
    name: "extendProfile.path",
    when: (a) => a.extendProfile,
    message:
      "Enter the path to the profile to extend, e.g. ~/Library/Application Support/Firefox/Profiles/...",
  },
  {
    type: "checkbox",
    when: (a) => a.extendProfile?.path,
    message:
      "Which parts of the old profile should be copied to the new profile?",
    loop: false,
    name: "extendProfile.choices",
    choices: ["bookmarks", "history", "passwords", "cookies", "extensions"].map(
      (i) => ({
        value: i,
        checked: i !== "cookies",
        name: i[0].toUpperCase() + i.slice(1),
      })
    ),
  },
  {
    type: "input",
    name: "outputsPath",
    default: "outputs/profile",
    message: "Profile output path",
  },
];
const tc = (fn) => {
  try {
    return fn();
  } catch (e) {
    return null;
  }
};
const confirm = async (q) => {
  // If run like bun cli.js ~/Downloads/config.json
  if (PROFILE_PATH_CLI) {
    return true;
  }
  return await inquirer
    .prompt([
      {
        type: "confirm",
        name: "conf",
        message: q,
      },
    ])
    .then((a) => a.conf);
};

let results;
const conf_path = PROFILE_PATH_CLI || "config.json";

if (
  existsSync(conf_path) &&
  (await confirm('Load profile config from "config.json?"'))
) {
  results = readJSON(conf_path);
} else {
  results = await inquirer.prompt(questions);
}

if (!results.outputsPath) {
  results.outputsPath = "outputs/profile";
}
if (results.extendProfile) {
  results.extendProfile = {
    path: results.extendProfile.path,
    ...(results.extendProfile.choices
      ? Object.fromEntries(results.extendProfile.choices.map((i) => [i, true]))
      : results.extendProfile),
  };
}

log.info("Writing profile config to " + resolve("./config.json"));
writeFileSync("config.json", JSON.stringify(results, null, 2));

if (await confirm(`Build profile to ${resolve(results.outputsPath)} now?`)) {
  await run(results);
  if (
    PROFILE_PATH_CLI ? args.values.launch : await confirm("Open firefox now?")
  ) {
    log.debug('Launching profile at "' + results.outputsPath + '"');
    const firefoxPath =
      tc(() => execSync("which firefox").toString().trim()) ||
      "/Applications/Firefox.app/Contents/MacOS/firefox";
    setTimeout(() => process.exit(0), 1000);
    spawn(firefoxPath, ["--profile", results.outputsPath], {
      detached: true,
    });
  }
}
// const cli = meow(
//   `
//     Usage:
//         $: ${NAME} [options] [output path]

//     Options:\n${Object.entries(OPTIONS)
//       .map((i) => `      ${`--${i[0]}:`.padEnd(20, " ")} ${i[1].title}`)
//       .join("\n")}
// `,
//   {
//     importMeta: import.meta,
//   }
// );
