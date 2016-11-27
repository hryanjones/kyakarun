import CantButton from './CantButton';
import minutesToHumanString from './minutesToHumanString';
import idealTimesToTimes from './idealTimesToTimes';
import React, {Component} from 'react';

class What extends Component {
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
        <h1>{_getHeader(times, time, suggestion, rejected)}</h1>
        {suggestion ?
          <div className='container'>
            <h2>{suggestion}</h2>
            <p className='container'>
              {activities[suggestion].idealTime === time ?
                <span>
                  it's good to do this for {minutesToHumanString(time)} or so
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
                  naw
              </button>
              <CantButton
                activityName={suggestion}
                activity={activities[suggestion]}
                rejectSuggestion={this._rejectSuggestion}
              />
              <button
                className='choice'
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
              times.map(t =>
                <label className='choice' key={t} onClick={() => this.setState({time: t})}>
                  <input type='radio'/> {minutesToHumanString(t)}
                </label>
              )
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
    validateTimeIndex(timeIndex);

    // for exact time matches we give a weight of 2, they're twice as likely to come up as others
    let possibilities = getPossibilitiesAtWeight(time, 2);

    // add on activity names for other times at a lower weight
    [sortedTimes[timeIndex - 1], sortedTimes[timeIndex + 1]].forEach(addNearbyPossibilities);

    const choices = [];

    // create choice array where the weighting of the choice is the number of times it's in the array
    possibilities.forEach(addPossibilityToChoicesNTimes);

    return pickOneChoice(choices);

    function getSortedTimes(times) {
      return Object.keys(times)
        .map(n => parseInt(n, 10)) // object keys are strings, make 'em ints
        .sort((a, b) => a - b); // number sort them
    }

    function validateTimeIndex(index) {
      if (index === -1) {
        throw new Error(`Couldn't find time (${time}) in sortedTimes (${sortedTimes}.`);
      }
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
  }
}

function _getHeader(times, time, suggestion, rejected) {
  if (!times.length) {
    return 'No things to do, create one';
  }
  if (!time) {
    return 'How long do you have?';
  }
  if (!suggestion) {
    return 'I\'m all out of options :(';
  }

  const numRejected = Object.keys(rejected).length;
  if (!numRejected) { // first suggestion
    return 'Maybe do this?';
  }
  if (numRejected === 1) { // second
    return 'okay, what about this?';
  }
  return 'hmm, maybe this?'; // all others
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

export default What;
