export const parseEmojis = (text) => {
    let replaced = text;
    replaced = replaced.replace(":)", "\uD83D\uDE04");
    replaced = replaced.replace(";)", "\uD83D\uDE09");
    replaced = replaced.replace("<3", "\uD83D\uDE0D");
    replaced = replaced.replace("8)", "\uD83D\uDE0E");
    replaced = replaced.replace("x)", "\uD83D\uDE06");
    replaced = replaced.replace(":P", "\uD83D\uDE1B");
    replaced = replaced.replace(":O", "\uD83D\uDE2E");
    replaced = replaced.replace(":(", "\uD83D\uDE26");
    replaced = replaced.replace(":@", "\uD83D\uDE21");
    return replaced;
};