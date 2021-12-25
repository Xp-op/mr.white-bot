import { 
    Discord,
    SimpleCommand,
    SimpleCommandMessage } from 'discordx';
import { MessageEmbed } from 'discord.js';

let help_menu = require('../../help.json');
const owner_id = '784036391163396107';


@Discord()
export abstract class commandCommon {
    @SimpleCommand('help')
    async help(ctx: SimpleCommandMessage) {
        let help_embed = new MessageEmbed()
                        .setTitle(help_menu.title)
                        .setDescription(help_menu.desc);
        for (const command of help_menu.commands) {
            let cmd: string = '';
            for (const arg of command.args)
                cmd += ` \`${arg}\``;
            help_embed = help_embed.addField(
                command.name, `${cmd}\n\n${command.desc}`, false);
        }
        ctx.message.reply({embeds: [help_embed]});
    }
}