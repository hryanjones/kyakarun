import React from 'react';
import Activity from './Activity';

class Activities extends React.PureComponent {
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
        {getActivityNamesSortedByIdealTime(activities).map(name => 
          <Activity
            {...activityProps}
            data={activities[name]}
            name={name}
            toggle={toggle}
            edit={edit}
            key={name}
          />
        )}
      </ul>
    );
  }
}

function getActivityNamesSortedByIdealTime(activities) {
  const names = Object.keys(activities);
  return names.sort((name1, name2) => {
    const idealTime1 = activities[name1].idealTime;
    const idealTime2 = activities[name2].idealTime;
    if (idealTime1 < idealTime2) {
      return -1;
    }
    return idealTime1 > idealTime2;
  })
}

Activities.defaultProps = {
  activities: {},
  archived: {},
};


export default Activities;
