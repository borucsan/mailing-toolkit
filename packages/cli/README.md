# Mailing-Toolkit CLI

The command-line tool for developers to work on creating HTML emails templates.

## Commands
- **serve** - Start the web dev server(https://modern-web.dev/docs/dev-server/overview/) with found HTML files
- **validate** - Lint the HTML files in the current directory with ESLint
- **send** - Send the email to the specified email address(in config file or as an argument) via selected service()
- **spaceimage** - Generate a space image with the specified width and height
- **start** - Combine all commands in one interactive mode.
- **config** - Open the configuration file in the default editor(create if not exists)
- **maildev** - Start the maildev server(https://github.com/maildev/maildev)
- **text** - Creates a text version of the HTML file(in development)
- **help** - Display help for the CLI or a specific command


## Installation
<!-- 
```bash
$ yarn global add mailing-toolkit-cli
# or...
$ npm install -g mailing-toolkit-cli -->