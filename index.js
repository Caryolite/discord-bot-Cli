const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    //   GatewayIntentBits.GuildVoiceStates,
    ],
  });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 隨機數字(最小,最大)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;

    if (message.content === "戳") {
        message.reply("嗚哇><");
    } else if (message.content === "嗚哇><") {
        message.channel.send("？我沒戳你");
    }

    // 隨機
    const reRandom = /隨機/.test(message);
    const reDie = /死/.test(message);
    if (reRandom == true) {
        let arr = message.content.split(" ");
        if ((arr[0]) !== "隨機") return;

        if (reDie == true){
            message.channel.send(`還沒死透`);
        } else{
            let p = getRandomInt(1, (arr.length - 1));
            if (arr[p] == undefined) {
                message.channel.send(`你沒放選項`);
            } else {
                message.channel.send(`${arr[p]}`);
            }
        }
    }

    // 因數
    const reFactor = /因數/.test(message);
    if (reFactor == true) {
        let num = message.content.split(" ");

        if ((num[0]) !== "因數") return;
        
        if (num[1] == undefined){
            message.channel.send(`你沒放數字`);
            return;
        } 
            
        let fac = num[1];
        let factor = [];

        for(let i = 1; i <= (num[1]); i++){
            if (((num[1]) % fac) == 0){
                factor.push(` ${fac}`);
                fac -= 1;
            } else {
                fac -= 1;
            }
        }
        if ((factor.length) == 2){
            message.channel.send(`${num[1]} 的因數有 [${factor} ]   這是質數`);
        } else{
            message.channel.send(`${num[1]} 的因數有 [${factor} ]`);
        }
    }
    // 單抽
    if (message.content === "單抽"|message.content === "抽卡") {
        let gachaResult = getRandomInt(1, 100)
        if (gachaResult > 98){
            message.reply(`SSR`);
        } else if (gachaResult < 89){
            message.reply(`R  ${gachaResult}`);
        } else {
            message.reply(`SR`);
        }
    };

    // 十連
    if (message.content === "十連") {
    let gachaArr = [];
    let Guarantee = 0;
    for (let i = 1; i <= 10; i++){
        let gachaResult = getRandomInt(1, 100)
        
        if (gachaResult > 98){
            gachaArr.push(` SSR`);
        } else if (gachaResult < 89){
            gachaArr.push(` R`);
            Guarantee += 1;
        } else {
            gachaArr.push(` SR`);
        }
    }
    if (Guarantee == 10){
        gachaArr[9] = ` SR`;
    }
    message.reply(`${gachaArr} `);
    }
})

/* ------------------------------------------------------------------------- */

// godfield simple

let godFieldActive = false;
// const godfieldUsers = new Set();
var godFieldPlayer = ""; //玩家名稱
let godFieldChannel = ""; //頻道

// 教典
const itemList = require('./godField.json')
const catagories = ["weapons", "armor", "sundries"]

// 回合 用戶HP 克里HP
let GF = 1;
let userHp = 20;
let CLiHp = 20;

let userTurn = true;     //true: 玩家攻擊 false: 玩家防禦

// 手牌
let userItems = []
let CLiItems = []

// 計算傷害
let damage = 0;

// 顯示回合
function showGF(message){
    message.channel.send(`## G.F. ${GF}/100\n`);
}

// 新回合廣播
function newRound(message,turn){
    GF += 1;
    showGF(message);
    if (turn == 0){
        message.channel.send(`${godFieldPlayer}的手牌 > ${showItems(userItems)}`);
        message.channel.send(`${godFieldPlayer}的回合 > `);
        userTurn = true;
    } else {
        // message.channel.send(`CLi的手牌 > ${showItems(CLiItems)}`);
        message.channel.send(`CLi的回合 > `);
        userTurn = false;
    }
}

// 顯示血量
function showHp(message){
    message.channel.send(`> HP ${userHp}    ${godFieldPlayer}\n> HP ${CLiHp}    CLi`);
}

// 發牌
function dealCard (arr){
    for (i = 1; i < 6; i++){
        let p = getRandomInt(0,itemList["items"].length - 1);
        arr.push(itemList["items"][p]);
    }
}

// 手牌
function showItems (arr){
    let itemsDescription = "\`祈禱\`"
    for (i = 1; i < arr.length; i++){
        itemsDescription += `, \`${arr[i]["name"]}(${arr[i]["description"]})\``
    }
    return itemsDescription;
}

// 神界開局
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (message.content !== "神界") return;
    if (godFieldActive == true) return;    // 防止重新開局

    // if (message.author.username.indexOf(godfieldUsers) < 0){
    //     godfieldUsers.add(message.author.username);
    // }
    godFieldActive = true;

    godFieldPlayer = message.author.username
    // console.log(godFieldPlayer)

    // reset Game
    userItems = []
    CLiItems = []
    GF = 1;
    userHp = 20;
    CLiHp = 20;
    userTurn = true;

    godFieldChannel = message.channel.id
    // console.log(`channel id = ${godFieldChannel}`)

    // 玩家發牌
    userItems.unshift(itemList["pray"][0])
    dealCard(userItems);
    // userItems.push(itemList["items"][7])

    // 克里發牌
    CLiItems.unshift(itemList["pray"][0])
    dealCard(CLiItems);
    // CLiItems.push(itemList["items"][0])

    message.channel.send(`${godFieldPlayer} 誕生`);
    message.channel.send(`預言者們的戰鬥現在開始`);
    message.channel.send(`## G.F. ${GF}/100 \n> HP${userHp}    ${godFieldPlayer}\n> HP${CLiHp}    CLi`);
    message.channel.send(`${godFieldPlayer}的手牌 >  ${showItems(userItems)}`);
    // message.channel.send(`CLi手牌 >  ${showItems(CLiItems)}`);

    // console.log(userItems,CLiItems)
    
    message.channel.send(`${godFieldPlayer}的回合 >`);
})

// 找最接近
function findClosestIndex(damage) {
    let closestIndex = 0;
    let minDiff = Math.abs(CLiItems[0]["effect"] - damage);
  
    for (let i = 1; i < CLiItems.length; i++) {
      let diff = Math.abs(CLiItems[i]["effect"] - damage);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
}

// 使用後刪掉手牌
function spliceCard(deleteCardIndex, arr){
    arr.splice(deleteCardIndex,1)
}

// 抽新手牌
function getNewCard(message, arr){
    let p = getRandomInt(0, itemList["items"].length - 1)
    arr.push(itemList["items"][p])
}

// 克里防禦
function CliDefend(message){    
    if ((CLiItems.some(e => e.type == "armor")) == true){ // 有防具
        let defi = parseInt(findClosestIndex(damage));
        
        if (defi == 0){ // 不防禦
            message.channel.send(`CLi防禦 >  允許`);
            message.channel.send(`CLi受到傷害 >  ${Math.abs(damage)}`);
            CLiHp += damage;
        } else { // 防禦
            damage -= CLiItems[defi]["effect"];
            if (damage < 0){ 
                    message.channel.send(`CLi防禦 >  \`${CLiItems[defi]["name"]}(${CLiItems[defi]["description"]})\`\nCLi受到傷害 >  ${Math.abs(damage)}`);
                    CLiHp += damage;
                } else {
                    message.channel.send(`CLi防禦 >  \`${CLiItems[defi]["name"]}(${CLiItems[defi]["description"]})\`  [平安]`);
            }
            spliceCard(defi, CLiItems);
            getNewCard(message ,CLiItems);
            // message.channel.send(`CLi獲得新牌 >  \`${CLiItems[CLiItems.length - 1]["name"]}(${CLiItems[CLiItems.length - 1]["description"]})\``);
        }
    } else {
        // 沒防具
        message.channel.send(`CLi防禦 >  允許`);
        message.channel.send(`CLi受到傷害 >  ${Math.abs(damage)}`);
        CLiHp += damage;
    }
    damage = 0;
    showHp(message);
    // message.channel.send(`CLi手牌 >  ${showItems(CLiItems)}`);

    // 昇天
    if (CLiHp < 1){
        message.channel.send(`CLi昇天 > 遊戲結束\n### 贏家 ${godFieldPlayer}`);
        closeGodField ();
    }
}

// 神界結束
function closeGodField (){
    godFieldPlayer = "";
    godFieldActive = false;
}

// 克里攻擊
function CLiAttack(message) {
    if (godFieldActive == false) return;
    newRound(message,1);
    damage = 0;

    if (CLiItems.some(e => e.type == "sundries") == true){
        // 克里+hp
        const CLiHPIndex = CLiItems.find(e => e.type == "sundries")
        message.channel.send(`CLi使用 >  \`${CLiHPIndex["name"]}(${CLiHPIndex["description"]})\``);
        CLiHp += parseInt(CLiHPIndex["effect"]);
        spliceCard(CLiItems.indexOf(CLiHPIndex), CLiItems);
        getNewCard(message, CLiItems);
        // message.channel.send(`CLi獲得新牌 >  \`${CLiItems[CLiItems.length - 1]["name"]}(${CLiItems[CLiItems.length - 1]["description"]})\``);
        showHp(message);
        newRound(message,0);

    } else if (CLiItems.some(e => e.type == "weapons") == true){
        // 克里攻擊
        const CLiAtkIndex = CLiItems.find(e => e.type == "weapons");
        message.channel.send(`CLi攻擊 >  \`${CLiAtkIndex["name"]}(${CLiAtkIndex["description"]})\``);
        damage += parseInt(CLiAtkIndex["effect"])
        spliceCard(CLiItems.indexOf(CLiAtkIndex), CLiItems);
        getNewCard(message, CLiItems);
        // message.channel.send(`CLi獲得新牌 >  \`${CLiItems[CLiItems.length - 1]["name"]}(${CLiItems[CLiItems.length - 1]["description"]})\``);
        message.channel.send(`${godFieldPlayer}的手牌 >  ${showItems(userItems)}`);
        message.channel.send(`${godFieldPlayer}防禦 >`);
        userTurn = false;
    } else {
        // 克里祈禱
        getNewCard(message, CLiItems);
        message.channel.send(`CLi祈禱 >  獲得  \`${CLiItems[CLiItems.length -1]["name"]}(${CLiItems[CLiItems.length -1]["description"]})\``);

        if (CLiItems.length > 16){
            let discard = getRandomInt(1,15);
            console.log(`丟棄 >  ${CLiItems[discard]}`)
            CLiItems.splice(discard, 1);
        }
        // message.channel.send(`CLi手牌 > ${showItems(CLiItems)}`); 
        newRound(message,0);
    }
}

// 玩家攻擊
function playerAttact (message) {
    // 祈禱
    if (message.content == "0"){
        getNewCard(message, userItems);
        message.channel.send(`${godFieldPlayer}祈禱 >  獲得\`${userItems[userItems.length -1]["name"]}(${userItems[userItems.length -1]["description"]})\``);
        // 手牌超過15張(不含祈禱) 
        if (userItems.length > 16){
            let discard = getRandomInt(1,15);
            message.channel.send(`${godFieldPlayer}自動丟棄 >  \`${userItems[discard]["name"]}(${userItems[discard]["description"]})\``);
            userItems.splice(discard, 1);
        }
        message.channel.send(`${godFieldPlayer}目前手牌 >  ${showItems(userItems)}`);
        CLiAttack(message);
        return;
    } 
    // 出牌
    if (message.content > (userItems.length - 1)) return;
    const p = message.content;
    damage = 0;

    if (userItems[p].type == "sundries") {
        // 使用雜貨
        message.channel.send(`${godFieldPlayer}使用 >  \`${userItems[p]["name"]}(${userItems[p]["description"]})\``);
        userHp += parseInt(userItems[p]["effect"]);
        showHp(message);
        spliceCard(p, userItems);
        getNewCard(message ,userItems);
        message.channel.send(`${godFieldPlayer}獲得新牌 >  \`${userItems[userItems.length -1]["name"]}(${userItems[userItems.length -1]["description"]})\``);
        CLiAttack(message);
        
    }else if (userItems[p].type == "armor"){
        // 使用防具(不可行)
        message.reply(`請使用武器 / 雜貨 / 祈禱`);
        
    }else if (userItems[p].type == "weapons"){
        // 攻擊
        damage -= parseInt(userItems[p]["effect"]);
        message.channel.send(`${godFieldPlayer}攻擊 >  \`${userItems[p]["name"]}(${userItems[p]["description"]})\``);
        spliceCard(p, userItems);
        getNewCard(message ,userItems);
        message.channel.send(`${godFieldPlayer}獲得新牌 >  \`${userItems[userItems.length -1]["name"]}(${userItems[userItems.length -1]["description"]})\``);
        CliDefend(message);
        CLiAttack(message);
    }    
}

// 玩家防禦
function playerDefend (message) {
    const p = message.content;
    if (p > (userItems.length - 1)) return;

    // 允許(沒防具)
    if (message.content == "0"){
        userHp -= damage;
        message.channel.send(`${godFieldPlayer}防禦 >  允許`);
        message.channel.send(`${godFieldPlayer}受到傷害 >  ${Math.abs(damage)}`);
        showHp(message);
        // 昇天
        if (userHp < 1){
            message.channel.send(`${godFieldPlayer}昇天 > 遊戲結束\n### 贏家 CLi`);
            closeGodField ();
        } else {
            newRound(message,0);
        }
    } else if (userItems[p]["effect"] < 0){
    // 防禦
        damage += parseInt(userItems[p]["effect"]);
        if (damage > 0){ 
            message.channel.send(`${godFieldPlayer}防禦 >  \`${userItems[p]["name"]}(${userItems[p]["description"]})\``);
            message.channel.send(`${godFieldPlayer}受到傷害 >  ${damage}`);
            userHp -= damage;
        } else {
            message.channel.send(`${godFieldPlayer}防禦 >  \`${userItems[p]["name"]}(${userItems[p]["description"]})\`  [平安]`);
        }
        showHp(message);
        spliceCard(p, userItems);
        getNewCard(message, userItems);
        message.channel.send(`${godFieldPlayer}獲得新牌 >  \`${userItems[userItems.length -1]["name"]}(${userItems[userItems.length -1]["description"]})\``);
        if (userHp < 1){
            message.channel.send(`${godFieldPlayer}昇天 > 遊戲結束\n### 贏家 CLi`);
            closeGodField ();
        } else {
            newRound(message,0);
        }
    } else {
        message.channel.send(`請使用防具 / 允許`)
    }
}

// 玩家出牌
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    if (message.channel.id != godFieldChannel) return;


    if (godFieldActive == true) {
        // console.log(godFieldPlayer)

        if (message.author.username != godFieldPlayer) return; //防止別的玩家出牌

        // 顯示手牌
        if (message.content === "手牌"){
            message.channel.send(`${godFieldPlayer}的手牌 >  ${showItems(userItems)}`);
        }

        // 玩家的回合
        const rePlay = /\d\b/.test(message);
        if (rePlay != true) return;
        if (userTurn == true){
            // 玩家攻擊
            playerAttact(message);
        } else {
            // 玩家防禦
            playerDefend(message);
        }  
    
    }})

    // 中途結束神界
client.on(Events.MessageCreate,(message) => {
    if (message.author.bot) return;
    // if (message.channel.id != godFieldChannel) return;
    if (message.content === "結束"){
        closeGodField();
        console.log("close godField");
    }
    
})

client.login(token);