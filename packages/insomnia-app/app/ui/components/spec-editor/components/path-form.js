import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

class PathForm extends React.PureComponent {
  render() {
    const { name, schema, method } = this.props;
    console.log('pathform', schema);
    return (
      <Tabs className="pane__body theme--pane__body react-tabs">
        <TabList>
          <Tab tabIndex="-1">
            <button>Path</button>
          </Tab>
          <Tab tabIndex="-1">
            <button>Parameters</button>
          </Tab>
          <Tab tabIndex="-1">
            <button>Schemas</button>
          </Tab>
        </TabList>
        <TabPanel className="react-tabs__tab-panel">
          <p>This this path page</p>
          <p>Selected method: {name}</p>
          <p>Selected method: {method}</p>
        </TabPanel>
        <TabPanel className="react-tabs__tab-panel">
          <p>This this parameters page</p>
        </TabPanel>
        <TabPanel className="react-tabs__tab-panel">
          <p>This this schema page</p>
        </TabPanel>
      </Tabs>
    );
  }
}

export default PathForm;
