# Contributing to this project

## CLI:

- The CLI uses inquirer to build a configuration file. See the code at [cli.js](cli.js)

## Code flow:

1. Config is ingested in [run.js](run.js) and parsed. This includes transforming some things, applying defaults to modules, etc
2. For each "module" the proper handler for it is imported from [handlers](handlers/README.md)
3. The enabled modules (from config) (see [examples](examples)) are then passed to the handler. Ideally handlers will read the .enabled and mod the firefox profile directory somehow, see (handlers/README.md) for more info

## Modules

Modules are stored in the [modules/whatever](modules) folder. Inside these folders there can be files (of any type) whoose selected filenames are then passed to `handlers/whatever.js`. `index.json` should have info for each module:

```jsonc
{
  "title": "Title of your new addition, e.g. Custom CSS",
  "description": "An optional description shown in the CLI",
  // This is used in the config file, so {"an-id-here": {"enabled": [filelist]}}
  "id": "an-id-here",
  // Whether to enable this module
  "defaultEnabled": false,
  // Single means that the handler is index.js IN THE MODULE directory not in handlers, use for things that are one feature not a select multiple
  "single": false,
  // Modules are sorted by buildOrder, lower = first, try to keep it in multiples of 10 for the future's sake
  "buildOrder": 10,
  // Modules and what they do
  "modules": {
    "filename.js": {
        "defaultEnabled": true,
        "description": "What it does"
    }
  }
}
```
