import chokidar from 'chokidar';

class WatchTrigger {
    private watcher: chokidar.FSWatcher;
    static events = ["ready", "add", "change", "error"]

    constructor(paths: string | string[], options: chokidar.WatchOptions = {}) {
        this.watcher = chokidar.watch(paths, options);
    }

    on(event: string, listener: (...args: any[]) => void){
        if (!WatchTrigger.events.includes(event)) {
            throw new Error(`Event ${event} not supported`);
        }
        this.watcher.on(event, listener);
        return this;
    }

    close() {
        this.watcher.close();
    }
}

export default WatchTrigger;

/* export function watch(paths: string | string[]){
    const watcher = createWatcher(paths);

    return (
        watcher
          .on('ready', async () => {
            console.debug('Ready');
            await lint(opts, [...flags, ...dirs]);
          })
          .on('add', (dir) => logger.debug(`${dir} added.`))
          .on(
            'change',
            
              if (cacheLocation === filePath) {
                return;
              }
  
              if (!opts.ext.includes(path.extname(filePath))) {
                logger.debug(`Watch: Skipping ${filePath}`);
                return;
              }
  
              logger.debug('Detected change:', filePath);
              const changed = opts.changed ? [filePath] : opts._;
  
              await lint(opts, [...flags, ...changed]);
            }, opts.watchDelay || 300)
          )
          .on('error', (err) => logger.error(err))
      );
} */