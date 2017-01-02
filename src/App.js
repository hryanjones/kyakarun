// Libs
import React from 'react';
import LocalStorageMixin from 'react-localstorage';

// components
import './App.css';
import Activities from './Activities';
import EditActivity from './EditActivity';
import What from './What';

// helpers
import minutesLeftInActivity from './minutesLeftInActivity';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      activities: {}, // main store of activities -> LocalStorage

      // this is actually an object of objects first key is ideal time minutes, second key is activity name

      // create -> create a new activity (should be able to edit soon too)
      // what -> what to do now?
      // list -> list the activities (edit will be accessible from here and also from a suggested task)
      mode: 'what',
      archived: {}, // this is where we store things that are done or deleted

      activityName: null, // if an activity is chosen or is being edited it'll be saved here until replaced or reset
      activityStartTime: null, // ISO8601 string timestamp of activity start for displaying time left (and resetting when that gets to 0)
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
    this.componentWillUpdate = LocalStorageMixin.componentWillUpdate.bind(this);

    [
      '_updateActivity',
      '_toggleArchived',
      'addActivityConstraint',
      '_resetActiveActivity',
      '_setActiveActivity',
    ]
    .forEach(fcn => {
      this[fcn] = this[fcn].bind(this);
    });
  }

  getStateFilterKeys() {
    return ['activities', 'archived', 'activityName', 'activityStartTime'];
  }

  componentDidUpdate() {
    if (this.state.mode === 'create' && this.refs.activityName) { // when we're creating/editing
      this.refs.activityName.select(); // put focus in the activity's name box
    }
  }

  render() {
    const {activityName, activityStartTime, activities, archived, mode} = this.state;

    let body;

    if (minutesLeftInActivity(activityName, activities, activityStartTime) > 0) {
      body = <TimeLeft
        activityName={activityName}
        activities={activites}
        startTime={activityStartTime}
        reset={this._resetActiveActivity}
      />;
      if (body) {
        return [body, <BackButton onClick={this._resetActiveActivity} />];
      }
    }

    if (mode === 'what') {
      body = <What
        activities={activities}
        addActivityConstraint={this.addActivityConstraint}
        acceptSuggestion={this._setActiveActivity}
      />;
    }
    else if (mode === 'create') {
      body = (
        <EditActivity
          activities={activities}
          archived={archived}
          activityToEdit={activityName}
          updateActivity={this._updateActivity}
        />
      );
    }
    else if (mode === 'list') {
      body = <Activities
        activities={activities}
        archived={archived}
        toggle={this._toggleArchived}
        edit={name => this.setState({mode: 'create', activityName: name})}
      />;
    }

    return (
      <div className='App'>
        <div className='header'>
          {mode === 'what' ?
            <button
              className='activities-list'
              onClick={() => this.setState({mode: 'list'})}
              >
              ☰
            </button>
          :
            <button // back button
              className='cancel'
              onClick={() => this.setState({mode: 'what', activityName: null})}
              >
              ↩
            </button>
          }
          Kya Karun
        </div>

        <div className='body'>
          {body}
        </div>
        {mode !== 'create' ?
          <button
            className='create-todo single-button primary'
            onClick={() => this.setState({mode: 'create'})}
            >
            +
          </button>
        : null}
      </div>
    );
  }

  _setTime(time) {
    this.setState({time});
  }

  _updateActivity(name, idealTime, oldName) {
    const {activities} = this.state;
    const newActivities = Object.assign({}, activities);

    if (!oldName) { // creating a new activity
      newActivities[name] = {idealTime, created: getNowISOString()};
    } else {
      // updating an existing activity
      const activity = activities[oldName];
      newActivities[name] = Object.assign({}, activity, {idealTime, updated: getNowISOString()});
      if (name !== oldName) {
        delete newActivities[oldName];
      }
    }

    this.setState({
      activities: newActivities,
      mode: 'what',
      time: null,
      activityName: null,
    });
  }

  // wow it is really hard to update a constraint in a non-mutating way :(
  addActivityConstraint(name, newConstraint) {
    let {activities} = this.state;
    let activity = activities[name];
    if (!activity) {
      throw new Error('No activity to add a constraint to for the given activity name: ' + name);
    }
    const constraints = Object.assign({}, activity.constraints);
    constraints[newConstraint] = true;
    activity = Object.assign({}, activity, {constraints});
    activities = Object.assign({}, activities, {[name]: activity});
    this.setState({activities});
  }

  _toggleArchived(name) {
    const {activities, archived} = this.state;
    const activity = activities[name];
    const archivedActivity = archived[name];
    const newActivities = Object.assign({}, activities);
    const newArchived = Object.assign({}, archived);
    if (activity) { // archive it
      newArchived[name] = activity;
      delete newActivities[name];
    }
    if (archivedActivity) {
      newActivities[name] = archivedActivity;
      delete newArchived[name];
    }
    this.setState({activities: newActivities, archived: newArchived});
  }

  _resetActiveActivity() {
    this.setState({activityName: null, activityStartTime: null});
  }

  _setActiveActivity(activityName) {
    const activityStartTime = getNowISOString();
    this.setState({activityName, activityStartTime});
  }
}

// generally need Dates to be strings so they can be JSONified in local storage
function getNowISOString() {
  return (new Date()).toISOString();
}


export default App;

