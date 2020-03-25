const { join } = require("path");
const { readdirSync } = require("fs");
const { performance } = require("perf_hooks")

module.exports = {
    name: "load",
    description: "Load a command into the bot process",
    category: "Administrative",
    usage: "<command|all>",
    args: true,
    aliases: ["l"],
    adminOnly: true,
    async execute(message, args, client) {
        if(args[0].toLowerCase() == "all" || args[0].toLowerCase() == "a") {
            let start = performance.now();

            let progress = await message.channel.send("Scraping command directories...");

            let Commands = [];
            let newCommands = 0;

            client.utils.bot.getDirectories(join(__dirname, "..")).forEach(d => {
                let commands = readdirSync(join(__dirname, "..", d)).filter(file => file.endsWith(".js")).map(path => `${d}/${path}`);
                Commands = Commands.concat(...commands);
                progress.edit(`Scraped ${commands.length} commands from directories. Reloading them...`);
            });

            Commands.forEach(c => {
                const cmd = require(`../${c}`);
                
                if(client.commands.get(cmd.name)) return;
                if (!client.configs.Categories.Valid.includes(cmd.category.toUpperCase())) return message.channel.send(`${cmd.name}'s category must match one of ${client.configs.Categories.Valid}. Got ${cmd.category} instead.`);
                if(cmd.auto && cmd.patterns) {
                    cmd.patterns.forEach(p => {
                        client.autoCommands.set(p, cmd);
                        client.autoPatterns.push(p);
                    });
                }
                
                cmd.ABSOLUTE_PATH = c;
                client.commands.set(cmd.name, cmd);
                newCommands++;
            });

            let stop = performance.now();

            return progress.edit(`Done. Loaded ${newCommands} new command${newCommands > 1 ? "s" : ""} in ${(stop - start).toFixed(2)} ms. It's recommended you run \`s$rebuild_auto\` now.`);

        } else {
            let name = client.utils.string.capitalize(args[0]);
            let Commands = [];

            if(client.commands.get(args[0])) return message.channel.send("That command has already been loaded.")

            client.utils.bot.getDirectories(join(__dirname, "..")).forEach(d => {
                let commands = readdirSync(join(__dirname, "..", d)).filter(file => file.endsWith(".js")).map(path => `${d}/${path}`);
                Commands = Commands.concat(...commands);
            });

            let [path] = Commands.filter(c => c.endsWith(`/${name}.js`));
            delete require.cache[require.resolve(`../${path}`)];
            
            let cmd = require(`../${path}`);

            if(cmd.auto && cmd.patterns) {
                cmd.patterns.forEach(p => {
                    client.autoCommands.set(p, cmd);
                    client.autoPatterns.push(p);
                });
            }

            if (!client.configs.Categories.Valid.includes(cmd.category.toUpperCase())) return message.channel.send(`${cmd.name}'s category must match one of ${client.configs.Categories.Valid}. Got ${cmd.category} instead.`);

            cmd.ABSOLUTE_PATH = path;
            client.commands.set(cmd.name, cmd);

            return message.channel.send(`Successfully loaded \`${cmd.name}\`. It's recommended you run \`s$rebuild_auto\` now.`);
        }
    }
}