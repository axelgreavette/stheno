const { MessageEmbed } = require("discord.js");

const categoryDescriptions = {
    administrative: "Commands related to Stheno's core process.\n\nUsage restricted to bot-owners only.",
    fun: "Commands that are fun in some way, such as being a game, or being funny.",
    information: "Commands related to Stheno, such as statistics, or general information.\n\nAlso includes some commands to gather general information related to things such as users or servers.",
    search: "Search commands. Usually this means they query an outside API or service, but it can vary.",
    utility: "Utility commands. There to be helpful... Sometimes..."
};

module.exports = {
    name: "help",
    description: "Lists all of my commands or information related to a singularity",
    usage: "<?command|category|args>",
    category: "Information",
    credits: [
        {
            name: "Async",
            for: "Inspiration"
        }
    ],
    execute(message, args, client) {
        if(!args.length) {
            const embed = new MessageEmbed()
                .setTitle("Command Categories:")
                .setColor("2f3136")
                .setDescription(client.configs.Categories.Valid.map(c => `≫ ${client.utils.string.capitalize(c.toLowerCase())}`).join("\n"))
                .setFooter("Use s$help [CATEGORY] to see more information about a category, and the commands that fall into it.");

            return message.channel.send(embed);
        }

        const name = args[0].toLowerCase();
        let result;

        if(!client.configs.Categories.Valid.includes(args[0].toUpperCase()) && client.commands.get(name) || !client.configs.Categories.Valid.includes(args[0].toUpperCase()) && client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name))) {
            result = client.commands.get(name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name));

            let description = `Name: ${result.name}\nCategory: ${result.category}`;

            if (result.aliases) description += `\nAliases: ${result.aliases.join(", ")}`;
            if (result.description) description += `\nDescription: ${result.description}`;
            if (result.usage) description += `\nUsage: ${client.prefixes.global}${result.name} ${result.usage}`;

            description += `\nCooldown: ${result.cooldown || 3} second(s)`;

            const embed = new MessageEmbed()
                .setDescription(description)
                .setColor("2f3136");

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
                .setFooter("Use s$help [COMMAND] to see more information about a command.");

            return message.channel.send(embed);
        } else if (args[0] == "all" || args[0] == "a") {         
            const embed = new MessageEmbed()
                .setTitle("Listing all available commands:")
                .setColor("2f3136")
                .setDescription(`${client.commands.filter(cmd => {
                    if(cmd.adminOnly || cmd.disabled || cmd.hidden) return false;
                    else return true;
                }).map(c => c.name).join(", ")}\n\nUse \`s$help [CATEGORY]\` to see more information about a specific category.\nUse \`s$help [COMMAND]\` to see more information about a specific command.`);
            
            return message.channel.send(embed);
        } else if (args[0] == "args" || args[0] == "arguments") {
            const embed = new MessageEmbed()
                .setTitle("Help with arguments:")
                .setColor("2f3136")
                .setDescription("Some of Stheno's commands use things called arguments. Arguments are the words or symbols that come after a command, and are sometimes used to provide extra options for commands, or user input.\n\nIn the help panel, a command's arguments are explained in the **Usage** section. Usually it looks something like this: \n\nUsage: s$markov <?channel> <?user>\n\nThe arguments for this command are `channel` and `user`. We know this because they're surrounded by `< >`. Notice how they're prefixed with a `?`. This means that they're optional. In the case of the `s$generate` command, if the arguments aren't supplied Stheno defaults to using the channel the command was called it, and the user who called it.\n\nSometimes though, arguments will be shown like this:\n\nUsage: s$msnmacm <query|list>\n\nSee that `|` character? That means that the command will either take a query (number), or `list` for it's arguments.\n\nThat's it! You know everything there is to know about command arguments! Have fun!");
        
            return message.channel.send(embed);
        } else {
            return message.channel.send(`404 requested function (**${name}**) was not found.`);
        }
    }
};