const {
  addDays,
  isSameDay,
  isTomorrow,
  formatDate,
} = require('date-fns');

/**
 * 
 * @param {Date} date 
 * @returns {string}
 */
function formatTime(date) {
  const intl = new Intl.DateTimeFormat("hr-HR", {
    timeStyle: "long",
    timeZone: "Europe/Zagreb",
  });

  return intl.format(date).slice(0, 5);
}

function leftPad(str, length, char = '0') {
  if (str.length >= length) {
    return str;
  }

  return `${char.repeat(length - str.length)}${str}`;
}

/**
 * Is the date in {days} days.
 * @param {Date} date Date to check
 * @param {number} days Number of days in the future
 */
function isInDays(date, days) {
  const now = new Date();
  const inDays = addDays(now, days);
  return isSameDay(date, inDays);
}

function isFriday(date) {
  return date.getDay() === 5;
}

/**
 * 
 * @param {string} versions 
 * @param {number} count 
 */
function pluralise(versions, count) {
  const parts = versions.split('|').map((v) => v.trim());

  if (count === 1) {
    return parts[0];
  } else if (count === 2 || count === 3) {
    return parts[1];
  } else {
    return parts[2];
  }
}

function getDisplayDate(date) {
  return formatDate(date, 'dd.MM.');
}

module.exports = {
    formatTime,
    leftPad,
    isTomorrow,
    isInDays,
    isFriday,
    pluralise,
    getDisplayDate,
};
