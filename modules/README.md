# Modules
This directory stores all info that is then read by [handlers](handlers) in order to mod firefox accordingly.

Each folder should contain:
- `index.json`: Configures how this module should run and which features are enabled by default (see [CONTRIBUTING.md](CONTRIBUTING.md) for a detailed explanation
- A bunch of files with actual content, e.g. `userjs/blockImplicitOutbound.js` contains code that is concatenated on top of the user.js in firefox's profile directory (that is built by [handlers/user.js](handlers/user.js))
- [Optional]: If your module adds only one thing, e.g. enabling support for .uc.js scripts (as seen in [customjs](customjs/index.js)) then add a handler for it in the same directory in `index.js`.
