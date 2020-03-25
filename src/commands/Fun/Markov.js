const Chain = require("../../helper/Chain");

module.exports = {
    name: "markov",
    description: "Generates a sample message for the specified user using the given channel as a base.",
    usage: "<?channel> <?user>",
    aliases: ["markov-gen"],
    category: "Fun",
    cooldown: 5,
    async execute(message, args, client) {
        const original = await message.channel.send("*Generating...*");

        let chanIndex = args.findIndex(val => /\<#\d+\>/.test(val));
        let userIndex = args.findIndex(val => /\<@!*\d+\>|./.test(val));

        let channel = args[chanIndex] ? message.guild.channels.cache.get(args[chanIndex].replace("<#", "").replace(">", "")) : message.channel;
        let user = args[userIndex] ? client.findMember(message, args[userIndex], true) : message.member;
        
        let baseOne = await channel.messages.fetch({ limit: 100 }, true);
        let baseTwo = await channel.messages.fetch({ limit: 100, before: baseOne.lastKey()});
        let baseThree = await channel.messages.fetch({ limit: 100, before: baseTwo.lastKey()});
        let baseFour = await channel.messages.fetch({ limit: 100, before: baseThree.lastKey()});
        
        let inputs = baseOne.concat(baseTwo, baseThree, baseFour);

        await original.edit(`*Received a raw total of ${inputs.size} messages...*`);

        inputs = inputs.filter(m => m.author.id === user.id);

        await original.edit(`*Filtered to ${inputs.size} messages...*`);
        
        let final = inputs.array().join(". ");

        let generator = new Chain({ source: final });

        return original.edit(`> ${generator.generate()}\n*Generated from ~${inputs.size} of ${user.displayName}'s messages in ${channel}*`);
    }
}