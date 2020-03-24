const { MessageEmbed } = require("discord.js");

const categoryDescriptions = {
    administrative: "Commands related to Stheno's core process.\n\nUsage restricted to bot-owners only.",
    fun: "Commands that are fun in some way, such as being a game, or being funny.",
    information: "Commands related to Stheno, such as statistics, or general information.\n\nAlso includes some commands to gather general information related to things such as users or servers.",
    search: "Search commands. Usually this means they query an outside API or service, but it can vary.",
    utility: "Utility commands. There to be helpful... Sometimes..."
}

module.exports = {
    name: "help",
    description: "Lists all of my commands or information related to a singularity",
    args: false,
    usage: "[COMMAND NAME (Optional)]",
    category: "Information",
    execute(message, args, client) {
        const body = [];

        const DMNotification = new MessageEmbed()
            .setTitle("Help has been sent to your DMs.")
            .setThumbnail(client.user.displayAvatarURL())
            .setColor("2f3136")

        if(!args.length) {
            const embed = new MessageEmbed()
                .setTitle("Command Categories:")
                .setColor("2f3136")
                .setDescription(client.configs.Categories.Valid.map(c => `≫ ${client.utils.string.capitalize(c.toLowerCase())}`).join("\n"))
                .setFooter("Use s$help [CATEGORY] to see more information about a category, and the commands that fall into it.")

            return message.channel.send(embed);
        }

        const name = args[0].toLowerCase();
        let result;

        if(!client.configs.Categories.Valid.includes(args[0].toUpperCase()) && client.commands.get(name) || !client.configs.Categories.Valid.includes(args[0].toUpperCase()) && client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name))) {
            result = client.commands.get(name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name));

            let description = `Name: ${result.name}\nCategory: ${result.category}`;

            if (result.aliases) description += `\nAliases: ${result.aliases.join(', ')}`;
            if (result.description) description += `\nDescription: ${result.description}`;
            if (result.usage) description += `\nUsage: ${client.prefixes.global}${result.name} ${result.usage}`;

            description += `\nCooldown: ${result.cooldown || 3} second(s)`;

            const embed = new MessageEmbed()
                .setDescription(description)
                .setColor("2f3136")

            return message.channel.send(embed);
        } else if(client.configs.Categories.Valid.includes(args[0].toUpperCase())) {
            result = client.utils.string.capitalize(args[0]);

            let cmds = client.commands.filter(c => {
                if(c.category == result && (!c.disabled || !c.hidden || !c.adminOnly)) return true;
                else return false;
            }).map(c => client.utils.string.capitalize(c.name));

            const embed = new MessageEmbed()
                .setDescription(`${categoryDescriptions[result.toLowerCase()]}`)
                .addField("Available Commands:", cmds.join(", "))
                .setColor("2f3136")
                .setFooter("Use s$help [COMMAND] to see more information about a command.")

            return message.channel.send(embed);
        } else if (args[0] == "all" || args[0] == "a") {         
            const embed = new MessageEmbed()
                .setTitle("Listing all available commands:")
                .setColor("2f3136")
                .setDescription(`${client.commands.filter(cmd => {
                    if(cmd.adminOnly || cmd.disabled || cmd.hidden) return false;
                    else return true;
                }).map(c => c.name).join(", ")}\n\nUse \`s$help [CATEGORY]\` to see more information about a specific category.\nUse \`s$help [COMMAND]\` to see more information about a specific command.`)
            
            return message.channel.send(embed);
            } else {
                return message.channel.send(`404 requested function (**${name}**) was not found.`);
        }
    }
}