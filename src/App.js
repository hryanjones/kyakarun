import React, {Component} from 'react';
import LocalStorageMixin from 'react-localstorage';
// import moment from 'moment';

import './App.css';
import Activities from './Activities';
import EditActivity from './EditActivity';
import What from './What';

class App extends Component {
  constructor() {
    super();
    this.state = {
      activities: {}, // main store of activities -> LocalStorage

      // this is actually an object of objects first key is ideal time minutes, second key is activity name
      idealTimes: {}, // idealTime (minutes) to activity name lookup -> LocalStorage

      // create -> create a new activity (should be able to edit soon too)
      // what -> what to do now?
      // list -> list the activities (edit will be accessible from here and also from a suggested task)
      mode: 'what',
      // archived: {}, // TODO (not used yet) this is where we store things that are done or deleted
    };

    this.componentDidMount = LocalStorageMixin.componentDidMount.bind(this);
    this.componentWillUpdate = LocalStorageMixin.componentWillUpdate.bind(this);
    this._updateActivity = this._updateActivity.bind(this);
    // this._toggleArchived = this._toggleArchived.bind(this);
  }

  getStateFilterKeys() {
    // return ['activities', 'idealTimes', 'archived'];
    return ['activities', 'idealTimes'];
  }

  componentDidUpdate() {
    if (this.state.mode === 'create' && this.refs.activityName) { // when we're creating/editing
      this.refs.activityName.select(); // put focus in the activity's name box
    }
  }

  render() {
    const {activities, archived, idealTimes, mode} = this.state;

    let body, header;

    const devTODOs = <div className="TODOs">
      # YOU"RE IN A WEIRD STATE, HERE ARE THE TODOS FOR THIS APP<br/>
      <br/>
      # TODO<br/>
      * View & Edit existing tasks (delete goes to same place as done -> archive)<br/>
      * do weighted choice... Array with values equal to object, repeats for higher priority, & result being the same object.<br/>
      * Also select tasks at next level up or down at smaller weighted rate<br/>
      * Timer screen when say "okay"<br/>
      * Make it so you can add 1-time & recurring things<br/>
      * ~~break things up into smaller components~~<br/>
      * ~~use an object to store todos, I mean activities~~<br/>
      * ~~Has to be really easy to add a task (big + always visible on bottom right)~~<br/>
      * ~~Each thing should have a time range associated with it (any by default)~~<br/>
      * ~~local storage~~<br/>
      <br/>
      # Nice to have<br/>
      * notification on the top (have to allow site to send notifications)<br/>
      &npsp;&nbsp;* notifications would be for entering the app and saying what you're currently doing
      * Tell the browser to cache the site
      * logo<br/>
    </div>;

    if (mode === 'what') {
      body = <What activities={activities} idealTimes={idealTimes} />;
    }
    else if (mode === 'create') {
      body = <EditActivity activities={activities} updateActivity={this._updateActivity} />;
    }
    else if (mode === 'list') {
      body = <Activities
        activities={activities}
        archived={archived}
        //toggle={this._toggleArchived}
      />;
    }
    else {
      body = devTODOs;
    }

    return (
      <div className="App">
        {header}
        {mode !== 'what' ? // back button
          <button
            onClick={() => this.setState({mode: 'what'})}
            className='single-button cancel'
            >
            <span>+</span>
          </button>
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
        {mode !== 'list'  && Object.keys(idealTimes).length ?
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
	  // FIXME need to move most of this to Edit Activity
    const {activities, idealTimes} = this.state;

    const created = getNowISOString();
    activities[name] = {created, idealTime};
    addToIdealTimes(idealTimes, idealTime, name);
    this.setState({
      mode: 'what',
      time: null,
      activities,
      idealTimes,
    });
  }

  // _toggleArchived(name) {
  //   const {activities, archived} = this.state;
  //   const activity = activities[name];
  //   const archivedActivity = archived[name];
  //   const newActivities = Object.assign({}, activities);
  //   const newArchived = Object.assign({}, archived);
  //   if (activity) { // archive it
  //     newArchived[name] = activity;
  //     delete newActivities[name];
  //   }
  //   if (archivedActivity) {
  //     newActivities[name] = activity;
  //     delete newArchived[name];
  //   }
  //   this.setState({activities: newActivities, archived: newArchived});
  // }
}

function addToIdealTimes(idealTimes, idealTime, activityName) {
  if (!idealTimes || !idealTime || !activityName) {
    throw new Error('Hmmm, can\'t add to idealTimes with these inputs: ', idealTimes, idealTime, activityName);
  }
  idealTimes[idealTime] = idealTimes[idealTime] || {};
  idealTimes[idealTime][activityName] = true;
}

// generally need Dates to be strings so they can be JSONified in local storage
function getNowISOString() {
  return (new Date()).toISOString();
}


export default App;

