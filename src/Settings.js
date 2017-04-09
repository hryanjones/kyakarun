import React from 'react';

class Settings extends React.Component {
  constructor() {
    super();
    this.state = null; // no state in this component, right?
  }

  render() {
    const {settings, updateSettings} = this.props;
    const {mixUpwards} = settings;

    return (

      <div className='settings'>
        <h1>Settings</h1>
        <h3>Mixing</h3>
        <p>
          Mixing allows activities to mix upwards into other time slots at a lower probability. (e.g. if "mix upwards" is set, a 5 minute activity may show up when you select 15 minutes or when you select 30 minutes)
          <label onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              updateSettings({mixUpwards: !mixUpwards})
            }}>
            <input type='checkbox' checked={mixUpwards} readOnly />
            mix upwards
          </label>
        </p>
      </div>
    );
  }
}

export default Settings;
