const { Client, Collection } = require("discord.js");
const { join } = require("path");
const { readdirSync, readdir } = require("fs");
const { js } = require("js-beautify");

const Config = require("../helper/Config");

const Logger = require("../helper/Logger");

const BotUtils = require("../util/Bot");
const ArrayUtils = require("../util/Array");
const StringUtils = require("../util/String");
const NumberUtils = require("../util/Number");

class SthenoClient extends Client {
    constructor(props) {
        super(props);
        
        this.InviteURL = "https://discordapp.com/oauth2/authorize?client_id=686685370473382014&permissions=8&scope=bot";
        this.githubURL = "https://github.com/axelgreavette/stheno";

        this.ownerID = "228872946557386752";

        this.logger = Logger;

        this.configs = {
            confidential: new Config(join(__dirname, "..", "config", "Confidential.toml")),
            public: new Config(join(__dirname, "..", "config", "Public.toml")),
            rawCategories: new Config(join(__dirname, "..", "config", "Categories.toml")),
            presence: new Config(join(__dirname, "..", "config", "Presences.toml"))
        };

        this.debug = this.configs.public.testing.debug || process.argv[2];

        this.utils = {
            string: StringUtils,
            bot: BotUtils,
            array: ArrayUtils,
            number: NumberUtils
        };

        this.commandPath = join(__dirname, "..", "commands");
        this.eventPath = join(__dirname, "..", "events");
        this.commands = new Collection();
        this.autoCommands = new Collection();
        this.autoPatterns = [];

        this.cooldowns = new Collection();

        this.prefixes = {
            global: this.configs.public.bot.prefix,
        };

        this.giveaways = new Collection();

        this._presence = {
            activities: this.configs.presence.Valid,
            random: () => {
                return ArrayUtils.randomItem(this._presence.activities);
            }
        };
    }

    /**
     * Loads all available events
     * @param {string} path 
     */
    loadEvents(path = this.eventPath) {
        readdir(path, (err, files) => {
            if (err) this.logger.error(err);
            files = files.filter(f => f.split(".").pop() === "js");
            if (files.length === 0) return this.logger.warn("No events found");
            if(this.debug) this.logger.info(`${files.length} event(s) found...`);
            
            files.forEach(f => {
                const eventName = f.substring(0, f.indexOf(".")).toLowerCase();
                const event = require(join(path, f));

                super.on(eventName, event.bind(null, this));

                delete require.cache[require.resolve(join(path, f))]; // Clear cache
                
                if(this.debug) this.logger.info(`Loading event: ${eventName}`);
            });
        });

        return this;
    }

    /**
     * Load all available commands.
     * @param {string} path The path to load commands from. Defaults to client.commandPath
     */
    loadCommands(path = this.commandPath) {
        let Commands = [];

        this.utils.bot.getDirectories(path).forEach(d => {
            let commands = readdirSync(join(path, d)).filter(file => file.endsWith(".js")).map(path => `${d}/${path}`);
            Commands = Commands.concat(...commands);
        });

        if(this.debug) this.logger.info(`${Commands.length} commands found`);

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

            if(!this.configs.rawCategories.Valid.includes(cmd.category.toUpperCase())) throw new Error(`Command category must match one of ${this.configs.rawCategories.Valid}. Got ${cmd.category} instead.`);

            cmd.ABSOLUTE_PATH = File;
            this.commands.set(cmd.name, cmd);
            if(this.debug) this.logger.info(`Loaded command: ${cmd.name}`);
        }

        return this;
    }

    /**
     * Initializes Stheno.
     * @param {string} token The bot token
     */
    init(token = this.configs.confidential.token) {
        this.loadEvents();
        this.loadCommands();
        this.login(token);
    }

    /**
     * Finds a member from a string, mention, or id
     * @property {string} msg The message to process
     * @property {string} suffix The username to search for
     * @property {bool} self Whether or not to default to yourself if no results are returned. Defaults to false.
     */
    findMember(msg, suffix, self = false) {
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
    clean(text) {
        let cleanRegex = new RegExp(this.configs.confidential.token, "g");

        if (text.indexOf(this.configs.confidential.token) !== -1) text = text.replace(cleanRegex, ArrayUtils.randomItem(["[redacted]", "[DATA EXPUNGED]", "[REMOVED]", "[SEE APPENDIUM INDEX A494-A]"]));
        
        if (typeof (text) === "string") text = text.replace(/` /g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

        text = js(text, {
            indent_size: 4,
            space_in_empty_paren: true
        });
        
        return text;
    }

    /**
     * Checks if user is the bot owner
     * @param {User} user 
     */
    isOwner(user) {
        if (user.id === this.ownerId) return true;
        else return false;
    } 

}

module.exports = SthenoClient;