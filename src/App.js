// Libs
import React, {Component} from 'react';
import LocalStorageMixin from 'react-localstorage';

// components
import './App.css';
import Activities from './Activities';
import EditActivity from './EditActivity';
import What from './What';

// helpers
import minutesLeftInActivity from './minutesLeftInActivity';

class App extends Component {
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

      activityName: null, // if an activity is chosen it'll be savaed here until replaced or reset
      activityStartTime: null, // ISO8601 string timestamp of activity start for displaying time left (and resetting when that gets to 0)
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
    this.componentWillUpdate = LocalStorageMixin.componentWillUpdate.bind(this);
    this._updateActivity = this._updateActivity.bind(this);
    this._toggleArchived = this._toggleArchived.bind(this);
    this.addActivityConstraint = this.addActivityConstraint.bind(this);
    this._resetActiveActivity = this._resetActiveActivity.bind(this);
    this._setActiveActivity = this._setActiveActivity.bind(this);
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
          updateActivity={this._updateActivity}
        />
      );
    }
    else if (mode === 'list') {
      body = <Activities
        activities={activities}
        archived={archived}
        toggle={this._toggleArchived}
      />;
    }

    return (
      <div className="App">
        {header}
        {mode !== 'what' ? // back button
          <BackButton onClick={() => this.setState({mode: 'what'})} />
        : null}
        {body}
        {mode !== 'create' ?
          <button
            className="create-todo single-button"
            onClick={() => this.setState({mode: 'create'})}
            >
            +
          </button>
        : null}
        {mode !== 'list'  && (Object.keys(activities).length || Object.keys(archived).length) ?
          <button
            className="activities-list single-button"
            onClick={() => this.setState({mode: 'list'})}
            >
            ☰
          </button>
        : null}
      </div>
    );
  }

  _setTime(time) {
    this.setState({time});
  }

  _updateActivity(name, idealTime) {
    const {activities} = this.state;

    const created = getNowISOString();
    activities[name] = {created, idealTime};
    this.setState({
      mode: 'what',
      time: null,
      activities,
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

