const { Client, Collection } = require("discord.js");
const { join } = require("path");
const { readdirSync, statSync } = require("fs");
const { js } = require("js-beautify");
const NekoClient = require("nekos.life")

const Config = require("../helper/Config");

const { repository } = require("../../package.json");

const BotUtils = require("../util/Bot");
const ArrayUtils = require("../util/Array");
const StringUtils = require("../util/String");
const NumberUtils = require("../util/Number");

class SthenoClient extends Client {
    constructor(props) {
        super(props);
        
        this.InviteURL = "https://discordapp.com/oauth2/authorize?client_id=686685370473382014&permissions=8&scope=bot";

        this.configs = {
            Confidential: new Config(join(__dirname, "..", "config", "Confidential.toml")),
            Public: new Config(join(__dirname, "..", "config", "Public.toml")),
            Categories: new Config(join(__dirname, "..", "config", "Categories.toml")),
            Messages: new Config(join(__dirname, "..", "config", "Messages.toml")),
            Presences: new Config(join(__dirname, "..", "config", "Presences.toml"))
        }

        this.utils = {
            string: StringUtils,
            bot: BotUtils,
            array: ArrayUtils,
            number: NumberUtils
        };

        this.commandsFolder = join(__dirname, "..", "commands");
        this.commands = new Collection();
        this.autoCommands = new Collection();
        this.autoPatterns = [];
        this.cooldowns = new Collection();
        let Commands = []

        this.utils.bot.getDirectories(this.commandsFolder).forEach(d => {
            let commands = readdirSync(join(this.commandsFolder, d)).filter(file => file.endsWith(".js")).map(path => `${d}/${path}`);
            Commands = Commands.concat(...commands);
        });

        this.prefixes = {
            global: this.configs.Public.bot.prefix,
        };

        this.giveaways = new Collection();

        for (const File of Commands) {
            const cmd = require(`../commands/${File}`);

            if(cmd.auto && cmd.patterns) {
                cmd.patterns.forEach(p => {
                    this.autoCommands.set(p, cmd);
                    this.autoPatterns.push(p);
                });
                cmd.ABSOLUTE_PATH = File;
                this.commands.set(cmd.name, cmd);
            }

            if(!this.configs.Categories.Valid.includes(cmd.category.toUpperCase())) throw new Error(`Command category must match one of ${this.configs.Categories.Valid}. Got ${cmd.category} instead.`);

            cmd.ABSOLUTE_PATH = File;
            this.commands.set(cmd.name, cmd);
        }

        this.github = repository;

        const { sfw , nsfw } = new NekoClient();

        this.nekos = sfw;
        this.NSFW_nekos = nsfw;

        this._presence = {
            activities: this.configs.Presences.Valid,
            random: () => {
                return ArrayUtils.randomItem(this._presence.activities);
            }
        };
    }

    /**
     * Finds a member from a string, mention, or id
     * @property {string} msg The message to process
     * @property {string} suffix The username to search for
     * @property {bool} self Whether or not to default to yourself if no results are returned. Defaults to false.
     */
    findMember (msg, suffix, self = false) {
        if (!suffix) {
            if (self) return msg.member;
            else return null;
        } else {
            let member = msg.mentions.members.first() || msg.guild.members.cache.get(suffix) || msg.guild.members.cache.find(m => m.displayName.toLowerCase().includes(suffix.toLowerCase()) || m.user.username.toLowerCase().includes(suffix.toLowerCase()));
            return member;
        }
    }

    /**
     * Replaces certain characters and fixes mentions in messages.
     * @property {string} text The text to clean
     */
    clean (text) {
        let cleanRegex = new RegExp(this.configs.Confidential.token, "g");

        if (text.indexOf(this.configs.Confidential.token) !== -1) text = text.replace(cleanRegex, ArrayUtils.randomItem(["[redacted]", "[DATA EXPUNGED]", "[REMOVED]", "[SEE APPENDIUM INDEX A494-A]"]));
        
        if (typeof (text) === "string") text = text.replace(/` /g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

        text = js(text, {
            indent_size: 4,
            space_in_empty_paren: true
        });
        
        return text;
    }
}

module.exports = SthenoClient;