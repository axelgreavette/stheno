module.exports = {
    name: "eval",
    description: "Load a file within the commands folder",
    args: true,
    usage: "<code>",
    adminOnly: true,
    category: "Administrative",
    preventDefaultError: true,
    async execute(message, args, client) {
        try {
            const code = args.join(" ");
            let evaled = await eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            
            return message.channel.send(client.clean(evaled), { code: "js", split: true });
        } catch(error) {
            throw error.message;
        }
    },
    async error(message, args, client, error) {
        return message.channel.send(`\`ERROR\` \`\`\`xl\n${client.clean(error)}\n\`\`\``);
    }
};