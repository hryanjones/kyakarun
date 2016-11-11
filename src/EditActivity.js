import React, {Component} from 'react';
import minutesToHumanString from './minutesToHumanString';

const TIME_BREAK_POINTS = [
  5,
  15,
  30,
  60,  // 1 hr
  90,  // 1 hr 30 mins
  120, // 2 hrs
];

class EditActivity extends Component {
  constructor() {
    super();
    this.state = {
      rejected: {}, // used to remove choices that have been rejected
      time: null, // selected idealTime
    };
  }

  componentDidMount() {
    this.refs.activityName.focus();
  }

  render() {
    return  (
      <div>
        <h2>New activity</h2>
        <div>
          <label>
            Name:
            <input ref='activityName' placeholder='name your activity' type='text'/>
          </label>
          <label>
            Ideal time for activity:
            <select ref='activityIdealTime'>
              <option>-- select a duration --</option>
              {TIME_BREAK_POINTS.map(minutes =>
                <option key={minutes} value={minutes}>{minutesToHumanString(minutes)}</option>
              )}
            </select>
          </label>
        </div>
        <button onClick={this._updateActivity.bind(this)}>create</button>
      </div>
    );
  }

  _updateActivity() {
    // FIXME
      // need to check here or somewhere else if there's an activity named the same and it's not the activity being edited

    const {activityName, activityIdealTime} = this.refs;
    const name = activityName.value;
    const idealTime = parseInt(activityIdealTime.value, 10);
    if (!name || !idealTime || !Number.isFinite(idealTime)) {
      // TODO show validation in the UI
      return;
    }
    this.props.updateActivity(name, idealTime);
  }
}

export default EditActivity;
