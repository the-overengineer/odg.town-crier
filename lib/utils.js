/**
 * 
 * @param {Date} date 
 * @returns {string}
 */
function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${leftPad(hours, 2)}:${leftPad(minutes, 2)}`;
}

function leftPad(str, length, char = '0') {
  if (str.length >= length) {
    return str;
  }

  return `${char.repeat(length - str.length)}${str}`;
}

/**
 * Checks whether a date is on tomorrow's date
 * @param {Date} date
 * @returns {boolean} Is the date tomorrow
 */
function isTomorrow(date) {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return tomorrow.getFullYear() === date.getFullYear()
        && tomorrow.getMonth() === date.getMonth()
        && tomorrow.getDate() === date.getDate();
}

module.exports = {
    formatTime,
    leftPad,
    isTomorrow,
};
