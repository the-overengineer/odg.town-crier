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

module.exports = {
    formatTime,
    leftPad,
};
