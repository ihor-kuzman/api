import yargs from 'yargs';

const context = require.context('./commands', true, /\.js$/);
const commands = context.keys()
    .filter(key => /^(?:\.\/(?!\.)(?=.)[^/]*?\/index\.js)$|^(?:\.\/(?!\.)(?=.)[^/]*?\.js)$/.test(key))
    .map(key => context(key));

async function main() {
    const cli = yargs
        .wrap(yargs.terminalWidth())
        .scriptName('yarn start-bin')
        .version()
        .help();

    commands.forEach(command => cli.command(command));

    if (cli.argv._.length === 0) {
        cli.showHelp();
        process.exit(1);
    }
}

main()
    .catch((err) => {
        console.error(err.stack || err);
        process.exit(1);
    });
