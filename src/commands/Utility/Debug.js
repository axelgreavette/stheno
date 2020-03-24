const { MessageEmbed } = require("discord.js");
const { join } = require("path");
const { readdirSync } = require("fs");

module.exports = {
    name: "debug",
    description: "Stheno debug information.",
    aliases: ["information"],
    category: "Utility",
    async execute(message, args, client) {
        let prefixes = [];
        let allCommands = [];

        for(const prefix in client.prefixes) {
            prefixes.push([prefix, client.prefixes[prefix]]);
        }

        client.utils.bot.getDirectories(join(__dirname, "..")).forEach(d => {
            let commands = readdirSync(join(__dirname, "..", d)).filter(file => file.endsWith(".js")).map(path => `${d}/${path}`);
            
            allCommands = allCommands.concat(...commands);
        });

        let availableCommands = allCommands.length - client.commands.size;

        
        const embed = new MessageEmbed()
            .setTitle("Debug for Stheno:")
            .setColor("2f3136")
            .addField("Prefixes:", `${prefixes.map(p => `${client.utils.string.capitalize(p[0])}: ${p[1]}`)}`)
            .addField("Commands:", `Loaded: ${client.commands.size}\nAvailable: ${availableCommands}`)
            .addField("Auto:", `Loaded: ${client.autoCommands.size}\nPatterns: ${client.autoPatterns.map(p => `\`${p}\``).join(", ")}`)
            .addField("Permissions:",)

        return message.channel.send(embed);
    }
}