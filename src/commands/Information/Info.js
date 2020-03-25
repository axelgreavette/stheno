const { MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
    name: "info",
    description: "Important and general information related to Stheno.",
    aliases: ["information"],
    category: "Information",
    async execute(message, args, client) {
        const { data: updated } = await axios({
            url: "https://api.github.com/repos/axelgreavette/stheno/commits",
            method: "get",
            headers: {
                "User-Agent": "stheno"
            }
        });

        const embed = new MessageEmbed()
            .setAuthor("Stheno", client.user.displayAvatarURL())
            .setDescription("Stheno is a blazing fast, multifunctional Discord bot. She's completely open-source, and is updated almost daily.")
            .setColor("2f3136")
            .addField("Created by:", "[Axel Greavette](https://b.axelg.xyz)", true)
            .addField("Programmed with:", "<:JS:691370643886702725>  <:DiscordJS:691370753836449834>  <:TOML:691370861294387220>", true)
            .addField("Links:", `Stheno"s source-code is available on [GitHub](https://github.com/axelgreavette/stheno).${message.guild.ownerID == message.author.id ? "" : "\nYou can invite Stheno to your server [here](" + client.InviteURL + ")."}`)
            .setFooter(`Code last updated ${new Date(updated[0].commit.author.date).toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`);

        return message.channel.send(embed);
    }
};