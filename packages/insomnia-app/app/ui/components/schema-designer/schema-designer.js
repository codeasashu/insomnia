import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import SchemaRow from './elements/schema-row';
import SchemaJson from './elements/schema-json';

class SchemaDesigner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      show: true,
      editVisible: false,
      description: '',
      descriptionKey: null,
      advVisible: false,
      itemKey: [],
      curItemCustomValue: null,
      checked: false,
      editorModalName: '',
      mock: '',
    };
    this.jsonSchemaData = null;
    this.jsonData = null;
  }

  componentDidUpdate(oldProps) {
    if (typeof this.props.onChange === 'function' && this.props.schema !== oldProps.schema) {
      const newData = this.props.schema || '';
      const oldData = oldProps.schema || '';
      console.log('updatedata', newData, oldData);
      if (!_.isEqual(oldData, newData)) return this.props.onChange(newData);
    }
    if (this.props.data && this.props.data !== oldProps.data) {
      this.props.changeEditorSchema({ value: this.props.data });
    }
  }

  componentDidMount() {
    let data = this.props.data;
    if (!data) {
      data = {
        type: 'object',
        title: 'title',
        properties: {},
      };
    }
    console.log('initdata', data);
    this.props.changeEditorSchema({ value: data });
  }

  addChildField = e => {
    this.props.addChildField({ key: ['properties'] });
    this.setState({ show: true });
  };

  showEdit = (prefix, name, value, type) => {
    if (type === 'object' || type === 'array') {
      return;
    }
    const descriptionKey = [].concat(prefix, name);

    value = name === 'mock' ? (value ? value.mock : '') : value;
    this.setState({
      editVisible: true,
      [name]: value,
      descriptionKey,
      editorModalName: name,
    });
  };

  handleAdvOk = () => {
    if (this.state.itemKey.length === 0) {
      this.props.changeEditorSchema({
        value: this.state.curItemCustomValue,
      });
    } else {
      this.props.changeValue({
        key: this.state.itemKey,
        value: this.state.curItemCustomValue,
      });
    }
    this.setState({
      advVisible: false,
    });
  };

  handleAdvCancel = () => this.setState({ advVisible: false });

  showAdv = (itemKey, curItemCustomValue) =>
    this.setState({
      advVisible: true,
      itemKey,
      curItemCustomValue,
    });

  render() {
    const { schema } = this.props;
    const { show } = this.state;
    return (
      <div className="json-schema-react-editor">
        <SchemaRow
          show={true}
          schema={schema}
          handleField={this.addChildField}
          handleSidebar={() => this.setState({ show: !show })}
          handleSchemaType={this.props.changeType}
          handleTitle={this.props.changeValue}
          handleDescription={this.props.changeValue}
          handleSettings={this.showAdv}
        />
        {this.state.show && (
          <SchemaJson
            wrapperProps={{
              ...this.props,
              ...{ showEdit: this.showEdit, showAdv: this.showAdv },
            }}
          />
        )}
      </div>
    );
  }
}

SchemaDesigner.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func,
  showEditor: PropTypes.bool,
  isMock: PropTypes.bool,
};

export default SchemaDesigner;
