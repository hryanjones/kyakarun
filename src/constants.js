const TIME_BREAK_POINTS = [
  5,
  15,
  30,
  60,  // 1 hr
  90,  // 1 hr 30 mins
  120, // 2 hrs
];

const MS_PER_SECOND = 1000/*milliseconds per second*/;
const MS_PER_MINUTE = 60/*seconds per minute*/ * MS_PER_SECOND;

export default {MS_PER_MINUTE, MS_PER_SECOND, TIME_BREAK_POINTS};
