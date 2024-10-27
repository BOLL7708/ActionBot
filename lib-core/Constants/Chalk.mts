import chalk from 'chalk';
export default class Chalk {
   static text = chalk.whiteBright
   static warning = chalk.yellowBright
   static error = chalk.redBright

   static data = chalk.blueBright
   static dataBg = Chalk.data.bgBlue

   static api = chalk.cyanBright
   static apiBg = Chalk.api.bgCyan

   static client = chalk.greenBright
   static clientBg = Chalk.client.bgGreen
}