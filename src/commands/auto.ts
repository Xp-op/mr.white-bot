import { 
    Discord,
    SimpleCommand,
    SimpleCommandMessage, 
    SimpleCommandOption} from 'discordx';
import { auto_parse } from './auto/auto-parser';
import { format_error } from './auto/auto-common';

@Discord()
export abstract class commandAuto {

    static clean_up_code(c: string): string {
        if (c.startsWith('```'))
            c = c.slice(3);
        if (c.endsWith('```'))
            c = c.substring(0, c.length-3);
        return c;
    }

    @SimpleCommand('auto')
    async auto(
        @SimpleCommandOption('code', { type: 'STRING' }) code: string | undefined,
        ctx: SimpleCommandMessage
    ) {
        if (code === undefined) {
            ctx.message.reply("Please specify the code. Use `yo help auto`");
            return;
        }
        code = commandAuto.clean_up_code(code);
        const o = auto_parse(code);
        if (o) {
            const err = format_error(code, o);
            console.log(o);
            ctx.message.reply(`**Error Occured**\n\`\`\`\n${err}\n\`\`\``);
        }
    }

}