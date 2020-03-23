module.exports = {
    name: "unload",
    description: "Unload a command from the bot process",
    category: "Administrative",
    args: true,
    aliases: ["ul"],
    adminOnly: true,
    async execute(message, args, client, logger) {
        if(args[0].toLowerCase() == "all" || args[0].toLowerCase() == "a") {
            let commands = client.commands.filter(c => c.category != "Administrative");

            let progress = await message.channel.send("Clearing require cache...");

            client.commands.each(async c => {
                if(c.category == "Administrative") return;

                delete require.cache[require.resolve(`../${c.ABSOLUTE_PATH}`)];
                progress.edit(`Removed \`${c.name}\` from require cache...`)
            });
            
            progress.edit("Sweeping commands...");

            client.commands.sweep(c => c.category != "Administrative");

            progress.edit(`Successfully unloaded ${commands.size} command${commands.size > 1 ? "s" : ""}.`);
        } else {
            let name = args[0].replace(/^\w/, c => c.toUpperCase());
            
            let command = client.commands.get(args[0]);

            if (!command) return message.channel.send(`That command couldn't be found within my files.`);

            client.commands.delete(command.name);
            delete require.cache[require.resolve(`../${command.ABSOLUTE_PATH}`)];

            message.channel.send(`Successfully unloaded \`${command.name}\`.`);
        }
    }
}