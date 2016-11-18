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
      error: '',
    };
  }

  componentDidMount() {
    this.refs.activityName.focus();
  }

  render() {
    const {error} = this.state;
    return  (
      <form onSubmit={this._updateActivity.bind(this)}>
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
        <input type='submit' value='create'/>
        {error ?
          <div className='error'>{error}</div>
        : null}
      </form>
    );
  }

  _updateActivity(e) {
    e.preventDefault();
    const {activities, archived} = this.props;
    const {activityName, activityIdealTime} = this.refs;
    const name = activityName.value;
    const idealTime = parseInt(activityIdealTime.value, 10);

    const existingActivity = activities[name];
    const existingArchived = archived[name];

    // validation
    // FIXME need validation
    const error = validateActivity(name, idealTime);
    if (error) {
      return this.setState({error});
    }

    this.props.updateActivity(name, idealTime);

    return;

    function validateActivity(name, idealTime) {
      if (!name) {
        return 'Please name your activity.';
      }
      if (existingActivity) {
        return `There's already an activity with that name.`;
      }
      if (existingArchived) {
        return `There's an archived activity with that name.`;
      }
      if (!Number.isFinite(idealTime)) {
        return 'Please set an ideal time for your activity.';
      }
    }
  }
}


export default EditActivity;
