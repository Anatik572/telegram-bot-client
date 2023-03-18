var configuration = require('./config.json');
const { Api, TelegramClient, InputFile  } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); 
const fs = require("fs");

var  telegramUtil = {
    async sessionAdd(str){
        fs.readFile('config.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            const config = JSON.parse(data);
            config.sessionSave = str;
            fs.writeFile('config.json', JSON.stringify(config), (err) => {
                if (err) {
                    console.error(err);
                    return;
                }

            });
        });
    },

    async sendMessage(guildId, msgFile, guildTitle, client){
        await client.sendMessage(guildId, { message: fs.readFileSync('./' + msgFile, 'utf8') }).then(e => {
            console.log("[+] Sending to " + guildTitle + " !");
        }).catch(e => {
            console.log('[-] Error sending message on ' + guildTitle);
        });    
    },

    async connect(apiId, apiHash, session){
        const client = new TelegramClient(new StringSession(session), apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.start({
            phoneNumber: await input.text("Please enter the phone number (+33): "),
            phoneCode: async () => await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
        });

        console.log("[+] Connected !");
        await telegramUtil.sessionAdd(await client.session.save());

        console.log(`
        ████████╗███████╗██╗     ███████╗███████╗██████╗  █████╗ ███╗   ███╗
        ╚══██╔══╝██╔════╝██║     ██╔════╝██╔════╝██╔══██╗██╔══██╗████╗ ████║
           ██║   █████╗  ██║     █████╗  ███████╗██████╔╝███████║██╔████╔██║
           ██║   ██╔══╝  ██║     ██╔══╝  ╚════██║██╔═══╝ ██╔══██║██║╚██╔╝██║
           ██║   ███████╗███████╗███████╗███████║██║     ██║  ██║██║ ╚═╝ ██║
           ╚═╝   ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝
                               By Anatik
                            > Payload List <
                    ads - Send to all telegram channels 
                    scrape - Scrape all dialogue channels
                    join - Join Canal
        `);

        var payloadChoice = await input.text("Choice Payload: ");

        if(payloadChoice == "ads"){
            var fileMessage = await input.text("Choice file Message (example: ./file.txt): ");
            var timerMessage = await input.text("Choice Time Spam (1: 1 message, 5: every 5 minute): ");

            if(timerMessage == 5){
                setInterval(async () => {
                    var i = 0;
                    const dialogs = await client.getDialogs();
                    dialogs.forEach(async dialog=>{
                        if(dialog.isChannel){
                            i++;
                            setTimeout(async () => {
                                await telegramUtil.sendMessage(dialog.entity.username, fileMessage, dialog.title, client);
                            }, i * 700);
                        }
                    });
                }, 360000);
            }
        
            var i = 0;
            const dialogs = await client.getDialogs();
            dialogs.forEach(async dialog=>{
                if(dialog.isChannel){
                    i++;
                    setTimeout(async () => {
                        await telegramUtil.sendMessage(dialog.entity.username, fileMessage, dialog.title, client);
                    }, i * 700);
                }
            });
        }

        if(payloadChoice == "scrape"){
            const dialogs = await client.getDialogs();
            dialogs.forEach(async dialog=>{
                if(dialog.isChannel){
                    console.log(dialog.entity.username +" | " + dialog.title);
                }
            });
        }

        if(payloadChoice == "join"){
            var inviteLink = await input.text("Give Invite (t.me/xxxx or https://t.me/xxxx): ");
            try {
                const result = await client.invoke(
                    new Api.channels.JoinChannel({
                    channel: inviteLink.replace('https://t.me/', '').replace('t.me/', ''),
                    })
                );
                console.log("[+] Try to Join " + inviteLink.replace('https://t.me/', '').replace('t.me/', ''));  
            } catch(e) {
                console.log("[-] Refusing to join ....");
            }    
        }
    }
}
telegramUtil.connect(configuration.apiId, configuration.apiHash, configuration.sessionSave);
