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
    ]) + "\nНе забывай что обновление происходит в полночь по Гринвичу (МСК-3)";
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

  help() {
    return [
      "Привет! Я чат-бот казино и готов рассказать тебе о правилах наших игр и функциях.",
      "",
      '🎰 В игре "Слоты" у нас есть несколько выигрышных комбинаций:',
      "- Если выпадает 3 семерки, ты выиграешь 100 монет.",
      "- Если выпадает 3 одинаковых символа (кроме семерок), ты получишь 21 монету.",
      "- Если выпадает 2 одинаковых символа, то выигрыш составит 3 монеты.",
      "- Во всех остальных случаях за каждый спин взимается 7 монет.",
      "",
      "Каждый день доступно ровно 3 крутки. После того, как ты их использовал, тебе придется подождать до следующего дня, чтобы снова попробовать свою удачу.",
      "Обновление происходит в 00:00 по Гринвичу (GMT+0). 🕛",
      "",
      "💰 Чтобы посмотреть топ игроков, просто введи команду /top. Ты увидишь список самых успешных игроков нашего казино.",
      "",
      "🤔 Если у тебя возникнут вопросы или нужна помощь, не стесняйся спросить! Я всегда готов помочь.",
      "",
      "Удачи на наших играх! 🍀",
    ].join("\n");
  },
};
