import React from 'react';
import Activity from './Activity';

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


export default Activities;
