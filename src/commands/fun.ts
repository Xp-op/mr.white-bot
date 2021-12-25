import { MessageEmbed } from 'discord.js';
import { 
    Discord,
    SimpleCommand,
    SimpleCommandMessage } from 'discordx';

import fetch from 'node-fetch';
import { Headers } from 'node-fetch';

function inrange(x: any, min: any, max: any): Boolean {
    return x >= min && x <= max;
}

@Discord()
export abstract class commandFun {
    static async _request_json(url: string, headers?: Headers): Promise<any> {
        if (headers === undefined) {
            const res = await fetch(url);
            const json: any = await res.json();
            return json;
        } else {
            const res = await fetch(url, { headers: headers });
            const json: any = await res.json();
            return json;
        }
    }
    
    @SimpleCommand('mama')
    async mama(ctx: SimpleCommandMessage) {
        const joke = (await commandFun._request_json('https://api.yomomma.info/')).joke;
        if (joke === undefined) {
            ctx.message.reply("I can't think of funny yo mama joke. Try again next time");
            return;
        }
        ctx.message.reply(joke);
    }

    @SimpleCommand('dad')
    async dad(ctx: SimpleCommandMessage) {
        const joke = (await commandFun._request_json('https://icanhazdadjoke.com',
                                        new Headers({ Accept: 'application/json' }))).joke;
        if (joke === undefined) {
            ctx.message.reply("I can't think of funny dad joke. Try again next time");
            return;
        }
        ctx.message.reply(joke);
    }

    @SimpleCommand('ball')
    async ball(ctx: SimpleCommandMessage) {
        const percentage = Math.floor(Math.random() * 101);
        let ball_msg: string;
        if (percentage == 0)
            ball_msg = "Where is your ball?";
        else if (inrange(percentage, 1, 10))
            ball_msg = "Atleast your ball bigger than Jesse";
        else if (inrange(percentage, 11, 40))
            ball_msg = "Kinda small";
        else if (inrange(percentage, 41, 70))
            ball_msg = "Average";
        else if (inrange(percentage, 71, 99))
            ball_msg = "Really big. Can you put it in my jaw UwU";
        else
            ball_msg = "Zamn! you got a big ball (your cock probably small lol)";
        
        let em = new MessageEmbed()
                        .setColor(0x42f5b0)
                        .setTitle(`${ctx.message.author.username} Ball size is ${percentage}%`)
                        .setDescription(ball_msg);
        ctx.message.reply({ embeds: [em] });
    }
}