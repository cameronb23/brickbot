// @flow
import Eris from 'eris';
import { query } from './api';

const bot = new Eris.CommandClient(
  process.env.DISCORD_TOKEN,
  {},
  {
    description: 'A bot to show your realtime data of your favorite products',
    owner: 'Cameron#9965',
    prefix: ['@mention', '-']
  }
);

bot.on('ready', () => {
  console.log('Logged in!');
});

bot.registerCommand('brick', async (message, args) => {
  await message.channel.sendTyping();

  const res = await query(args.join(' '));

  if (!res.success) {
    await message.channel.createMessage(`${message.author.mention} ${res.message}`);
    return;
  }

  const { data } = res;

  const avg = (data.highBid + data.lowAsk) / 2;

  const both = {
    stockX: data.stockData,
    goat: data.goatData
  };

  let desc =
    '```stylus\n' +
    `High bid: $${data.highBid}\n` +
    `Low ask: $${data.lowAsk}\n` +
    `Average: $${avg}\n` +
    '```\n';

  desc +=
    `Retail price: $${data.meta.retail}\n` +
    `SKU: ${data.meta.sku}\n` +
    `StockX Ticker: ${data.meta.stockSlug}\n` +
    `GOAT Slug: ${data.meta.goatSlug}\n`;

  if (data.meta.stockUrl) {
    desc += `\n[StockX](https://stockx.com/${data.meta.stockUrl})\n`;
  }

  const content = {
    content: `${message.author.mention}, here are your results!`,
    embed: {
      title: data.meta.title,
      author: {
        name: 'BrickBot',
        icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
      },
      color: 2793880,
      thumbnail: {
        url: data.meta.image
      },
      timestamp: new Date().toISOString(),
      footer: {
        icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
        text: 'Powered by cameronb23'
      },
      description: desc
    }
  }

  await message.channel.createMessage(content);
}, {
  aliases: ['check'],
  caseInsensitive: true,
  argsRequired: true,
  description: 'Check the brick status of a product',
  fullDescription: 'Checks against multiple services to compute the average data and resale value of a product',
  usage: '<product query>',
  invalidUsageMessage: 'Proper usage: -brick <product query>',
  cooldown: 3000,
  cooldownMessage: 'Please calm down :)'
  // etc
});

bot.connect();
