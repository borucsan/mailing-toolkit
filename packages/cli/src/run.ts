import { MailingToolkit } from "./MailingToolkit";

(async () => {
    const toolkit = MailingToolkit.init(process.argv.slice(2));
    try {
      const result = await toolkit.run();
      if (result && result.constructor &&
          result.constructor.name === 'CommandResult') {
        process.exit(result.exitCode);
      }
    } catch (err: any) {
      console.error('cli runtime exception: ' + err);
      if (err.stack) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  })();