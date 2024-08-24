import inquirer from "inquirer";
import { lstatSync, readdirSync, writeFileSync, existsSync, readdir } from "fs";
import meow from "meow";
import readJSON from "./helpers/readJson";
import { extname, join, resolve } from "path";
import log from "./helpers/log";
import run from "./run";
import { spawn, execSync } from "child_process";
import { parseArgs } from "util";
import { homedir, platform } from "os";
import getFirefoxPaths from "./helpers/firefoxPaths";
import files from "./asset-bundle";
import modulesList from "./helpers/allModules";
const NAME = `firefox-profile-creator`;

const { APP_PATH, PROFILES_PATH } = getFirefoxPaths();

const args = parseArgs({
  args: Bun.argv,
  options: {
    launch: {
      type: "boolean",
    },
    help: {
      type: "boolean",
      short: "h",
    },
    output: {
      type: "string",
      short: "o",
    },
  },
  allowPositionals: true,
});
const PROFILE_PATH_CLI = args.positionals[2];

const OUTPUT_PATH_CLI = args.values.output ? resolve(args.values.output) : null;

const MODULE_DIR = "modules";

const OPTIONS = Object.fromEntries(
  modulesList
    .map((i) => ({
      id: i,
      info: readJSON(join(MODULE_DIR, i, "index.json")),
    }))
    .map((i) => [i.id, i.info]),
);

const questions = [
  ...Object.entries(OPTIONS)
    .map(([k, v]) => {
      const index = readJSON(join(MODULE_DIR, k, "index.json"));

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
          const possiblejson = join(MODULE_DIR, k, k2);
          const j = {
            ...index.modules[k2],
            ...(extname(possiblejson) == ".json" ? readJSON(possiblejson) : {}),
          };
          return {
            value: k2,
            checked: !!j.defaultEnabled,
            name: `${v2.description}${fmt(
              v2.description == j.description ? null : j.description,
              " - ",
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
    type: "list",
    name: "extendProfile.path",
    when: (a) => a.extendProfile,
    message: "Choose a profile to extend",
    choices: readdirSync(PROFILES_PATH)
      .filter((i) => lstatSync(resolve(PROFILES_PATH, i)).isDirectory())
      .map((i) => ({
        value: resolve(PROFILES_PATH, i),
        name: i,
      })),
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
      }),
    ),
  },
  ...(OUTPUT_PATH_CLI
    ? []
    : [
        {
          type: "input",
          name: "outputsPath",
          default: "outputs/profile",
          message: "Profile output path",
          validate: (i) =>
            !existsSync(resolve(i)) || "Output path already exists",
        },
      ]),
];
const tc = (fn) => {
  try {
    return fn();
  } catch (e) {
    return null;
  }
};
const confirm = async (q) => {
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

const showHelp = () => {
  console.log(`
    \x1b[1mUsage:\x1b[0m
        ${NAME} [options] [config file path] [output file path]

    \x1b[33mNote: All arguments are optional, this is an interactive tool mainly.\x1b[0m

    \x1b[1mOptions:\x1b[0m
      \x1b[32m--help, -h\x1b[0m             Show this help message
      \x1b[32m--launch\x1b[0m               Launch Firefox after profile creation
      \x1b[32m--output <path>\x1b[0m        Profile output path
  `);
  process.exit(0);
};

if (args.values.help) {
  showHelp();
}

let results;
const conf_path = resolve(PROFILE_PATH_CLI || "./config.json");

if (
  existsSync(conf_path) &&
  (await confirm('Load profile config from "config.json?"'))
) {
  results = readJSON(conf_path, true);
} else {
  results = await inquirer.prompt(questions);
}

if (!results.outputsPath) {
  results.outputsPath = OUTPUT_PATH_CLI;
}

results.outputsPath = resolve(results.outputsPath);
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

if (await confirm(`Build profile to ${results.outputsPath} now?`)) {
  await run(results);
  const firefoxPath =
    tc(() => execSync("which firefox").toString().trim()) || APP_PATH;

  if (
    PROFILE_PATH_CLI ? args.values.launch : await confirm("Open firefox now?")
  ) {
    log.debug('Launching profile at "' + results.outputsPath + '"');
    setTimeout(() => process.exit(0), 1000);
    spawn(firefoxPath, ["--profile", results.outputsPath], {
      detached: true,
    });
  } else {
    console.log(
      "Run firefox as follows:\n\t" +
        `${firefoxPath || "firefox"} --profile ${results.outputsPath}`,
    );
  }
}
