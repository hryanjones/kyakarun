import React from 'react';

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

export default CantButton;
