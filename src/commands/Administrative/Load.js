const { join } = require("path");
const { readdirSync } = require("fs");

module.exports = {
    name: "load",
    description: "Load a command into the bot process",
    category: "Administrative",
    args: true,
    aliases: ["l"],
    adminOnly: true,
    async execute(message, args, client, logger) {
        if(args[0].toLowerCase() == "all" || args[0].toLowerCase() == "a") {
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
                
                cmd.ABSOLUTE_PATH = c;
                client.commands.set(cmd.name, cmd);
                newCommands++;
            });

            return progress.edit(`Successfully loaded ${newCommands} new command${newCommands > 1 ? "s" : ""}.`);

        } else {
            let name = args[0].replace(/^\w/, c => c.toUpperCase());
            let Commands = [];

            if(client.commands.get(args[0])) return message.channel.send("That command has already been loaded.")

            client.utils.bot.getDirectories(join(__dirname, "..")).forEach(d => {
                let commands = readdirSync(join(__dirname, "..", d)).filter(file => file.endsWith(".js")).map(path => `${d}/${path}`);
                Commands = Commands.concat(...commands);
            });

            let [path] = Commands.filter(c => c.endsWith(`/${name}.js`));
            delete require.cache[require.resolve(`../${path}`)];
            
            let cmd = require(`../${path}`);

            if (!client.configs.Categories.Valid.includes(cmd.category.toUpperCase())) return message.channel.send(`${cmd.name}'s category must match one of ${client.configs.Categories.Valid}. Got ${cmd.category} instead.`);

            cmd.ABSOLUTE_PATH = path;
            client.commands.set(cmd.name, cmd);

            return message.channel.send(`Successfully loaded \`${cmd.name}\`.`);
        }
    }
}