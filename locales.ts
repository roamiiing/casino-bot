import { round } from "./generators/utils.ts";

const plural = (number: number, titles: string[]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const absolute = Math.abs(number);
  return (
    number +
    " " +
    titles[
      absolute % 100 > 4 && absolute % 100 < 20
        ? 2
        : cases[absolute % 10 < 5 ? absolute % 10 : 5]
    ]
  );
};

const getSafeStringValue = (x: number): { safe: boolean; value: number } => {
  if (Number.isNaN(x)) return { safe: false, value: 0 };
  if (!Number.isFinite(x)) return { safe: false, value: 0 };
  return { safe: true, value: x };
};

const getRandomFromArray = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const locales = {
  topPlayers() {
    return getRandomFromArray([
      "🏆 Топ игроков 🏆",
      "Мажоры нашего казино 🤑",
      "🥇 Топ игроков 🥇",
    ]);
  },

  doNotCheat() {
    return getRandomFromArray([
      "Не пытайся меня обмануть! 😡",
      "Ты думаешь, что я не замечу? 🧐",
      "Не обманывай меня! 😠",
    ]);
  },

  attemptsLimit(limit: number) {
    const pluralizedLimit = plural(limit, ["ставку", "ставки", "ставок"]);
    const pluralizedTimes = plural(limit, ["раз", "раза", "раз"]);

    // "You have reached your attempts limit for today. Try again tomorrow!"
    return getRandomFromArray([
      `Лимит ставок на сегодня исчерпан (${pluralizedLimit}). Попробуй завтра! 🤑`,
      `Сегодня ты уже сделал ${pluralizedLimit}. Попробуй завтра! 🤑`,
      `Я понимаю, что золотая лихорадка в самом разгаре, но ты уже поставил ${pluralizedTimes} сегодня. Попробуй завтра! 🤑`,
    ]) +
      "\n<i>Не забывай, что обновление происходит в полночь по Гринвичу (МСК-3)</i>";
  },

  notEnoughCoins(coins: number) {
    return `${
      getRandomFromArray([
        "А ты думал, что я тебе деньги дам? 😂",
        "Кажется, у кого-то закончились монеты. 😢",
      ])
    } Крутить барабан стоит ${coins} монет.`;
  },

  win(wonCoins: number, lostCoins: number) {
    const pluralizedWonCoins = plural(wonCoins - lostCoins, [
      "монету",
      "монеты",
      "монет",
    ]);

    return getRandomFromArray([
      `Поздравляю, ты выиграл <i>${wonCoins} - ${lostCoins} (ставка) = <b>${pluralizedWonCoins}</b></i>! 🎉 Наслаждайся своей удачей и продолжай играть, чтобы еще больше увеличить свой капитал!`,
      `Ого, ты сегодня и правда везунчик! Твой выигрыш составил <i>${wonCoins} - ${lostCoins} (ставка) = <b>${pluralizedWonCoins}</b></i>! 💰 Поздравляю с впечатляющим результатом! Наслаждайся игрой и не забывай, что завтра тебе всегда доступно еще больше возможностей!`,
      `Лед тронулся! Ты сорвал куш в размере <i>${wonCoins} - ${lostCoins} (ставка) = <b>${pluralizedWonCoins}</b></i>! 💸 Поздравляю с великолепным выигрышем! Теперь у тебя много вариантов, как потратить свои новые сокровища!`,
      `Господи, удача на тебе улыбается! 😃 Ты выиграл <i>${wonCoins} - ${lostCoins} (ставка) = <b>${pluralizedWonCoins}</b></i> и сделал свой день ярче! Продолжай в том же духе и получай еще больше радости от игры!`,
    ]);
  },

  lose(lostAmount: number, compensation: number) {
    const pluralizedLostAmount = plural(lostAmount - compensation, [
      "монету",
      "монеты",
      "монет",
    ]);

    return getRandomFromArray([
      `Ай-ай-ай, сегодня удача не на твоей стороне! Ты потерял <i>${lostAmount} - ${compensation} (компенсация) = <b>${pluralizedLostAmount}</b></i> 💸 Не унывай, в следующий раз обязательно повезет!`,
      `Ой-ой, кажется, сегодня тебе не суждено было победить. Твой банковский баланс стал на <i>${lostAmount} - ${compensation} (компенсация) = <b>${pluralizedLostAmount}</b></i> меньше 🙇‍♂️ Но не расстраивайся, у тебя всегда есть возможность вернуться и сорвать большой куш!`,
      `Упс, казино победило сегодня. Ты потерял <i>${lostAmount} - ${compensation} (компенсация) = <b>${pluralizedLostAmount}</b></i> в этой игре. Не отчаивайся, следующий расклад обязательно будет в твою пользу!`,
    ]);
  },

  gasReminder(gasAmount: number) {
    const pluralizedCoins = plural(gasAmount, ["монету", "монеты", "монет"]);

    return `<i>Кстати, за эту операцию сняли еще ${pluralizedCoins}</i>`;
  },

  yourBalance(coins: number) {
    const pluralizedCoins = plural(coins, ["монета", "монеты", "монет"]);

    return `Твой баланс: <b>${pluralizedCoins}</b>`;
  },

  stakesCreated(stakesCount: number) {
    if (stakesCount === 0) {
      return "<b>Пока не было ни одной ставки</b>";
    }

    const pluralizedCount = plural(stakesCount, [
      "ставка",
      "ставки",
      "ставок",
    ]);

    return `<b>На следующий забег стоит ${pluralizedCount}</b>`;
  },

  koefs(ks: Record<number | string, number>) {
    const horseKs = Object.entries(ks).reduce((acc, [horseId, k]) => {
      const { safe, value } = getSafeStringValue(k);
      acc += `Лошадь ${Number(horseId) + 1}: <i>${
        safe ? `x${round(value, 3)}` : "N/A"
      }</i>\n`;
      return acc;
    }, "");

    return `<b>Коэффициенты:</b>\n${horseKs}`;
  },

  freespinQuote(code: string) {
    return `\nℹ️ <i>Кстати, кто-то кроме тебя может применить подарочный код, для этого нужно отправить мне в личку \n<code>/redeem ${code}</code> (тык),\nи получить круточку бесплатно. \nКто же окажется самым быстрым?</i>`;
  },

  freespinRedeemedQuote() {
    return `\n✅ <i>Тут был подарочный код, но он уже активирован! \nМожет повезет в следующий раз?</i>`;
  },

  help() {
    return [
      "Привет! Я чат-бот казино и готов рассказать тебе о правилах наших игр и функциях.",
      "",
      '🎰 В игре "Слоты" у нас есть несколько выигрышных комбинаций:',
      "- Если выпадает 3 семерки, ты выиграешь 77 монет.",
      "- Если выпадает 3 лимона, ты выиграешь 30 монет.",
      "- Если выпадает 3 ягоды, ты выиграешь 23 монеты.",
      "- Если выпадает 3 бара, ты получишь 21 монету.",
      "- Если выпадает 2 одинаковых символа, то выигрыш составит 4 + ценности всех значков монет.",
      "- Во всех остальных случаях вы получите компенсацию из суммы ценностей значков.",
      "",
      "Каждая круточка стоит 7 монет (а еще одну заберет бот за свою работу), но выиграть большие суммы оченб легко!",
      "",
      "Каждый день доступно ровно 3 крутки. После того, как ты их использовал, тебе придется подождать до следующего дня, чтобы снова попробовать свою удачу.",
      "Обновление происходит в 00:00 по Гринвичу (GMT+0). 🕛",
      "Кстати, иногда выпадают подарочные коды с круток других игроков, следи за чатом!",
      "",
      "💰 Чтобы посмотреть топ игроков, просто введи команду /top. Ты увидишь список самых успешных игроков нашего казино.",
      "",
      "🤔 Если у тебя возникнут вопросы или нужна помощь, не стесняйся спросить! Я всегда готов помочь.",
      "",
      "Удачи на наших играх! 🍀",
    ].join("\n");
  },
};
