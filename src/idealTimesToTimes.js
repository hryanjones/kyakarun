export default idealTimesToTimes;

function idealTimesToTimes(idealTimes) {
  return Object.keys(idealTimes)
    .map(t => parseInt(t, 10)) // make sure it's an int (object keys are strings, I think)
    .sort((a, b) => a - b); // sort numerically instead of alphabetically
}
