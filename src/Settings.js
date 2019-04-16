import React from 'react';

class Settings extends React.Component {
  constructor() {
    super();
    this.state = {
      importValidationError: null,
    };
    this._importData = this._importData.bind(this);
    this._validateAndGetNewData = this._validateAndGetNewData.bind(this);
    this._onToggleMixUpwards = this._onToggleMixUpwards.bind(this);
  }

  render() {
    const {settings, exportableData} = this.props;
    const {importValidationError} = this.state;
    const {mixUpwards} = settings;

    return (

      <div className='settings'>
        <h1>Settings</h1>
        <h3>Mixing</h3>
        <p>
          Mixing allows activities to mix upwards into other time slots at a lower probability. (e.g. if "mix upwards" is set, a 5 minute activity may show up when you select 15 minutes or when you select 30 minutes)
          <label>
            <input type='checkbox' checked={mixUpwards} readOnly onChange={this._onToggleMixUpwards} />
            mix upwards
          </label>
        </p>
        <hr/>
        <h3>Import/Export</h3>
        <p>
        To export data, copy paste everything in the text box below into the same textbox in another instance of the application and hit the "Import" button there.
        </p>
        <textarea
          ref='dataToImport'
          style={{width: '100%'}}
          defaultValue={JSON.stringify(exportableData)}
        />
        <button onClick={this._importData}>
          Import
        </button>
        {importValidationError ?
          <div className='error'>{importValidationError}</div>
        : null}
      </div>
    );
  }

  _onToggleMixUpwards(e) {
    this.props.updateSettings({mixUpwards: Boolean(e.target.checked)});
  }

  _importData() {
    const newData = this._validateAndGetNewData();
    if (!newData) return;

    const yesDoIt = confirm('Importing data will overwrite any existing activities or archived activities. Are you sure you want to import?');
    if (yesDoIt) {
      this.props.importData(newData);
    }
  }

  _validateAndGetNewData() {
    const newDataString = this.refs.dataToImport.value;

    let newData;
    try {
      newData = JSON.parse(newDataString);
    } catch(e) {
      this.setState({
        importValidationError: `data doesn't appear to be JSON`
      });
      return;
    }

    if (!newData || typeof newData !== 'object') {
      this.setState({
        importValidationError: `data must be an object, {}`
      });
      return;
    }

    const {activities, archived} = newData;

    const neitherActivitiesNorArchivedGiven = (!activities && !archived) ||
      (typeof activities !== 'object' && typeof archived !== 'object');
    if (neitherActivitiesNorArchivedGiven ) {
      this.setState({
        importValidationError: `data isn't the right format. It must be have at least either activities or archived`
      });
      return;
    }

    // I could keep going with validation here, but that's no fun

    return newData;
  }
}

export default Settings;
