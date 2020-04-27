const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "github",
    description: "Search Github for users.",
    category: "Search",
    args: true,
    usage: "<user>",
    allCaps: true,
    async execute(message, args) {
        let search = args.join(" ");
        let notFound = false;

        let res = await axios(`https://api.github.com/users/${search}`).catch(error => {
            if (error.response && error.response.status === 404) notFound = true;
        });

        if (notFound) return message.channel.send("That user does not exist");

        res = res.data;

        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setURL(`https://github.com/${search}`)
            .setTitle(res.name)
            .setDescription(res.bio)
            .setThumbnail(res.avatar_url)
            .addField("Locations:", res.location, true)
            .addField("Followers:", res.followers, true)
            .addField("Following:", res.following, true)
            .addField("Public Repos:", res.public_repos, true)
            .addField("Type:", res.type);


        return message.channel.send(embed);
    }
};