const plural = (number: number, titles: string[]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return (
    number +
    " " +
    titles[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : cases[number % 10 < 5 ? number % 10 : 5]
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
    ]);
  },

  notEnoughCoins(coins: number) {
    return `${getRandomFromArray([
      "А ты думал, что я тебе деньги дам? 😂",
      "Кажется, у кого-то закончились монеты. 😢",
    ])} Крутить барабан стоит ${coins} монет.`;
  },

  win(wonCoins: number) {
    const pluralizedWonCoins = plural(wonCoins, ["монету", "монеты", "монет"]);

    return getRandomFromArray([
      `Поздравляю, ты выиграл ${pluralizedWonCoins}! 🎉 Наслаждайся своей удачей и продолжай играть, чтобы еще больше увеличить свой капитал!`,
      `Ого, ты сегодня и правда везунчик! Твой выигрыш составил ${pluralizedWonCoins}! 💰 Поздравляю с впечатляющим результатом! Наслаждайся игрой и не забывай, что завтра тебе всегда доступно еще больше возможностей!`,
      `Лед тронулся! Ты сорвал куш в размере ${pluralizedWonCoins}! 💸 Поздравляю с великолепным выигрышем! Теперь у тебя много вариантов, как потратить свои новые сокровища!`,
      `Господи, удача на тебе улыбается! 😃 Ты выиграл ${pluralizedWonCoins} и сделал свой день ярче! Продолжай в том же духе и получай еще больше радости от игры!`,
    ]);
  },

  lose(lostAmount: number) {
    const pluralizedLostAmount = plural(lostAmount, [
      "монету",
      "монеты",
      "монет",
    ]);

    return getRandomFromArray([
      `Ай-ай-ай, сегодня удача не на твоей стороне! Ты потерял ${pluralizedLostAmount} 💸 Не унывай, в следующий раз обязательно повезет!`,
      `Ой-ой, кажется, сегодня тебе не суждено было победить. Твой банковский баланс стал на ${pluralizedLostAmount} меньше 🙇‍♂️ Но не расстраивайся, у тебя всегда есть возможность вернуться и сорвать большой куш!`,
      `Упс, казино победило сегодня. Ты потерял ${pluralizedLostAmount} в этой игре. Не отчаивайся, следующий расклад обязательно будет в твою пользу!`,
    ]);
  },

  yourBalance(coins: number) {
    const pluralizedCoins = plural(coins, ["монета", "монеты", "монет"]);

    return `Твой баланс: ${pluralizedCoins}`;
  },
};
