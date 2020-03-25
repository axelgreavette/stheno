const Discord = require("discord.js");
const sh0danClient = require("./struct/SthenoClient.js");
const { version, dependencies } = require("../package.json");
const winston = require("winston");
const chalk = require("chalk");
const ms = require("ms");

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const client = new sh0danClient();

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: client.configs.Public.bot.log_file || "log.txt"
        })
    ],
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
});

client.once("ready", async () => {
    logger.info(`${chalk.magenta(client.user.username)} is online`);
    logger.info(`Prefix set to ${chalk.magenta(client.prefixes.global)}`);
    logger.info(`${chalk.magenta(client.commands.array().length)} commands loaded`);
    logger.info(`Program Version: ${chalk.blue("v" + version)}`);
    logger.info(`Node Version: ${chalk.blue(process.version)}`);
    logger.info(`Discord.js Version ${chalk.blue(dependencies["discord.js"].replace("^", "v"))}`);

    if (client.configs.Public.debug || process.argv[0] == "--debug") logger.info(chalk.grey("Started in DEBUG MODE"));

    await client.user.setActivity({
        name: `with my internal structures | ${client.prefixes.global}help`,
        type: 0
    });

    setInterval(() => {
        let activity = client._presence.random();
        client.user.setActivity({
            name: `${activity.title} | ${client.prefixes.global}help`,
            type: activity.type
        });
    }, 300000);

});

client.on("message", async message => {
    let match;
    for (const pattern of client.autoPatterns) {
        if (message.content.match(pattern) && !message.content.startsWith(client.prefixes.global)) {
            match = pattern;
            break;
        }
    }
    
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(client.prefixes.global)}|${escapeRegex(client.prefixes.global.toUpperCase())})`);
    if (!match && !prefixRegex.test(message.content) || message.author.bot) return;
    if (match) {
        let auto_args = message.content.trim().split(/ +/);
        let command = client.autoCommands.get(match);
        if(command.disabled) return;
        return command.executeAuto(message, auto_args, client);
    }

    const [, prefix] = message.content.match(prefixRegex);
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    if (args.length === 0 || args[0] === "") return;

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = `No arguments were provided`;

        if (command.usage) reply += `\nThe proper usage of that command is: \`${client.prefix}${command.name} ${command.usage}\``;

        await message.channel.send(reply);
        return;
    }

    if (command.guildOnly && message.channel.type !== "text") return message.channel.send(client.configs.Messages.Error.GUILD_ONLY);
    if (command.disabled && !client.configs.Public.bot.admins.includes(message.author.id)) return message.channel.send(client.configs.Messages.Error.DISABLED);
    if (command.adminOnly && !client.configs.Public.bot.admins.includes(message.author.id)) return message.channel.send(`Unfortunately ${message.author} you lack the required clearance level for this command. Try contacting a system administrator for further assistance`);

    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownTime = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expiration = timestamps.get(message.author.id) + cooldownTime;

        if (now < expiration) {
            const timeLeft = (expiration - now) / 1000;
            return message.reply(`${message.channel.type === "dm" ? "T" : ", t"}hat command (**${command.name}**) is unusable for another ${ms(timeLeft)}. Please be patient.`);
        }
    }

    if (!client.configs.Public.bot.admins.includes(message.author.id)) timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownTime);

    try {
        message.channel.startTyping();
        await command.execute(message, args, client);
        message.channel.stopTyping();
        if (client.configs.Public.debug || process.argv[0] == "--debug") logger.info(`Command run: ${chalk.green(command.name)}`);
    } catch (error) {
        if (command.preventDefaultError === true) {
            message.channel.stopTyping();
            return await command.error(message, args, client, error);
        };
        logger.log("error", chalk.redBright(error));
        await message.channel.send(client.configs.Messages.Error.STANDARD);
        message.channel.stopTyping();
    }
});

client.on("debug", m => logger.debug(chalk.gray(m)));
client.on("warn", m => logger.warn(chalk.yellowBright(m)));
client.on("error", m => logger.error(chalk.redBright(m)));

//process.on("uncaughtException", error => logger.error(chalk.redBright(error)));

client.login(client.configs.Confidential.token).then(() => {});