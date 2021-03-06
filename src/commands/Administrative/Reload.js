const { join } = require("path");
const { performance } = require("perf_hooks");

module.exports = {
    name: "reload",
    description: "Reload a command within the bot process",
    category: "Administrative",
    args: true,
    usage: "<command|all>",
    aliases: ["rl"],
    adminOnly: true,
    async execute(message, args, client) {
        if(args[0].toLowerCase() == "all" || args[0].toLowerCase() == "a") {
            let start = performance.now();

            let progress = await message.channel.send("Sweeping Commands...");

            let toReload = client.commands.array();

            client.commands.sweep(() => true);

            progress.edit("Commands swept. Scraping command directories...");

            toReload.forEach(c => {
                delete require.cache[require.resolve(`../${c.ABSOLUTE_PATH}`)];
                const cmd = require(`../${c.ABSOLUTE_PATH}`);
                if(!client.configs.rawCategories.Valid.includes(cmd.category.toUpperCase())) return message.channel.send(`${cmd.name}'s category must match one of ${client.configs.rawCategories.Valid}. Got ${cmd.category} instead.`);
                cmd.ABSOLUTE_PATH = c.ABSOLUTE_PATH;
                client.commands.set(cmd.name, cmd);
            });
 
            let stop = performance.now();

            return progress.edit(`Done. Reloaded ${toReload.length} command${toReload.length > 1 ? "s" : ""} in ${(stop - start).toFixed(2)} ms. It's recommended you run \`s$rebuild_auto\` now.`);
        } else {          
            let command = client.commands.get(args[0]);

            if (!command) return message.channel.send(`That command couldn't be found within my processes. Try loading it with \`s$load ${args[0]}\``);

            delete require.cache[require.resolve(`../${command.ABSOLUTE_PATH}`)];
            client.commands.delete(command.name);

            const cmd = require(join(client.commandPath, `${command.ABSOLUTE_PATH}`));

            if(!client.configs.rawCategories.Valid.includes(cmd.category.toUpperCase())) return message.channel.send(`${cmd.name}'s category must match one of ${client.configs.rawCategories.Valid}. Got ${cmd.category} instead.`);

            cmd.ABSOLUTE_PATH = command.ABSOLUTE_PATH;
            client.commands.set(cmd.name, cmd);

            return message.channel.send(`Successfully reloaded \`${cmd.name}\`. It's recommended you run \`s$rebuild_auto\` now.`);
        }
    }
};