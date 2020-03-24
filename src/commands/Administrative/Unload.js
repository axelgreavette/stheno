const { performance } = require("perf_hooks")

module.exports = {
    name: "unload",
    description: "Unload a command from the bot process",
    category: "Administrative",
    args: true,
    aliases: ["ul"],
    adminOnly: true,
    async execute(message, args, client) {
        if(args[0].toLowerCase() == "all" || args[0].toLowerCase() == "a") {
            let start = performance.now();

            let commands = client.commands.filter(c => c.category != "Administrative");

            let progress = await message.channel.send("Clearing require cache...");

            client.commands.each(async c => {
                if(c.category == "Administrative") return;

                delete require.cache[require.resolve(`../${c.ABSOLUTE_PATH}`)];
                progress.edit(`Removed \`${c.name}\` from require cache...`)
            });
            
            progress.edit("Sweeping commands...");

            client.commands.sweep(c => c.category != "Administrative");
            client.autoCommands.sweep(() => true);
            client.autoPatterns = [];

            let stop = performance.now();
            
            return progress.edit(`Done. Unloaded ${commands.size} command${commands.size > 1 ? "s" : ""} in ${(stop - start).toFixed(2)} ms.`);
        } else {
            let name = client.utils.string.capitalize(args[0]);
            
            let command = client.commands.get(args[0]);

            if(command.auto) {
                client.autoCommands.sweep(cmd => cmd.name == command.name);
                client.autoPatterns = client.autoPatterns.filter(p => !command.patterns.includes(p));
            }

            if (!command) return message.channel.send(`That command couldn't be found within my files.`);

            client.commands.delete(command.name);
            delete require.cache[require.resolve(`../${command.ABSOLUTE_PATH}`)];

            return message.channel.send(`Successfully unloaded \`${command.name}\`.`);
        }
    }
}