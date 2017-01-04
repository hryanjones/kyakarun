// This is a bad hack to work with react-localstorage - FIXME

let hasLocalStorage = 'localStorage' in window;
const testKey = 'react-localstorage.mixin.test-key';
let ls;

if (hasLocalStorage) {
  try {
    // Access to global `localStorage` property must be guarded as it
    // fails under iOS private session mode.
    // ls = global.localStorage; // NOTE global not in browser root
    ls = window.localStorage;
    ls.setItem(testKey, 'foo');
    ls.removeItem(testKey);
  } catch (e) {
    hasLocalStorage = false;
  }
}

// Warn if localStorage cannot be found or accessed.
// if (process.browser) {
//   console.warn(
//     hasLocalStorage,
//     'localStorage not found. Component state will not be stored to localStorage.'
//   );
// }


const LocalStorageMixin = {
  /**
   * Error checking. On update, ensure that the last state stored in localStorage is equal
   * to the state on the component. We skip the check the first time around as state is left
   * alone until mount to keep server rendering working.
   *
   * If it is not consistent, we know that someone else is modifying localStorage out from under us, so we throw
   * an error.
   *
   * There are a lot of ways this can happen, so it is worth throwing the error.
   */
  componentWillUpdate(nextProps, nextState) {
    if (!hasLocalStorage || !this.__stateLoadedFromLS) return;
    let key = getLocalStorageKey(this);
    if (key === false) return;
    let prevStoredState = ls.getItem(key);
    // if (prevStoredState && process.env.NODE_ENV !== "production") { // NOTE process not in browser root
    if (prevStoredState) {
      console.warn(
        prevStoredState === JSON.stringify(getSyncState(this, this.state)),
        'While component ' + getDisplayName(this) + ' was saving state to localStorage, ' +
        'the localStorage entry was modified by another actor. This can happen when multiple ' +
        'components are using the same localStorage key. Set the property `localStorageKey` ' +
        'on ' + getDisplayName(this) + '.'
      );
    }
    // Since setState() can't be called in CWU, it's a fine time to save the state.
    ls.setItem(key, JSON.stringify(getSyncState(this, nextState)));
  },

  /**
   * Load data.
   * This seems odd to do this on componentDidMount, but it prevents server checksum errors.
   * This is because the server has no way to know what is in your localStorage. So instead
   * of breaking the checksum and causing a full rerender, we instead change the component after mount
   * for an efficient diff.
   */
  componentDidMount () {
    if (!hasLocalStorage) return;
    let me = this;
    loadStateFromLocalStorage(this, function() {
      // After setting state, mirror back to localstorage.
      // This prevents invariants if the developer has changed the initial state of the component.
      ls.setItem(getLocalStorageKey(me), JSON.stringify(getSyncState(me, me.state)));
    });
  }
};

function loadStateFromLocalStorage(component, cb) {
  if (!ls) return;
  let key = getLocalStorageKey(component);
  if (key === false) return;
  let settingState = false;
  try {
    let storedState = JSON.parse(ls.getItem(key));
    if (storedState) {
      settingState = true;
      component.setState(storedState, done);
    }
  } catch(e) {
    if (console) console.console.warn("Unable to load state for", getDisplayName(component), "from localStorage.");
  }
  // If we didn't set state, run the callback right away.
  if (!settingState) done();

  function done() {
    // Flag this component as loaded.
    component.__stateLoadedFromLS = true;
    cb();
  }
}

function getDisplayName(component) {
  // at least, we cannot get displayname
  // via this.displayname in react 0.12
  return component.displayName || component.constructor.displayName || component.constructor.name;
}

function getLocalStorageKey(component) {
  if (component.getLocalStorageKey) return component.getLocalStorageKey();
  if (component.props.localStorageKey === false) return false;
  if (typeof component.props.localStorageKey === 'function') return component.props.localStorageKey.call(component);
  return component.props.localStorageKey || getDisplayName(component) || 'react-localstorage';
}

function getStateFilterKeys(component) {
  if (component.getStateFilterKeys) {
    return typeof component.getStateFilterKeys() === 'string' ?
      [component.getStateFilterKeys()] : component.getStateFilterKeys();
  }
  return typeof component.props.stateFilterKeys === 'string' ?
    [component.props.stateFilterKeys] : component.props.stateFilterKeys;
}

/**
* Filters state to only save keys defined in stateFilterKeys.
* If stateFilterKeys is not set, returns full state.
*/
function getSyncState(component, state) {
  let stateFilterKeys = getStateFilterKeys(component);
  if (!stateFilterKeys) return state;
  let result = {};
  stateFilterKeys.forEach(function(sk) {
    for (let key in state) {
      if (state.hasOwnProperty(key) && sk === key) result[key] = state[key];
    }
  });
  return result;
}
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


class Activities extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
    this._renderActivities = this._renderActivities.bind(this);
  }

  render() {
    const {activities, archived} = this.props;

    return (
      <div className='activities'>
        <h1>Activities</h1>
        {this._renderActivities(activities)}
        {Object.keys(archived).length ?
          <div className='archived'>
            <hr/>
            <h2>Archived activities</h2>
            {this._renderActivities(archived, {archived: true})}
          </div>
        : null}
      </div>
    );
  }

  _renderActivities(activities, activityProps={}) {
    const {toggle, edit} = this.props;
    return (
      <ul>
        {Object.keys(activities).map(name => {
          const data = activities[name];
          activityProps = Object.assign(activityProps, {name, data, toggle, edit, key: name});
          return (<Activity {...activityProps}/>);
        })}
      </ul>
    );
  }
}

Activities.defaultProps = {
  activities: {},
  archived: {},
};



class Activity extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }
  render() {
    const {name, data, archived, toggle, edit} = this.props;
    const {idealTime} = data;
    return (
      <li className='activity'>
        <label>
          <input type='checkbox' style={{display: 'none'}}/>{/* for showing/hiding actions */}

          <div className='activity-data flex-space-between' style={{alignItems: 'baseline'}}>
            <div className='activity-name'>
              {name}
            </div>
            <div>
              ({minutesToHumanString(idealTime, 'shorten please')})
            </div>
          </div>

          <div className='activity-actions'>
              <button onClick={() => toggle(name)}>
                  {archived ? 'un' : ''}archive
              </button>
              {!archived ?
                <button onClick={() => edit(name)}>
                  edit
                </button>
              : null}
          </div>
        </label>
      </li>
    );
  }
}

// Libs

// components

// helpers

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      activities: {}, // main store of activities -> LocalStorage

      // create -> create a new activity or edit an existing one
      // what -> what to do now?
      // list -> list the activities (edit is also accessible from here, maybe also from a suggested task in future)
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
      '_reset',
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

    const minutesLeft = minutesLeftInActivity(activityName, activities, activityStartTime);

    if (minutesLeft > 0) {
      body = <TimeLeft
        activityName={activityName}
        activities={activities}
        startTime={activityStartTime}
        reset={this._reset}
      />;
    }

    if (!body && mode === 'what') {
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
          {mode === 'what' && minutesLeft <= 0 ?
            <button
              className='activities-list'
              onClick={() => this.setState({mode: 'list'})}
              >
              ☰
            </button>
          :
            <button className='cancel' onClick={this._reset}>
              ↩
            </button>
          }
          Kya Karun
        </div>

        <div className='body'>
          {body}
        </div>
        {mode !== 'create' && minutesLeft <= 0 ?
          <button
            className='create-todo single-button primary'
            onClick={() => this.setState({mode: 'create', activityName: null})}
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

  _reset() {
    this.setState({mode: 'what', activityName: null, activityStartTime: null});
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




// constraint suggestions
// "a quiet place"
// "to be at home"
// "an internet connection"
// "a real computer"

class CantButton extends React.Component {

  constructor() {
    super();
    this.state = {
      cant: false, // whether or not to show constraints as sub-options to pick
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activityName !== this.props.activityName) {
      this.setState({cant: false});
    }
  }

  render() {
    const {activityName, activity, rejectSuggestion} = this.props;
    const {cant} = this.state;
    const constraints = activity.constraints || {};

    // FIXME there's an update and validate function in EditActivity that needs to be moved to the top level for adding a new constraint
    return (
      <div>
          <button
            className='choice'
            onClick={() => this.setState({cant: true})}
            >
            can't {cant ? <span className='reason'>because I need...</span> : ''}
          </button>
          {cant ? Object.keys(constraints).map(constraint =>
            <button
              key={constraint}
              className='choice constraint reason'
              onClick={() => rejectSuggestion(activityName, constraint)}
              >
              ...{constraint}
            </button>
          ) : null}
          {cant ?
            <label className='constraint constraint-inline'>
              ...<input ref='newConstraint' type='text' placeholder="shortly describe what's missing"/>
              <button onClick={() => rejectSuggestion(activityName, this.refs.newConstraint.value)}>
                add constraint
              </button>
            </label>
          : null}
      </div>
    );
  }
}


class EditActivity extends React.Component {
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
        <h2>{activityToEdit ? 'Edit' : 'New'} activity</h2>
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
        <input className='primary' type='submit' value={activityToEdit ? 'Update' : 'Create'}/>
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

      if (existingActivity && name !== activityToEdit) {
        return `There's already an activity with that name.`;
      }
    }
  }
}



function idealTimesToTimes(idealTimes) {
  return Object.keys(idealTimes)
    .map(t => parseInt(t, 10)) // make sure it's an int (object keys are strings, I think)
    .sort((a, b) => a - b); // sort numerically instead of alphabetically
}

class What extends React.Component {
  constructor() {
    super();
    this.state = {
      rejected: {}, // used to remove choices that have been rejected
      rejectedConstraints: {}, // the name of a constraint that should filter out further suggestions
      time: null, // selected idealTime
    };
    this._resetSuggestion = this._resetSuggestion.bind(this);
    this._rejectSuggestion = this._rejectSuggestion.bind(this);
    this._getWeightedSuggestion = this._getWeightedSuggestion.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    const {time} = this.state;
    if (!time && nextState.time) {
      this.setState({rejected: {}}); // reset rejected tasks to none
    }
  }

  render() {
    const {activities, acceptSuggestion} = this.props;
    const idealTimes = activitiesToIdealTimes(activities);
    const {rejected, time} = this.state;
    const times = idealTimesToTimes(idealTimes);

    let suggestion;
    if (time) {
      suggestion = this._getWeightedSuggestion(time, idealTimes);
    }

    return (
      <div>
        {_getHeader(times, time, suggestion, rejected)}
        {suggestion ?
          <div className='container'>
            <h1>{suggestion}</h1>
            <p className='container'>
              {activities[suggestion].idealTime === time || time === -1 ? // -1 is plenty of time case
                <span>
                  it's good to do this for {minutesToHumanString(activities[suggestion].idealTime)} or so
                </span>
              :
                <span>
                  might be good to do this for {minutesToHumanString(time) + ' '}
                  (it's set to {minutesToHumanString(activities[suggestion].idealTime)})
                </span>
              }
            </p>
            <div className='choices'>
              <button className='choice' onClick={() =>
                  this._rejectSuggestion(suggestion)
              }>
                not now
                {/* naw */}
              </button>
              {/*
              <CantButton
                activityName={suggestion}
                activity={activities[suggestion]}
                rejectSuggestion={this._rejectSuggestion}
              />
              */}
              <button
                className='choice primary'
                onClick={() => {
                  acceptSuggestion(suggestion);
                  this._resetSuggestion();
                }}
                // TODO improve so this logs adds some info to a log
                >
                okay
              </button>
            </div>
          </div>
        :
          <form>
            {!time ? // haven't chosen a task yet
              <div>
                {times.map(t =>
                  <label className='choice' key={t} onClick={() => this.setState({time: t})}>
                    {minutesToHumanString(t)}
                  </label>
                )}

                {times.length > 1 ?
                  <div>
                    <hr/>
                    <label className='choice primary' onClick={() => this.setState({time: -1})}>
                      plenty of time
                    </label>
                  </div>
                : null}
              </div>

            :
              <button className='choice' onClick={this._resetSuggestion}>
                try again
              </button>
            }
          </form>
        }
      </div>
    );
  }

  _resetSuggestion() {
    this.setState({rejected: {}, rejectedConstraints: {}, time: null});
  }

  _rejectSuggestion(suggestionName, constraint) {
    const {activities, addActivityConstraint} = this.props;
    let {rejected, rejectedConstraints} = this.state;
    rejected = Object.assign({}, rejected);
    rejected[suggestionName] = true;

    const update = {rejected};

    // if there was a constraint selected then add this to reasons to reject
    if (!constraint) {
      this.setState(update);
      return;
    }

    rejectedConstraints = Object.assign({}, rejectedConstraints);
    rejectedConstraints[constraint] = true;
    update.rejectedConstraints = rejectedConstraints;
    this.setState(update);

    const {constraints} = activities[suggestionName] || {};
    const activityDoesntHaveConstraint = !constraints || !constraints[constraint];
    if (activityDoesntHaveConstraint) {
      addActivityConstraint(suggestionName, constraint);
    }
  }

  _getWeightedSuggestion(time, idealTimes) {
    const {activities} = this.props;
    const {rejected, rejectedConstraints} = this.state;
    const sortedTimes = getSortedTimes(idealTimes);
    const timeIndex = sortedTimes.indexOf(time);
    let choices = [];
    let possibilities = [];

    if (timeIndex !== -1) { // normal flow selecting a time
      // for exact time matches we give a weight of 2, they're twice as likely to come up as others
      possibilities = getPossibilitiesAtWeight(time, 2);

      // add on activity names for other times at a lower weight
      [sortedTimes[timeIndex - 1], sortedTimes[timeIndex + 1]].forEach(addNearbyPossibilities);
    }
    else {
      // Plenty of time, select from all activities equally
      Object.keys(idealTimes).forEach(addNearbyPossibilities);
    }

    // create choices array where the weighting of the choice is the number of times it's in the array
    possibilities.forEach(addPossibilityToChoicesNTimes);

    return pickOneChoice(choices);

    function getSortedTimes(times) {
      return Object.keys(times)
        .map(n => parseInt(n, 10)) // object keys are strings, make 'em ints
        .sort((a, b) => a - b); // number sort them
    }

    function addNearbyPossibilities(nearbyTime) {
      if (!nearbyTime) return;
      possibilities = possibilities.concat(
        getPossibilitiesAtWeight(nearbyTime, 1)
      );
    }

    function addPossibilityToChoicesNTimes(possibility) {
      let n = possibility.weight;
      while (n > 0) {
        choices.push(possibility);
          n -= 1;
      }
    }

    function pickOneChoice(choices) {
      const choiceIndex = Math.floor(Math.random() * choices.length);
      const {name} = choices[choiceIndex] || {};
      return name;
    }

    function getPossibilitiesAtWeight(t, weight) {
      return Object.keys(idealTimes[t] || {})
        .filter(name => {
          if (name in rejected) { // remove any that have been directly rejected
            return false;
          }

          const {constraints} = activities[name];
          if (!constraints) {
            return true;
          }
          return !Object.keys(rejectedConstraints).some(c => c in constraints); // reject if it has a bad constraint
        })
        .map(name => ({name, weight}));
    }

    function getAllPossibilitiesEqually() {
      const possibilities = [];
    }
  }

}

function _getHeader(times, time, suggestion, rejected) {
  if (!times.length) {
    return <h2>
      Add some activities with the <strong>+</strong> button
    </h2>;
  }
  if (!time) {
    return <h1>How long do you have?</h1>;
  }
  if (!suggestion) {
    return <h1>I'm all out of options :(</h1>;
  }

  const numRejected = Object.keys(rejected).length;
  if (!numRejected) { // first suggestion
    return <h2>Maybe do this?</h2>;
  }
  if (numRejected === 1) { // second
    return <h2>okay, what about this?</h2>;
  }
  return <h2>hmm, maybe this?</h2>; // all others
}

function activitiesToIdealTimes(activities) {
  const idealTimes = {};
  Object.keys(activities).forEach(addActivityToIdealTimes);
  return idealTimes;

  function addActivityToIdealTimes(name) {
    const {idealTime} = activities[name];
    if (!idealTimes[idealTime]) {
      idealTimes[idealTime] = {};
    }
    idealTimes[idealTime][name] = true;
  }
}


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

  _check() {
    this.forceUpdate();
  }

  render() {
    const {activityName, activities, startTime} = this.props;
    const activity = activities[activityName];

    const minutesLeft = minutesLeftInActivity(activityName, activities, startTime)

    if (minutesLeft <= 0) {
      this._done();
      return null;
    }

    return (
      <div>
        <h1>{activityName}</h1>
        <p>{minutesToHumanString(minutesLeft)} left</p>
      </div>
    );
  }

  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _done() {
    this._clearTimer();
    const {reset} = this.props;
    reset && reset();
  }
}



function minutesLeftInActivity(activityName, activities, startTime) {
    const activity = activities && activities[activityName];
    const {idealTime: minutes} = activity || {};
    if (!activity || !startTime || !minutes) {
        return 0;
    }
    const now = new Date();
    startTime = typeof startTime === 'object' ? startTime : new Date(startTime); // FIXME should be a better way to tell if startTime is a date object or not
    const endTime = new Date(Number(startTime) + (minutes * MS_PER_MINUTE));
    return Math.ceil((endTime - now) / MS_PER_MINUTE);
}

function minutesToHumanString(minutes, shouldShorten) {
  if (!Number.isFinite(minutes)) {
    throw new Error('`minutes` should be a finite number. You gave: ' + minutes);
  }
  let hourText = shouldShorten ? 'h' : 'hour';
  let minuteText = shouldShorten ? 'm' : 'minute';
  if (minutes < 60) {
    return timeString(minuteText, minutes);
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!remainingMinutes) {
    return timeString(hourText, hours);
  }

  return timeString(hourText, hours) + ' ' + timeString(minuteText, remainingMinutes);

  function timeString(word, num) {
    if (shouldShorten) {
      return num + word;
    }
    return num + ' ' + pluralize(word, num);
  }
}

function pluralize(word, num) {
  if (num === 1) {
    return word;
  }
  return word + 's';
}
// @import url('https://cdn.jsdelivr.net/semantic-ui/2.2.4/semantic.min.css');


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
