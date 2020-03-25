const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const { format } = require("date-fns");

module.exports = {
    name: "npm",
    description: "Search NPM for the supplied package.",
    category: "Search",
    args: true,
    usage: "<package>",
    async execute(message, args, client) {
        let search = args.join(" ");
        let notFound = false;

        let res = await axios(`https://registry.npmjs.com/${search}`).catch(error => {
            if(error.response && error.response.status === 404) notFound = true;
        });

        if(notFound) return message.channel.send("That package couldn't be found.");

        res = res.data;

        if (res.time.unpublished) return message.channel.send("That package is no longer available.");

		const version = res.versions[res["dist-tags"].latest];
		const maintainers = client.utils.array.trimArray(res.maintainers.map(user => user.name));
		const dependencies = version.dependencies ? client.utils.array.trimArray(Object.keys(version.dependencies)) : null;

        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setURL(`https://npmjs.com/${search}`)
            .setTitle(res.name)
            .setDescription(res.description)
            .addField("Author:", res.author.name, true)
            .addField("License:", res.license, true)
            .addField("Main File:", version.main || "index.js", true)
            .addField("Version:", res["dist-tags"].latest, true)
            .addField("Created:", format(new Date(res.time.created), "dd/mm/yyyy"), true)
            .addField("Modified:", format(new Date(res.time.modified), "dd/mm/yyyy"), true)
            .addField("Dependencies:", dependencies.join(", ") || "None", false)
            .addField("Maintainers:", maintainers.join(", "), false);

        return message.channel.send(embed);
    }
};