const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "user",
    description: "Display user information.",
    category: "Information",
    usage: "<?user>",
    async execute(message, args, client) {
        let conjoined = args.join(" ");
        let person = client.findMember(message, conjoined, true);
        
        const embed = new MessageEmbed()
            .setTitle(`${person.user.username}#${person.user.discriminator}`)
            .setColor("2f3136")
            .setThumbnail(person.user.displayAvatarURL())
            .addField("User Related:", `ID: **${person.id}**\nAvatar URL: **[Here](${person.user.displayAvatarURL()})**\nAccount Created: **${client.utils.bot.snowflake(person.user.id)}**\n${person.nickname ? "Nickname: **" + person.nickname + "**" : ""}`, true)
            .setFooter(`${person.nickname ? person.nickname : person.user.username} joined ${message.guild.name} on ${new Date(person.guild.joinedTimestamp).toLocaleDateString()}`)

        return message.channel.send(embed);
    }
}