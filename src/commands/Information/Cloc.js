const { MessageEmbed } = require("discord.js");
const { promisify } = require("util");
const exec = promisify(require("child_process").execFile);
const { join } = require("path");

module.exports = {
	name: "cloc",
	category:  "Information",
    description: "Returns Stheno's current code line count.",
    credits: [
        {
            name: "dragonfire535",
            for: "Inspiration",
            url: "https://github.com/dragonfire535/xiao"
        }
    ],
    cache: undefined,
	async execute(message, args, client, ) {
        const cloc = this.cache || await this.cloc();
        
        const formatNumber = client.utils.number.formatNumber;

        const embed = new MessageEmbed()
            .setTitle("CLOC Count:")
            .setColor("2f3136")
			.addField("JavaScript:", `${formatNumber(cloc.JavaScript.code)} lines over ${cloc.JavaScript.nFiles} files.`)
			.addField("JSON:", `${formatNumber(cloc.JSON.code)} lines over ${cloc.JSON.nFiles} files.`)
			.addField("TOML:", `${formatNumber(cloc.TOML.code)} lines over ${cloc.TOML.nFiles} files.`)
			.addField("Markdown:", `${formatNumber(cloc.Markdown.code)} lines over ${cloc.Markdown.nFiles} files.`)
			.addField("Total:", formatNumber(cloc.SUM.code))
            .setFooter(`${cloc.header.cloc_url} v${cloc.header.cloc_version}`)
            
		return message.channel.send(embed);
	},
	async cloc() {
		const { stdout, stderr } = await exec(
			join(__dirname, "..", "..", "..", "node_modules", ".bin", "cloc.cmd"),
			["--json", "--exclude-dir=node_modules", join(__dirname, "..", "..", "..")]
		);
		if (stderr) throw new Error(stderr.trim());
		this.cache = JSON.parse(stdout.trim());
        return this.cache;
	}
};