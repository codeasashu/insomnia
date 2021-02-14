import React, { Component, PureComponent } from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SchemaRow from './schema-row';
import * as schemaDesignerActions from '../../../redux/modules/schema-designer';

const mapping = (name, data, showEdit, showAdv) => {
  switch (data.type) {
    case 'array':
      return <SchemaArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} />;
    case 'object':
      const nameArray = [].concat(name, 'properties');
      return <SchemaObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} />;
    default:
      return null;
  }
};

const mapDispatchToProps = dispatch => {
  const schema = bindActionCreators(schemaDesignerActions, dispatch);
  return {
    changeEditorSchema: schema.changeEditorSchema,
    changeName: schema.changeName,
    changeValue: schema.changeValue,
    changeType: schema.changeType,
    enableRequire: schema.enableRequire,
    requireAll: schema.requireAll,
    deleteItem: schema.deleteItem,
    addField: schema.addField,
    addChildField: schema.addChildField,
    setOpenValue: schema.setOpenValue,
  };
};

class SchemaArrayComponent extends PureComponent {
  render() {
    const { data, prefix, showEdit, showAdv } = this.props;
    return (
      <SchemaRow
        show={!_.isUndefined(data.items)}
        schema={data.items}
        sidebar={this.props.open}
        fieldName={'items'}
        fieldPrefix={prefix}
        handleName={() => {}}
        handleChildField={({ key }) => {
          this.props.addChildField({ key });
          this.props.setOpenValue({ key, value: true });
        }}
        handleSidebar={this.props.setOpenValue}
        handleSchemaType={this.props.changeType}
        handleTitle={this.props.changeValue}
        handleDescription={this.props.changeValue}
        handleSettings={this.props.showAdv}>
        {mapping([].concat(prefix, 'items'), data.items, showEdit, showAdv)}
      </SchemaRow>
    );
  }
}

const SchemaArray = connect(({ schemaDesigner }) => {
  const { open } = schemaDesigner;
  return { open };
}, mapDispatchToProps)(SchemaArrayComponent);

const raiseError = ({ key, name, value }) => console.error(`The field "${value}" already exists.`);

const exists = (data, value) =>
  data.properties[value] && typeof data.properties[value] === 'object';

@autoBindMethodsForReact()
class SchemaItemComponent extends PureComponent {
  render() {
    const { name, data, prefix, open, showEdit, showAdv } = this.props;
    const schema = Object.assign({}, { title: '', description: '' }, data.properties[name]);
    const isRequired = _.isUndefined(data.required) ? false : data.required.indexOf(name) !== -1;

    return (
      <SchemaRow
        show={_.get(open, prefix)}
        schema={schema}
        sidebar={this.props.open}
        fieldName={name}
        fieldPrefix={prefix}
        required={isRequired}
        handleName={({ key, name, value }) => {
          if (exists(this.props.data, value)) return raiseError({ key, name, value });
          this.props.changeName({ key, name, value });
        }}
        handleField={this.props.addField}
        handleChildField={({ key }) => {
          this.props.addChildField({ key });
          this.props.setOpenValue({ key, value: true });
        }}
        handleSidebar={this.props.setOpenValue}
        handleSchemaType={this.props.changeType}
        handleTitle={this.props.changeValue}
        handleDescription={this.props.changeValue}
        handleSettings={this.props.showAdv}
        handleDelete={({ key }) => {
          this.props.deleteItem({ key });
          this.props.enableRequire({
            key: this.props.prefix,
            value: this.props.name,
            required: false,
          });
        }}
        handleRequire={this.props.enableRequire}>
        {mapping([].concat(prefix, name), schema, showEdit, showAdv)}
      </SchemaRow>
    );
  }
}

const SchemaItem = connect(({ schemaDesigner }) => {
  const { open } = schemaDesigner;
  return { open };
}, mapDispatchToProps)(SchemaItemComponent);

class SchemaObjectComponent extends Component {
  render() {
    const { data, prefix, showEdit, showAdv } = this.props;
    return (
      <>
        {Object.keys(data.properties).map((name, index) => {
          return (
            <SchemaItem
              key={index}
              data={data}
              name={name}
              prefix={prefix}
              showEdit={showEdit}
              showAdv={showAdv}
            />
          );
        })}
      </>
    );
  }
}

const SchemaObject = connect(({ schemaDesigner }) => {
  const { schema } = schemaDesigner;
  return { schema };
})(SchemaObjectComponent);

const SchemaJsonComponent = ({ schema, showEdit, showAdv }) => {
  const item = mapping([], schema, showEdit, showAdv);
  return <React.Fragment>{item}</React.Fragment>;
};

const SchemaJson = connect(({ schemaDesigner }) => {
  const { schema, open } = schemaDesigner;
  return { schema, open };
})(SchemaJsonComponent);

export default SchemaJson;
