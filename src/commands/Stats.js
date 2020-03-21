const { MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
    name: "stats",
    description: "On the dot statistics.",
    aliases: ["statistics"],
    category: "Utility",
    async execute(message, args, client, logger) {
        const sent = await message.channel.send("Preforming calculations...");

        const { data: updated } = await axios({
            url: "https://api.github.com/repos/axelgreavette/stheno/commits",
            method: "get",
            headers: {
                "User-Agent": "stheno"
            }
        });

        const embed = new MessageEmbed()
            .setTitle("Bot Statistics")
            .addField("­", `Channels: **${client.channels.cache.size}**\nUsers: **${client.users.cache.size}**\nGuilds: **${client.guilds.cache.size}**\nCommands: **${client.commands.size}**`, true)
            .addField("­", `Gateway: **${client.ws.ping.toFixed(2)}**\nMessage: **${sent.createdTimestamp - message.createdTimestamp}ms**\nUptime: **${client.uptime().formatted}**\nRAM: **${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB**`, true)
            .setFooter(`Last updated ${new Date(updated[0].commit.author.date).toLocaleDateString("en-CA", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)

        return sent.edit(embed);
    }
}