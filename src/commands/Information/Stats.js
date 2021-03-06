const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const { format } = require("date-fns");

module.exports = {
    name: "stats",
    description: "On the dot statistics.",
    aliases: ["statistics"],
    category: "Information",
    async execute(message, args, client) {
        const sent = await message.channel.send("Preforming calculations...");

        const { data: updated } = await axios({
            url: "https://api.github.com/repos/axelgreavette/stheno/commits",
            method: "get",
            headers: {
                "User-Agent": "Stheno"
            }
        });

        const embed = new MessageEmbed()
            .setColor("2f3136")
            .addField(`${client.user.username}#${client.user.discriminator} `, `Channels: **${client.channels.cache.size}**\nUsers: **${client.users.cache.size}**\nGuilds: **${client.guilds.cache.size}**\nCommands: **${client.commands.size}**`, true)
            .addField("(not sharding)", `Gateway: **${client.ws.ping.toFixed(2)}**\nMessage: **${sent.createdTimestamp - message.createdTimestamp}ms**\nUptime: **${client.utils.bot.uptime().formatted}**\nRAM: **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB**`, true)
            .setFooter(`Code last updated ${format(new Date(updated[0].commit.author.date), "EEEE, MMMM dd, yyyy")}.`);

        return sent.edit(embed);
    }
};