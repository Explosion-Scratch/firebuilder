// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// HTTPS (SSL/TLS / OCSP / CERTS / HPKP)
// >>>>>>>>>>>>>>>>>>>>>
//
// Require safe negotiation
user_pref("security.ssl.require_safe_negotiation", true);
// -------------------------------------
// Disable TLS1.3 0-RTT (round-trip time) [FF51+]
user_pref("security.tls.enable_0rtt_data", false);
//
// OCSP (Online Certificate Status Protocol)
//
// Enforce OCSP fetching to confirm current validity of certificates
// 0=disabled, 1=enabled (default), 2=enabled for EV certificates only
user_pref("security.OCSP.enabled", 0); // [DEFAULT: 1]
// -------------------------------------
// Set OCSP fetch failures (non-stapled) to hard-fail [SETUP-WEB]
user_pref("security.OCSP.require", false);
//
// CERTS / HPKP (HTTP Public Key Pinning)
//
// Enable strict PKP (Public Key Pinning)
// 0=disabled, 1=allow user MiTM (default; such as your antivirus), 2=strict
user_pref("security.cert_pinning.enforcement_level", 2);
// -------------------------------------
// Disable CRLite [FF73+]
// 0 = disabled
// 1 = consult CRLite but only collect telemetry (default)
// 2 = consult CRLite and enforce both "Revoked" and "Not Revoked" results
// 3 = consult CRLite and enforce "Not Revoked" results, but defer to OCSP for "Revoked" (default)
user_pref("security.remote_settings.intermediates.enabled", false);
user_pref("security.remote_settings.intermediates.bucket", "");
user_pref("security.remote_settings.intermediates.collection", "");
user_pref("security.remote_settings.intermediates.signer", "");
user_pref("security.remote_settings.crlite_filters.enabled", false);
user_pref("security.remote_settings.crlite_filters.bucket", "");
user_pref("security.remote_settings.crlite_filters.collection", "");
user_pref("security.remote_settings.crlite_filters.signer", "");
user_pref("security.pki.crlite_mode", 0);
//
// MIXED CONTENT
//
// Disable insecure passive content (such as images) on https pages [SETUP-WEB]
// user_pref("security.mixed_content.block_display_content", true); // Defense-in-depth
// -------------------------------------
// Enable HTTPS-Only mode in all windows
user_pref("dom.security.https_only_mode", true); // [FF76+]
// user_pref("dom.security.https_only_mode_pbm", true); // [FF80+]
// -------------------------------------
// Enable HTTPS-Only mode for local resources [FF77+]
// user_pref("dom.security.https_only_mode.upgrade_local", true);
// -------------------------------------
// Disable HTTP background requests [FF82+]
user_pref("dom.security.https_only_mode_send_http_background_request", false);
// -------------------------------------
// Disable ping to Mozilla for Man-in-the-Middle detection
user_pref("security.certerrors.mitm.priming.enabled", false);
user_pref("security.certerrors.mitm.priming.endpoint", "");
user_pref("security.pki.mitm_canary_issuer", "");
user_pref("security.pki.mitm_canary_issuer.enabled", false);
user_pref("security.pki.mitm_detected", false);