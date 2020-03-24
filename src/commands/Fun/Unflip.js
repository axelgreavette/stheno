module.exports = {
    name: "unflip",
    description: "No table flipping.",
    category: "Fun",
    auto: true,
    patterns: [/\(╯°□°）╯︵ ┻━┻/i],
    hidden: true,
    execute(message, args, client,) {
        return message.channel.send("┬─┬ ノ( ゜-゜ノ)");
    },
    executeAuto(message, args, client) {
        return message.channel.send("┬─┬ ノ( ゜-゜ノ)");
    }
}