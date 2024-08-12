/* 0000: disable about:config warning ***/
user_pref("browser.aboutConfig.showWarning", false);
/* 0105: disable sponsored content on Firefox Home (Activity Stream)
 * [SETTING] Home>Firefox Home Content ***/
user_pref("browser.newtabpage.activity-stream.showSponsored", false); // [FF58+]
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false); // [FF83+] Shortcuts>Sponsored shortcuts
/* 0106: clear default topsites
 * [NOTE] This does not block you from adding your own ***/
user_pref("browser.newtabpage.activity-stream.default.sites", "");

user_pref("browser.legacyUserProfileCustomizations.stylesheets", true);
user_pref("widget.macos.titlebar-blend-mode.behind-window", true);
user_pref("browser.theme.macos.native-theme", true);
user_pref("layers.acceleration.force-enabled", true);
user_pref("gfx.webrender.all", true);
user_pref("svg.context-properties.content.enabled", true);
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);