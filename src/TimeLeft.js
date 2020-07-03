import minutesLeftInActivity from './minutesLeftInActivity';
import minutesToHumanString from './minutesToHumanString';
import marked from 'marked';
import {MS_PER_SECOND} from './constants';
import React from 'react';

class TimeLeft extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
    this._check = this._check.bind(this);
    this._clearTimer = this._clearTimer.bind(this);
    this._done = this._done.bind(this);
  }

  componentDidMount() {
    this._clearTimer();
    this._timer = setInterval(
      this._check,
      10 * MS_PER_SECOND
    );
  }

  render() {
    const {activityName, activities, startTime} = this.props;

    const minutesLeft = minutesLeftInActivity(activityName, activities, startTime)

    if (minutesLeft <= 0) {
      this._done();
      return null;
    }

    return (
      <div>
        <h2>current activity:</h2>
        <h1 dangerouslySetInnerHTML={{__html: marked(activityName)}} />
        <p>{minutesToHumanString(minutesLeft)} left</p>
        <button className='choice' onClick={this._done} style={{display: 'inline-block', width: 'auto'}}>
          start again
        </button>

      </div>
    );
  }

  _check() {
    this.forceUpdate();
  }

  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _done() {
    this._clearTimer();
    this.props.reset();
  }
}

export default TimeLeft;
