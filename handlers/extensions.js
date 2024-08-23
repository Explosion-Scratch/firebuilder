import { dirname, join } from "path";
import defaultPrefs from "../helpers/constants";
import copyFilesToProfile from "../helpers/copyFilesToProfile";
import log from "../helpers/log";
import readJSON from "../helpers/readJson";

const defaultExtensions = {
  "formautofill@mozilla.org": "647ab118-a5e4-43c4-90e3-411d4e5155fe",
  "pictureinpicture@mozilla.org": "882abc45-e743-4032-9766-4571e5dae35d",
  "screenshots@mozilla.org": "11098328-de4a-4b76-a17e-b26039cae0cc",
  "webcompat-reporter@mozilla.org": "6ec2ebcc-1aa1-4fa5-a339-68fec0201ea9",
  "webcompat@mozilla.org": "0b52c378-083f-4fbf-98ee-1c1166674cc6",
  "default-theme@mozilla.org": "35c104e7-5b2b-4d06-a440-5cfede7cc8dd",
  "addons-search-detection@mozilla.com": "b138d06f-2e3c-4a31-8329-f03604fd5430",
};

export default async function handle({
  profilePath,
  appPath,
  modulesPath,
  options = {},
  enabled = [],
}) {
  //   const policiesPath = join(appPath, "Contents", "Resources", "policies.json");
  //   let policies = readJSON(policiesPath);

  //   policies = {
  //     ...policies,
  //     ExtensionUpdate: true,
  //   };
  //   policies.ExtensionSettings = policies.ExtensionSettings || {};

  let out = "/// BEGIN EXTENSIONS\n";
  let prefs = {
    "extensions.webextensions.uuids": {},
  };
  for (let extension of enabled) {
    const ext = {
      ...readJSON(join(modulesPath, extension)),
      ...(options[extension] || {}),
    };
    if (ext.prefs) {
      for (let [k, v] of Object.entries(ext.prefs)) {
        copyFilesToProfile(profilePath, [
          {
            name: "user.js",
            append: true,
            content: `// EXT_PREF: ${
              ext.id
            }\nuser_pref("${k}", ${JSON.stringify(v)});`,
          },
        ]);
      }
    }
    const install_url = `https://addons.mozilla.org/firefox/downloads/latest/${ext.slug}/platform:3/${ext.slug}.xpi`;
    // Download the extension
    const buff = await fetch(install_url).then((r) => r.arrayBuffer());
    copyFilesToProfile(profilePath, [
      {
        name: `extensions/${ext.id}.xpi`,
        content: Buffer.from(buff),
      },
    ]);
    // policies.ExtensionSettings[ext.id] = {
    //   install_url,
    //   installation_mode: "force_installed",
    // };
    prefs["extensions.webextensions.uuids"][ext.id] = ext.uuid;
    prefs[`extensions.webextensions.ExtensionStorageIDB.migrated.${ext.id}`] =
      true;
  }
  prefs["extensions.webextensions.uuids"] = JSON.stringify({
    ...defaultExtensions,
    ...prefs["extensions.webextensions.uuids"],
  });
  out += Object.entries(prefs)
    .map(([pref, val]) => `user_pref("${pref}", ${JSON.stringify(val)});`)
    .join("\n");
  out += "\n/// END EXTENSIONS";

  copyFilesToProfile(profilePath, [
    {
      name: "user.js",
      append: true,
      content: out,
    },
  ]);
  //   copyFilesToProfile(dirname(policiesPath), [
  //     {
  //       name: "policies.json",
  //       content: JSON.stringify(policies, null, 2),
  //     },
  //   ]);
}
