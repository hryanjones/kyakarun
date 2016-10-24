export default minutesToHumanString;

function minutesToHumanString(minutes) {
  if (Number.isFinite(minutes)) {
    throw new Error('`minutes` should be a finite number. You gave: ' + minutes);
  }
  if (minutes < 60) {
    return minutes + ' minutes';
  }
  const hours = Math.floor(minutes / 60);
  return [
    hours,
    hours === 1 ? 'hour' : 'hours',
    minutes % 60,
    'minutes',
  ].join(' ');
}
