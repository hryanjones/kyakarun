import minutesToHumanString from './minutesToHumanString';
import React, {Component} from 'react';

// constraint suggestions
// "a quiet place"
// "to be at home"
// "an internet connection"
// "a real computer"

class CantButton extends Component {
  constructor() {
    super();
    this.state = {
      cant: false, // whether or not to show constraints as sub-options to pick
    };
  }
  render() {
    const {activityName, activity, rejectSuggestion} = this.props;

    // FIXME there's an update and validate function in EditActivity that needs to be moved to the top level for adding a new constraint
    return (
      <div>
          <button className='choice' onClick={() => this.setState({cant: true})}>
            can't {cant ? ' because I need ...' : ''}
          </button>
          {cant ? activity.constraints.map(constraint =>
            <button className='choice constraint' onClick={() => rejectSuggestion(activityName, constraint)}>
              ...{constraint}
            </button>
          ) : null}
          {cant ?
            <label class='constraint'>
              ...<input ref='newConstraint' type='text' placeholder="shortly describe what's missing"/>
              <button onClick={() => rejectSuggestion(activityName, this.refs.newConstraint.value)}>
                add constraint
              </button>
            </label>
          }
      </div>
    );
  }
}

export default CantButton;
