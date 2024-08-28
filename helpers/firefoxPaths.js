import { platform, homedir } from "os";
import { join, resolve, existsSync } from "path";

export default function getFirefoxPaths() {
  const os = platform();
  if (os === "darwin") {
    return {
      APP_PATH: join(
        "/Applications",
        "Firefox.app",
        "Contents",
        "MacOS",
        "firefox",
      ),
      PROFILES_PATH: resolve(
        homedir(),
        "Library",
        "Application Support",
        "Firefox",
        "Profiles",
      ),
      RESOURCES_PATH: "/Applications/Firefox.app/Contents/Resources",
    };
  } else if (os === "win32") {
    return {
      APP_PATH: join(
        process.env.PROGRAMFILES,
        "Mozilla Firefox",
        "firefox.exe",
      ),
      PROFILES_PATH: resolve(
        process.env.APPDATA,
        "Mozilla",
        "Firefox",
        "Profiles",
      ),
      RESOURCES_PATH: join(process.env.PROGRAMFILES, "Mozilla Firefox"),
    };
  } else {
    const linuxResourcesPath = existsSync("/usr/lib/firefox")
      ? "/usr/lib/firefox"
      : "/usr/lib64/firefox";
    return {
      APP_PATH: "/usr/bin/firefox",
      PROFILES_PATH: resolve(homedir(), ".mozilla", "firefox"),
      RESOURCES_PATH: linuxResourcesPath,
    };
  }
}
