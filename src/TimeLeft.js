import minutesLeftInActivity from './minutesLeftInActivity';
import minutesToHumanString from './minutesToHumanString';
import {MS_PER_MINUTE} from './constants';
import React from 'react';

class TimeLeft extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
    this._done = this._done.bind(this);
  }

  componentDidMount() {
    if (this._timer) {
      this._timer.cancel(); // FIXME
    }
    this._timer = setInterval(
      this._done,
      1 * MS_PER_MINUTE
    );
  }

  render() {
    const {activityName, activities, startTime} = this.props;
    const activity = activities[activityName];

    const minutesLeft = minutesLeftInActivity(activityName, activities, startTime)

    if (minutesLeft <= 0) {
      return null;
    }

    return (
      <div>
        <h1>{activityName}</h1>
        <h3>{minutesToHumanString(minutesLeft)} left</h3>
      </div>
    );
  }

  _done() {
    this._time.cancel(); // FIXME
    const {reset} = this.props;
    reset && reset();
  }
}

export default TimeLeft;
