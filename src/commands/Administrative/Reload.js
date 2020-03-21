const { join } = require("path");

module.exports = {
    name: "reload",
    description: "Reload a command within the bot process",
    category: "Administrative",
    args: true,
    aliases: ["rl"],
    adminOnly: true,
    execute(message, args, client, logger) {
        let command = client.commands.get(args[0]);

        if(!command) return message.channel.send(`That command couldn't be found within my processes. Try loading it with **s_load ${args[0]}**`);

        delete require.cache[require.resolve(`../${command.ABSOLUTE_PATH}`)];
        client.commands.delete(command.name);
        const cmd = require(join(client.commandsFolder, `${command.ABSOLUTE_PATH}`));
        cmd.ABSOLUTE_PATH = command.ABSOLUTE_PATH;
        client.commands.set(cmd.name, cmd);

        message.channel.send(`Successfully reloaded \`${cmd.name}\`.`);
    }
}