export default minutesToHumanString;

function minutesToHumanString(minutes, shouldShorten) {
  if (!Number.isFinite(minutes)) {
    throw new Error('`minutes` should be a finite number. You gave: ' + minutes);
  }
  let hourText = shouldShorten ? 'h' : 'hour';
  let minuteText = shouldShorten ? 'm' : 'minute';
  if (minutes < 60) {
    return timeString(minuteText, minutes);
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!remainingMinutes) {
    return timeString(hourText, hours);
  }

  return timeString(hourText, hours) + ' ' + timeString(minuteText, remainingMinutes);

  function timeString(word, num) {
    if (shouldShorten) {
      return num + word;
    }
    return num + ' ' + pluralize(word, num);
  }
}

function pluralize(word, num) {
  if (num === 1) {
    return word;
  }
  return word + 's';
}
