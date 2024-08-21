# Handlers Directory

This directory contains handlers for various Firefox profile customizations.

## Handlers

### extensions.js
Installs and configures Firefox extensions.

* Downloads extensions from Mozilla Add-ons
* Installs extensions to the Firefox profile
* Configures extension settings

### user.js
Generates a `user.js` file for the Firefox profile.

* Enables user.js modules
* Appends module content to the `user.js` file

### usercss.js
Generates a `userChrome.css` file for the Firefox profile.

* Enables user.css modules
* Copies module files to the `css_files` directory
* Appends `@import` statements to the `userChrome.css` file

### contentcss.js
Generates a `userContent.css` file for the Firefox profile.

* Enables content.css modules
* Copies module files to the `content_css_files` directory
* Appends `@import` statements to the `userContent.css` file

## Creating your own handler:
- Handlers should be named similar to the modules, but basically:

```js
export default async function handle({
  // Path to the firefox profile being created
  profilePath,
  // An absolute path to the firefox app
  appPath,
  // Path to /modules
  modulesPath,
  /*
  Miscellaneous options passed in the following form in config:

  {
    // Modules for this should be found in /modules/yourhandlename/[file].[ext]
    "yourhandlername": {
        "enabled": [filenames here],
        "options": {
            "Passed here"
        }
    }
  }
  */
  options = {},
  enabled = [],
}) {
    // Your code here
}
``` 