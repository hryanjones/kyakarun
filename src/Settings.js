import minutesToHumanString from './minutesToHumanString';
import React from 'react';

class Settings extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }

  render() {
    const {settings, updateSettings} = this.props;
    const {mixUpwards, mixDownwards} = settings;

    return (

      <div className='settings'>
        <h1>Settings</h1>
        <h3>Mixing</h3>
        <p>
          Mixing allows activities to mix upwards or downwards into the next time slot at a lower probability. (e.g. if "mix upwards" is set, a 5 minute activity may show up when you select 15 minutes)
          <label onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              updateSettings({mixUpwards: !mixUpwards})
            }}>
            <input type='checkbox' checked={mixUpwards} readonly />
            mix upwards
          </label>
          <label onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              updateSettings({mixDownwards: !mixDownwards})
            }}>
            <input type='checkbox' checked={mixDownwards} readonly />
            mix downwards
          </label>
        </p>
      </div>
    );
  }
}

export default Settings;
