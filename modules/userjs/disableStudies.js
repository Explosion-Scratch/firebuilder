 /** STUDIES ***/
 /* 0340: disable Studies
  * [SETTING] Privacy & Security>Firefox Data Collection & Use>Allow Firefox to install and run studies ***/
 user_pref("app.shield.optoutstudies.enabled", false);
 /* 0341: disable Normandy/Shield [FF60+]
  * Shield is a telemetry system that can push and test "recipes"
  * [1] https://mozilla.github.io/normandy/ ***/
 user_pref("app.normandy.enabled", false);
 user_pref("app.normandy.api_url", "");
