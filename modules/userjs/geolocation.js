 /*** [SECTION 0200]: GEOLOCATION ***/
 /* 0201: use Mozilla geolocation service instead of Google if permission is granted [FF74+]
  * Optionally enable logging to the console (defaults to false) ***/
 user_pref("geo.provider.network.url", "https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%");
    // user_pref("geo.provider.network.logging.enabled", true); // [HIDDEN PREF]
 /* 0202: disable using the OS's geolocation service ***/
 user_pref("geo.provider.ms-windows-location", false); // [WINDOWS]
 user_pref("geo.provider.use_corelocation", false); // [MAC]
 user_pref("geo.provider.use_gpsd", false); // [LINUX] [HIDDEN PREF]
 user_pref("geo.provider.use_geoclue", false); // [FF102+] [LINUX]
