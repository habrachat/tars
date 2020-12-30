const os = require('os');
const { spawn } = require('child_process');
const shell = spawn(os.platform() === 'win32' ? 'bash.exe' : 'bash');

shell.stdout.on('data', function(data) {
  const lines = data.toString()
    .split("\r\n")
    .filter(v => v.match(":") && !v.match(/^\[0;37;90m \*/g))
    .map(v => v
      .replace(/\u001b\[0K/g, "")
      .replace(/\[(\d{1,2};){0,2}\d{1,2}m/g, "")
      .replace(/\u001b/g, "")
    )
    .map(v => {
      const name = v.split(":")[0];
      const text = v.split(":").slice(1).join(":").replace(/^\s/g, "");
      const isBot = name.match(/bridge/g);
      return {
        name: isBot ? text && text.match(/<(.*?)>/g)[0].replace(/<|>/g, "") : name,
        src: isBot ? text && text.match(/\[(.*?)\]/g)[0].replace(/\[|\]/g, "") : "ssh",
        text: isBot ? text && text.replace(/\[(.*?)\] <(.*?)> /g, "") : text
      }
    });
  if (lines.length > 0) {
    onChat(lines);
  }
});

const elka = [
  ".................",
  "........*........",
  ".......***.......",
  "......*****......",
  ".....*******.....",
  ".......***.......",
  "С наступающим 2021, товарищи!"
];

const daysUntilNewYear = () => {
  const countdownDate = (new Date("01.01.2021")).getTime();
  const distance = countdownDate - (new Date().getTime()) - (1000 * 60 * 60 * 2);
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} ${
    days === 1 ? 'день' : [2,3,4].includes(days) ? 'дня' : 'дней'
  }, ${hours} ${
    hours === 1 ? 'час' : [2,3,4].includes(hours) ? 'часа' : 'часов'
  }, ${minutes} ${
    minutes === 1 ? 'минута' : [2,3,4].includes(minutes) ? 'минуты' : 'минут'
  }`;
}

const throwDice = txt => {
  const [count, sides] = /(\d{0,1})d(\d{1,2})/g.exec(txt).slice(1).map(v => parseInt(v));
  return Array.from({ length: count || 1 }).map(_ => Math.floor((Math.random() * sides) + 1)).reduce((a, d) => a + d, 0);
}

const match = (matches, text) => 
  Object.keys(matches).map(m => text.match(m) && matches[m](text)).filter(v => v).length === 0 && matches.default();

const onChat = msgs => {
  const msg = msgs[0];
  console.log(msg);
  if (msg.text.toLowerCase().match(/^(тарс|tars)/g)) {
    match({
      ["привет|hi"]: () => send("Привет-привет!"),
      ["елка|ёлка|елку|ёлку|ылку|йолку"]: () => elka.map((t, i) => setTimeout(() => send(t), 1500*i)),
      ["наступающим|новым"]: () => send("С наступающим 2021, товарищи!"),
      ["сиськи"]: () => send("(.) (.)"),
      ["когда новый|до нового"]: () => send(`До нового года ${daysUntilNewYear()}!`),
      ["[0-9]{0,1}d[0-9]{1,2}"]: text => send(`Выпало ${throwDice(text)}`),
      default: () => send("Что?"),
    }, msg.text.replace(/^(.*?)( |,)/g, "").toLowerCase())
  }
}

const send = msg => {
  shell.stdin.write(msg + "\r\n");
  return true;
}

shell.stdin.write('ssh tars@habr2021.podivilov.ru\n');
