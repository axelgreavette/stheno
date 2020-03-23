const { MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
    name: "changelog",
    aliases: ["updates", "commits", "update", "cl"],
    description: "Responds with Stheno's ten most recent Git commits.",
    category: "Information",
    async execute(message, args, client, logger) {
        const { data: res } = await axios({
            url: "https://api.github.com/repos/axelgreavette/stheno/commits",
            headers: {
                "User-Agent": "Stheno",
            }
        });

        const commits = res.slice(0, 10);

        const embed = new MessageEmbed()
            .setTitle("[stheno:master] Latest Commits")
            .setColor("36393f")
            .setURL(client.github)
            .setDescription(
                commits.map(commit => {
                    const hash = `[\`${commit.sha.slice(0, 7)}\`](${commit.html_url})`;
                    return `${hash} - ${commit.author.login} - ${client.utils.string.shorten(commit.commit.message.split("\n")[0], 50)}`;
                }).join("\n")
            )
            .setFooter(`Code last updated ${new Date(commits[0].commit.author.date).toLocaleDateString("en-CA", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)

        return message.channel.send(embed);
    }
}