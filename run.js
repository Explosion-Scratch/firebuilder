import { cpSync, lstatSync, readdirSync, readFileSync, rmdirSync } from "fs";
import { join, resolve } from "path";
import readJSON from "./helpers/readJson";
import { ensureFolder } from "./helpers/ensure";
import log from "./helpers/log";
import copyFilesToProfile from "./helpers/copyFilesToProfile";
import { profile } from "console";
import { homedir } from "os";
import contentcsshandle from "./handlers/contentcss";
import extensionshandle from "./handlers/extensions";
import repohandle from "./handlers/repo";
import userhandle from "./handlers/user";
import usercss from "./handlers/usercss";
import customjshandle from "./modules/custom-js/index";

const HANDLERS = {
  "handlers/contentcss.js": contentcsshandle,
  "handlers/extensions.js": extensionshandle,
  "handlers/repo.js": repohandle,
  "handlers/user.js": userhandle,
  "handlers/usercss.js": usercss,
  "modules/custom-js/index.js": customjshandle,
};

const exec = require("util").promisify(require("child_process").exec);

const THIS_DIR = __dirname;
const MODULE_DIR = resolve(THIS_DIR, "modules");

const directories = {
  modules: MODULE_DIR,
};

export default async function run(config) {
  console.assert(
    (await exec('echo "hello world"').then((r) => r.stdout?.trim())) ==
      "hello world",
  );
  config = {
    outputsPath: "outputs/profile",
    ...config,
  };

  if (existsSync(config.outputsPath)) {
    console.error("Outputs path already exists");
    process.exit(1);
  }

  const profilePath = resolve(config.outputsPath);

  if (config.extendProfile) {
    config.extendProfile.path = config.extendProfile.path.replace(
      /^\~/,
      homedir(),
    );
    const path = resolve(config.extendProfile.path);
    if (config.extendProfile.bookmarks && config.extendProfile.history) {
      copyFilesToProfile(profilePath, [resolve(path, "places.sqlite")]);
    }
    if (config.extendProfile.passwords) {
      copyFilesToProfile(profilePath, [resolve(path, "logins.json")]);
    }
    if (config.extendProfile.cookies) {
      copyFilesToProfile(profilePath, [
        resolve(path, "cookies.sqlite"),
        resolve(path, "cookies.sqlite-wal"),
      ]);
    }
    if (config.extendProfile.extensions) {
      copyFilesToProfile(profilePath, [
        resolve(path, "extension-preferences.json"),
        resolve(path, "extension-settings.json"),
      ]);
      cpSync(resolve(path, "extensions"), resolve(profilePath, "extensions"), {
        recursive: true,
      });
      cpSync(
        resolve(path, "extension-store"),
        resolve(profilePath, "extension-store"),
        {
          recursive: true,
        },
      );
      cpSync(
        resolve(path, "extension-store-menus"),
        resolve(profilePath, "extension-store-menus"),
        {
          recursive: true,
        },
      );
      for (let ext of readdirSync(resolve(path, "storage", "default")).filter(
        (i) => i.startsWith("moz-extension++"),
      )) {
        ensureFolder(resolve(profilePath, "storage", "default"));
        cpSync(
          resolve(path, "storage", "default", ext),
          resolve(profilePath, "storage", "default", ext),
          { recursive: true },
        );
      }
    }
  }

  const allModules = readdirSync(directories.modules)
    .filter((i) => lstatSync(join(directories.modules, i)).isDirectory())
    .map((i) => ({
      directory: resolve(join(directories.modules, i)),
      config: readJSON(join(directories.modules, i, "index.json")),
      id: i,
    }))
    .sort((a, b) => a.config.buildOrder - b.config.buildOrder);

  for (let module of allModules) {
    let { config: moduleConfig } = module;
    if (Array.isArray(config[module.id])) {
      config[module.id] = { enabled: [...config[module.id]] };
    }
    let single = !!moduleConfig.single;
    config[module.id] = config[module.id] || {};
    config[module.id] = {
      ...(single
        ? {
            isEnabled: moduleConfig.defaultEnabled,
          }
        : {
            enabled: Object.entries(moduleConfig.modules)
              .filter((i) => i[1].defaultEnabled == true)
              .map((i) => i[0]),
            options: {},
          }),
      ...(moduleConfig.defaultConfig || {}),
      ...config[module.id],
    };
    if (config[module.id]?.extend) {
      config[module.id].enabled = [
        ...config[module.id].enabled,
        ...config[module.id].extend,
      ];
    }
    if (config[module.id].isEnabled === false) {
      continue;
    }
    if (single) {
      config[module.id].enabled = ["index.js"];
      console.log(module.directory);
      moduleConfig.handler = join(directories.modules, module.id, "index.js");
    }
    config[module.id].enabled = config[module.id].enabled.map((i) => {
      console.log(i, typeof i);
      if (Array.isArray(i)) {
        config[module.id].options[i[0]] = {
          ...(config[module.id].options[i[0]] || {}),
          ...i[1],
        };
        return i[0];
      }
      return i;
    });

    log.debug(`Running module`, module.id, "with config", config[module.id]);
    const handle = HANDLERS[moduleConfig.handler];

    await handle({
      ...config[module.id],
      profilePath,
      appPath: "/Applications/Firefox.app",
      modulesPath: resolve(join(directories.modules, module.id)),
      options: config[module.id].options,
    });
  }

  if (config.prefs) {
    for (let [k, v] of Object.entries(config.prefs)) {
      copyFilesToProfile(profilePath, [
        {
          name: "user.js",
          append: true,
          content:
            "/// USER_CONFIG_PREF\n" +
            `user_pref(${JSON.stringify(k)}, ${JSON.stringify(v)});`,
        },
      ]);
    }
  }
  if (config.userChrome) {
    copyFilesToProfile(profilePath, [
      {
        name: "userChrome.css",
        append: true,
        content: "/// USER_CONFIG_CSS\n" + config.userChrome,
      },
    ]);
  }
  if (config.userContent) {
    copyFilesToProfile(profilePath, [
      {
        name: "userContent.css",
        append: true,
        content: "/// USER_CONFIG_CSS\n" + config.userContent,
      },
    ]);
  }
}
