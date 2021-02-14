import React, { Component, PureComponent } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SvgIcon, Dropdown, DropdownItem, Tooltip, Button } from 'insomnia-components';
import Input from '../../base/debounced-input';
import SchemaSelectors from './schema-selectors';
import FieldInput from './field-input';
import { Row, Col } from './design';
import * as ui from '../ui';

import * as schemaDesignerActions from '../../../redux/modules/schema-designer';

import './schemaJson.css';
import LocaleProvider from '../locale';

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
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
  }

  componentWillMount() {
    const { prefix } = this.props;
    const length = prefix.filter(name => name !== 'properties').length;
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`,
    };
  }

  getPrefix() {
    return [].concat(this.props.prefix, 'items');
  }

  // 修改数据类型
  handleChangeType = type => {
    const prefix = this.getPrefix();
    const keys = [].concat(prefix, 'type');
    this.props.changeType({ keys, value: type });
  };

  // 修改备注信息
  handleChangeDesc = value => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, `description`);
    this.props.changeValue({ key, value });
  };

  // 修改mock信息
  handleChangeMock = e => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, `mock`);
    const value = e ? { mock: e } : '';
    this.props.changeValue({ key, value });
  };

  handleChangeTitle = value => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, `title`);
    this.props.changeValue({ key, value });
  };

  _noop = e => {};

  // 增加子节点
  handleAddChildField = () => {
    const prefix = this.getPrefix();
    const keyArr = [].concat(prefix, 'properties');
    this.props.addChildField({ key: keyArr });
    this.props.setOpenValue({ key: keyArr, value: true });
  };

  handleClickIcon = () => {
    const prefix = this.getPrefix();
    const keyArr = [].concat(prefix, 'properties');
    this.props.setOpenValue({ key: keyArr });
  };

  handleShowEdit = (name, type) => {
    const prefix = this.getPrefix();
    this.props.showEdit(prefix, name, this.props.data.items[name], type);
  };

  handleShowAdv = () => {
    this.props.showAdv(this.getPrefix(), this.props.data.items);
  };

  getOpenValue = jsonPath => {
    return _.get(this.props.open, jsonPath);
  };

  render() {
    const { data, prefix, showEdit, showAdv } = this.props;
    const items = data.items;
    const prefixArray = [].concat(prefix, 'items');
    const showIcon = this.getOpenValue([].concat(prefixArray, 'properties'));
    return (
      !_.isUndefined(data.items) && (
        <div className="array-type">
          <Row className="array-item-type" type="flex" justify="space-around" align="middle">
            <Col
              span={8}
              className="col-item name-item col-item-name"
              style={this.__tagPaddingLeftStyle}>
              <Row type="flex" justify="space-around" align="middle">
                <Col span={2} className="down-style-col">
                  {items.type === 'object' ? (
                    <ui.StyledNavigate show={showIcon} onClick={this.handleClickIcon}>
                      <SvgIcon icon="chevron-down" />
                    </ui.StyledNavigate>
                  ) : null}
                </Col>
                <Col span={22}>
                  <Input className="form-control" disabled value="Items" onChange={this._noop} />
                </Col>
              </Row>
            </Col>
            <Col span={3} className="col-item col-item-type">
              <Tooltip
                message={
                  <SchemaSelectors
                    selectedItem={items.type}
                    handleItemClick={e => this.handleChangeType(e)}
                  />
                }
                position="top">
                <Button size="small" variant="text">
                  {items.type}
                </Button>
              </Tooltip>
            </Col>
            <Col span={5} className="col-item col-item-mock">
              <Input
                className="form-control"
                placeholder={LocaleProvider('title')}
                value={items.title}
                onChange={this.handleChangeTitle}
              />
            </Col>
            <Col span={5} className="col-item col-item-desc">
              <Input
                className="form-control"
                placeholder={LocaleProvider('description')}
                value={items.description}
                onChange={this.handleChangeDesc}
              />
            </Col>
            <Col span={3} className="col-item col-item-setting">
              <span className="adv-set" onClick={this.handleShowAdv}>
                <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
                  <SvgIcon icon="gear" />
                </Tooltip>
              </span>

              {items.type === 'object' ? (
                <span onClick={this.handleAddChildField}>
                  <Tooltip placement="top" title={LocaleProvider('add_child_node')}>
                    <SvgIcon icon="plus" />
                  </Tooltip>
                </span>
              ) : null}
            </Col>
          </Row>
          <div className="option-formStyle">{mapping(prefixArray, items, showEdit, showAdv)}</div>
        </div>
      )
    );
  }
}

const SchemaArray = connect(({ schemaDesigner }) => {
  const { open } = schemaDesigner;
  return { open };
}, mapDispatchToProps)(SchemaArrayComponent);

class SchemaItemComponent extends PureComponent {
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
    // this.num = 0
  }

  componentWillMount() {
    const { prefix } = this.props;
    const length = prefix.filter(name => name !== 'properties').length;
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${30 * (length + 1)}px`,
    };
  }

  getPrefix() {
    return [].concat(this.props.prefix, this.props.name);
  }

  // 修改节点字段名
  handleChangeName = value => {
    const { data, prefix, name } = this.props;

    if (data.properties[value] && typeof data.properties[value] === 'object') {
      return console.error(`The field "${value}" already exists.`);
    }

    this.props.changeName({ keys: prefix, name, value });
  };

  // 修改备注信息
  handleChangeDesc = value => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, 'description');
    this.props.changeValue({ key, value });
  };

  // 修改mock 信息
  handleChangeMock = e => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, `mock`);
    const value = e ? { mock: e } : '';
    this.props.changeValue({ key, value });
  };

  handleChangeTitle = value => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, `title`);
    this.props.changeValue({ key, value });
  };

  // 修改数据类型
  handleChangeType = type => {
    const prefix = this.getPrefix();
    const keys = [].concat(prefix, 'type');
    this.props.changeType({ keys, value: type });
  };

  handleDeleteItem = () => {
    const { prefix, name } = this.props;
    const nameArray = this.getPrefix();
    this.props.deleteItem({ keys: nameArray });
    this.props.enableRequire({ keys: prefix, name, required: false });
  };

  handleShowEdit = (editorName, type) => {
    const { data, name, showEdit } = this.props;

    showEdit(this.getPrefix(), editorName, data.properties[name][editorName], type);
  };

  handleShowAdv = () => {
    const { data, name, showAdv } = this.props;
    showAdv(this.getPrefix(), data.properties[name]);
  };

  //  增加子节点
  handleAddField = () => {
    const { prefix, name } = this.props;
    this.props.addField({ keys: prefix, name });
  };

  // 控制三角形按钮
  handleClickIcon = () => {
    const prefix = this.getPrefix();
    // 数据存储在 properties.xxx.properties 下
    const keyArr = [].concat(prefix, 'properties');
    this.props.setOpenValue({ key: keyArr });
  };

  // 修改是否必须
  handleEnableRequire = required => {
    console.log('required', required);
    const { prefix, name } = this.props;
    this.props.enableRequire({ keys: prefix, name, required });
  };

  render() {
    const { name, data, prefix, open, showEdit, showAdv } = this.props;
    const value = Object.assign({}, { title: '', description: '' }, data.properties[name]);
    const prefixArray = [].concat(prefix, name);
    const show = _.get(open, prefix);
    const showIcon = _.get(open, [].concat(prefix, name, 'properties'));
    const isRequired = _.isUndefined(data.required) ? false : data.required.indexOf(name) !== -1;
    // const indentLength = prefix.filter(name => name !== 'properties').length;
    return show ? (
      <>
        <ui.FlexRow>
          <ui.FlexItem>
            {value.type === 'object' ? (
              <DropPlus prefix={prefix} name={name} />
            ) : (
              <ui.StyledActions onClick={this.handleAddField}>
                <SvgIcon icon="plus" />
              </ui.StyledActions>
            )}
            <ui.FlexItem style={this.__tagPaddingLeftStyle}>
              {value.type === 'object' && (
                <ui.StyledNavigate show={showIcon} onClick={this.handleClickIcon}>
                  <SvgIcon icon="chevron-down" />
                </ui.StyledNavigate>
              )}
              <FieldInput onChange={this.handleChangeName} value={name} />

              <ui.StyledTooltip
                message={
                  <SchemaSelectors
                    selectedItem={value.type}
                    handleItemClick={e => this.handleChangeType(e)}
                  />
                }
                position="top">
                <Button size="small" variant="text">
                  {value.type}
                </Button>
              </ui.StyledTooltip>

              <ui.FieldInput
                placeholder={LocaleProvider('title')}
                value={value.title}
                onChange={this.handleChangeTitle}
              />

              <ui.FieldInput
                placeholder={LocaleProvider('description')}
                value={value.description}
                onChange={this.handleChangeDesc}
              />
            </ui.FlexItem>
            <ui.StyledActions font={1} onClick={this.handleShowAdv}>
              <ui.StyledTooltip placement="top" message={LocaleProvider('adv_setting')}>
                <SvgIcon icon="gear" />
              </ui.StyledTooltip>
            </ui.StyledActions>
            <ui.StyledActions font={1} onClick={this.handleDeleteItem}>
              <ui.StyledTooltip placement="top" message={LocaleProvider('adv_setting')}>
                <SvgIcon icon="trashcan" />
              </ui.StyledTooltip>
            </ui.StyledActions>
            <ui.StyledActions font={1} onClick={() => this.handleEnableRequire(!isRequired)}>
              <ui.StyledTooltip placement="top" message={LocaleProvider('adv_setting')}>
                <SvgIcon theme={isRequired ? 'danger' : 'default'} icon="warning-circle" />
              </ui.StyledTooltip>
            </ui.StyledActions>
          </ui.FlexItem>
        </ui.FlexRow>
        {mapping(prefixArray, value, showEdit, showAdv)}
      </>
    ) : null;
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

const DropPlusComponent = (props, context) => {
  const { prefix, name, addField, setOpenValue, addChildField } = props;
  const menu = (
    <Dropdown
      renderButton={() => (
        <ui.StyledActions height="100%">
          <SvgIcon icon="plus" />
        </ui.StyledActions>
      )}>
      <DropdownItem>
        <span onClick={() => addField({ keys: prefix, name })}>
          {LocaleProvider('sibling_node')}
        </span>
      </DropdownItem>
      <DropdownItem>
        <span
          onClick={() => {
            setOpenValue({ key: [].concat(prefix, name, 'properties'), value: true });
            addChildField({ key: [].concat(prefix, name, 'properties') });
          }}>
          {LocaleProvider('child_node')}
        </span>
      </DropdownItem>
    </Dropdown>
  );

  return (
    <ui.StyledTooltip placement="top" message={LocaleProvider('add_node')}>
      {menu}
    </ui.StyledTooltip>
  );
};

const DropPlus = connect(null, mapDispatchToProps)(DropPlusComponent);

const SchemaJsonComponent = ({ schema, showEdit, showAdv }) => {
  const item = mapping([], schema, showEdit, showAdv);
  return <React.Fragment>{item}</React.Fragment>;
};

const SchemaJson = connect(({ schemaDesigner }) => {
  const { schema, open } = schemaDesigner;
  return { schema, open };
})(SchemaJsonComponent);

export default SchemaJson;
