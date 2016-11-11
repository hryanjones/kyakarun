import minutesToHumanString from './minutesToHumanString';
import React, {Component} from 'react';

class Activities extends Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }

  render() {
    const {activities} = this.props;

    return (
      <div>
        <h1>Activities</h1>
        {Object.keys(activities).map(activityName =>
          <div className='activity'>
            <div className='activity-data' style={{width: "80%"}}>
              <div>{activityName}</div>
              <div>({minutesToHumanString(activities[activityName].idealTime)})</div>
            </div>
          </div>
        )}
      </div>
    )
  }

}

export default Activities;
