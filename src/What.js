import minutesToHumanString from './minutesToHumanString';
import idealTimesToTimes from './idealTimesToTimes';
import React, {Component} from 'react';

class What extends Component {
  constructor() {
    super();
    this.state = {
      rejected: {}, // used to remove choices that have been rejected
      time: null, // selected idealTime
    };
    this._resetSuggestion = this._resetSuggestion.bind(this);
    this._rejectSuggestion = this._rejectSuggestion.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    const {time} = this.state;
    if (!time && nextState.time) {
      this.setState({rejected: {}}); // reset rejected tasks to none
    }
  }

  render() {
    const {activities} = this.props;
    const idealTimes = activitiesToIdealTimes(activities);
    const {rejected, time} = this.state;
    const times = idealTimesToTimes(idealTimes);

    let suggestion;
    if (time) {
      suggestion = _getWeightedSuggestion(time, idealTimes, activities, rejected);
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
              {/* TODO
              <button className='choice'>naw</button>
              <button className='choice'>can't</button>
              */}
              <button className='choice' onClick={() =>
                  this._rejectSuggestion(suggestion)
                }>
                not now
              </button>
              <button
                className='choice'
                onClick={this._resetSuggestion}
                // TODO improve so this logs a time on the activity
                // also want it to go to a screen where there's a timer to the end of the activity
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
    this.setState({rejected: {}, time: null});
  }

  _rejectSuggestion(suggestionName) {
    const {rejected} = this.state;
    rejected[suggestionName] = true; // mutating, but meh
    this.setState({rejected});
  }
}

function _getWeightedSuggestion(time, idealTimes, activities, rejected) {
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
    console.log('here')
    return Object.keys(idealTimes[t] || [])
      .filter(name => !(name in rejected))
      .map(name => ({name, weight}));
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
