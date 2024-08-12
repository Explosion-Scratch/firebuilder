 
 /** OTHER ***/
 /* 0360: disable Captive Portal detection
  * [1] https://www.eff.org/deeplinks/2017/08/how-captive-portals-interfere-wireless-security-and-privacy ***/
  user_pref("captivedetect.canonicalURL", "");
  user_pref("network.captive-portal-service.enabled", false); // [FF52+]
  /* 0361: disable Network Connectivity checks [FF65+]
   * [1] https://bugzilla.mozilla.org/1460537 ***/
  user_pref("network.connectivity-service.enabled", false);
 