// @flow
import Eris from 'eris';
import { queryStockX } from './api';

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

  const res = await queryStockX(args.join(' '));
  
  if (!res.success) {
    await message.channel.createMessage(`${message.author.mention} ${res.message}`);
    return;
  }

  const prod = res.product;

  const avg = (prod.highest_bid + prod.lowest_ask) / 2;

  const data = `
    High: $${prod.highest_bid}\n
    Low: $${prod.lowest_ask}\n
    Average: $${avg}
  `;

  let desc = `[StockX](https://stockx.com/${prod.url})`;
  desc += '```ruby\n' + data + '```';

  const content = {
    content: `${message.author.mention}, here are your results!`,
    embed: {
      title: prod.name,
      author: {
        name: 'BrickBot',
        icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
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
  cooldown: 3000
  // etc
});

bot.connect();