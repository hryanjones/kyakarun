import React, {Component} from 'react';
import minutesToHumanString from './minutesToHumanString';
import {TIME_BREAK_POINTS} from './constants';

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
    const {activityToEdit, activities} = this.props; // activityToEdit for editing, otherwise creating
    let activity;
    let selectProps = {};

    if (activityToEdit) {
      activity = activities[activityToEdit];
      if (!activity) {
        throw new Error(`should have found activity for this name: "${activityToEdit}"`);
      }
      selectProps = {defaultValue: activity.idealTime};
    }

    return  (
      <form onSubmit={this._updateActivity.bind(this)}>
        <h2>{activityToEdit ? 'New' : 'Edit'} activity</h2>
        <div>
          <label>
            Name:
            <input ref='activityName' placeholder='name your activity' type='text' defaultValue={activityToEdit}/>
          </label>
          <label>
            Ideal time for activity:
            <select {...selectProps} ref='activityIdealTime'>
              {!activityToEdit ? // only need this select option, if we're not editing an existing activity
                <option>-- select a duration --</option>
              : null}
              {TIME_BREAK_POINTS.map(minutes =>
                <option key={minutes} value={minutes}>{minutesToHumanString(minutes)}</option>
              )}
            </select>
          </label>
        </div>
        <input type='submit' value={activityToEdit ? 'Update' : 'Create'}/>
        {error ?
          <div className='error'>{error}</div>
        : null}
      </form>
    );
  }

  // FIXME for constraints -- need to move this validation to the top level component
  // if update succeeds, it passes back nothing. if it fails it passes back an error string.
  _updateActivity(e) {
    e.preventDefault();
    const {activities, archived, activityToEdit} = this.props;
    const {activityName, activityIdealTime} = this.refs;
    const name = activityName.value;
    const idealTime = parseInt(activityIdealTime.value, 10);

    // validation
    const error = validateActivity(name, idealTime);
    if (error) {
      return this.setState({error});
    }

    this.props.updateActivity(name, idealTime, activityToEdit);

    return;

    function validateActivity(name, idealTime) {
      if (!name) {
        return 'Please name your activity.';
      }
      if (!Number.isFinite(idealTime)) {
        return 'Please set an ideal time for your activity.';
      }

      // check for duplicate names (no overwrite unless we're editing!)
      const existingActivity = activities[name];
      const existingArchived = archived[name];

      if (existingArchived) {
        return `There's already an archived activity with that name.`;
      }

      if (existingActivity && existingActivity !== activityToEdit) {
        return `There's already an activity with that name.`;
      }
    }
  }
}


export default EditActivity;
