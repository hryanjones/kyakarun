export default minutesToHumanString;

function minutesToHumanString(minutes) {
  if (!Number.isFinite(minutes)) {
    throw new Error('`minutes` should be a finite number. You gave: ' + minutes);
  }
  if (minutes < 60) {
    return timeString('minute', minutes);
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!remainingMinutes) {
    return timeString('hour', hours);
  }

  return timeString('hour', hours) + ' ' + timeString('minute', remainingMinutes);
}

function timeString(word, num) {
  return num + ' ' + pluralize(word, num);
}

function pluralize(word, num) {
  if (num === 1) {
    return word;
  }
  return word + 's';
}
