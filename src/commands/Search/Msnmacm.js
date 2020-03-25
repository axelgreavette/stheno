const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "msnmacm",
    description: "Queries the MSNMACM API.",
    category: "Search",
    auto: true,
    usage: "<query|list>",
    patterns: [/https?:\/\/msnmacm\.org\/_\d\d?/i, /msnmacm\.org\/_\d\d?/i, /msnmacm:\/\/\d\d?/i],
    allCaps: true,
    credits: [
        {
            name: "Bakira",
            for: "the MSNMACM database",
            url: "https://msnmacm.org"
        }
    ],
    async execute(message, args) {
        const { data: res } = await axios({
            url: `https://msnmacm.org/_${args[0]}`,
            headers: { 
                "Response-Type": "application/json"
            }
        });

        if(res.error == "not found") return message.channel.send("Sorry, that index couldn't be found.");

        const embed = new MessageEmbed()
            .setTitle(`MSNMACM Index ${Number(args[0] || captured)}${res.title != null && res.title !== "N / A" ? " - " + res.title : ""}`)
            .setColor("2f3136")
            .addField(`Abilit${res.abilities.split(",") > 1 ? "ies" : "y"}:`, res.abilities, true)
            .addField("Alliances", res.alliances, true)
            .addField("Last Known Location:", res.last_location != "undefined" ? res.last_location : "Unknown", true)
            .setDescription(`**Desc.**: ${res.abilities_description}\n\n**Notes**: ${res.notes}`)
            .setFooter("msnmacm.org");

        return message.channel.send(embed);
    },
    async executeAuto(message) {       
        let cap = /msnmacm\.org\/_(\d\d?)/i;
        let altcap = /msnmacm:\/\/(\d\d)?/i;

        let captured;

        if(cap.test(message.content)) captured = cap.exec(message.content)[1];
        if(altcap.test(message.content)) captured = altcap.exec(message.content)[1];
        if(!cap.test(message.content) && !altcap.test(message.content)) return;

        const { data: res } = await axios({
            url: `https://msnmacm.org/_${Number(captured)}`,
            headers: { 
                "Response-Type": "application/json"
            }
        });

        if(res.error == "not found") return;

        const embed = new MessageEmbed()
            .setTitle(`Index ${Number(captured)}${res.title != null && res.title !== "N / A" ? " - " + res.title : ""}`)
            .setColor("2f3136")
            .addField(`Abilit${res.abilities.split(",") > 1 ? "ies" : "y"}:`, res.abilities, true)
            .addField("Alliances", res.alliances, true)
            .addField("Last Known Location:", res.last_location != "undefined" ? res.last_location : "Unknown", true)
            .setDescription(`**Desc.**: ${res.abilities_description}\n\n**Notes**: ${res.notes}`)
            .setFooter("msnmacm.org");

        return message.channel.send(embed);
    }
};