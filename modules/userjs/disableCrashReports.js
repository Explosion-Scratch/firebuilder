 /** CRASH REPORTS ***/
 /* 0350: disable Crash Reports ***/
 user_pref("breakpad.reportURL", "");
 user_pref("browser.tabs.crashReporting.sendReport", false); // [FF44+]
    // user_pref("browser.crashReports.unsubmittedCheck.enabled", false); // [FF51+] [DEFAULT: false]
 /* 0351: enforce no submission of backlogged Crash Reports [FF58+]
  * [SETTING] Privacy & Security>Firefox Data Collection & Use>Allow Firefox to send backlogged crash reports  ***/
 user_pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false); // [DEFAULT: false]
