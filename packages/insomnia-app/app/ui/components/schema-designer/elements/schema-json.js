import React, { Component, PureComponent } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  SvgIcon,
  Dropdown,
  DropdownItem,
  Tooltip,
  ToggleSwitch,
  ListGroup,
  ListGroupItem,
} from 'insomnia-components';
import Input from '../../base/debounced-input';
import FieldInput from './field-input';
import { Row, Col } from './design';

import * as schemaDesignerActions from '../../../redux/modules/schema-designer';

import './schemaJson.css';
import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE } from '../utils';
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
  handleChangeType = e => {
    const prefix = this.getPrefix();
    const keys = [].concat(prefix, 'type');
    this.props.changeType({ keys, value: e.target.value });
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

  _noop = e => {
    console.log('clicked');
  };

  // 增加子节点
  handleAddChildField = () => {
    const prefix = this.getPrefix();
    const keyArr = [].concat(prefix, 'properties');
    this.props.addChildField({ key: keyArr });
    this.props.setOpenValue({ key: keyArr, value: true });
  };

  handleClickIcon = () => {
    const prefix = this.getPrefix();
    // 数据存储在 properties.name.properties下
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

    const prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    const showIcon = this.getOpenValue([prefixArrayStr]);
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
                    <span className="down-style" onClick={this.handleClickIcon}>
                      {showIcon ? (
                        <SvgIcon icon="chevron-down" />
                      ) : (
                        <SvgIcon icon="chevron-right" />
                      )}
                    </span>
                  ) : null}
                </Col>
                <Col span={22}>
                  <Input disabled value="Items" onChange={this._noop} />
                  <ToggleSwitch disabled />
                </Col>
              </Row>
            </Col>
            <Col span={3} className="col-item col-item-type">
              <select
                name="itemtype"
                className="type-select-style"
                onChange={this.handleChangeType}
                value={items.type}>
                {SCHEMA_TYPE.map((item, index) => {
                  return (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  );
                })}
              </select>
            </Col>
            <Col span={5} className="col-item col-item-mock">
              <Input
                placeholder={LocaleProvider('title')}
                value={items.title}
                onChange={this.handleChangeTitle}
              />
            </Col>
            <Col span={5} className="col-item col-item-desc">
              <Input
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
      paddingLeft: `${20 * (length + 1)}px`,
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
  handleChangeType = e => {
    const prefix = this.getPrefix();
    const keys = [].concat(prefix, 'type');
    this.props.changeType({ keys, value: e.target.value });
  };

  handleDeleteItem = () => {
    const { prefix, name } = this.props;
    const nameArray = this.getPrefix();
    this.props.deleteItem({ keys: nameArray });
    this.props.enableRequire({ keys: prefix, name, required: false });
  };

  /*
  展示备注编辑弹窗
  editorName: 弹窗名称 ['description', 'mock']
  type: 如果当前字段是object || array showEdit 不可用
  */
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
    const { prefix, name } = this.props;
    this.props.enableRequire({ keys: prefix, name, required });
  };

  render() {
    const { name, data, prefix, open, showEdit, showAdv } = this.props;
    const value = Object.assign({}, data.properties[name], { title: null, description: null });
    const prefixArray = [].concat(prefix, name);
    console.log('show', open, prefix, name);
    const show = _.get(open, prefix);
    const showIcon = _.get(open, [].concat(prefix, name, 'properties'));

    // let show = true;
    // let showIcon = true;
    return show ? (
      <ListGroupItem>
        <Row type="flex" justify="space-around" align="middle">
          <Col
            span={8}
            className="col-item name-item col-item-name"
            style={this.__tagPaddingLeftStyle}>
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2} className="down-style-col">
                {value.type === 'object' ? (
                  <span className="down-style" onClick={this.handleClickIcon}>
                    {showIcon ? <SvgIcon icon="chevron-down" /> : <SvgIcon icon="chevron-up" />}
                  </span>
                ) : null}
              </Col>
              <Col span={22}>
                <FieldInput onChange={this.handleChangeName} value={name} />
                <Tooltip placement="top" title={LocaleProvider('required')}>
                  <ToggleSwitch
                    checked={
                      _.isUndefined(data.required) ? false : data.required.indexOf(name) !== -1
                    }
                    onChange={this.handleEnableRequire}
                  />
                </Tooltip>
              </Col>
            </Row>
          </Col>
          <Col span={3} className="col-item col-item-type">
            <select
              className="type-select-style"
              onChange={this.handleChangeType}
              value={value.type}>
              {SCHEMA_TYPE.map((item, index) => {
                return (
                  <option value={item} key={index}>
                    {item}
                  </option>
                );
              })}
            </select>
          </Col>

          <Col span={5} className="col-item col-item-mock">
            <Input
              placeholder={LocaleProvider('title')}
              value={value.title}
              onChange={this.handleChangeTitle}
            />
          </Col>

          <Col span={5} className="col-item col-item-desc">
            <Input
              placeholder={LocaleProvider('description')}
              value={value.description}
              onChange={this.handleChangeDesc}
            />
          </Col>

          <Col span={3} className="col-item col-item-setting">
            <span className="adv-set" onClick={this.handleShowAdv}>
              <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
                <SvgIcon icon="gear" />
              </Tooltip>
            </span>
            <span className="delete-item" onClick={this.handleDeleteItem}>
              <SvgIcon icon="trashcan" />
            </span>
            {value.type === 'object' ? (
              <DropPlus prefix={prefix} name={name} />
            ) : (
              <span onClick={this.handleAddField}>
                <Tooltip placement="top" title={LocaleProvider('add_sibling_node')}>
                  <SvgIcon icon="plus" />
                </Tooltip>
              </span>
            )}
          </Col>
        </Row>
        <div className="option-formStyle">{mapping(prefixArray, value, showEdit, showAdv)}</div>
      </ListGroupItem>
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
    console.log('got into obj', data, prefix);
    return (
      <ListGroup className="object-style">
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
      </ListGroup>
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
    <Dropdown renderButton={() => <SvgIcon icon="plus" />}>
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
    <Tooltip placement="top" title={LocaleProvider('add_node')}>
      {menu}
    </Tooltip>
  );
};

const DropPlus = connect(null, mapDispatchToProps)(DropPlusComponent);

const SchemaJsonComponent = ({ schema, showEdit, showAdv }) => {
  console.log('incomp', schema);
  const item = mapping([], schema, showEdit, showAdv);
  return <ListGroupItem className="schema-content">{item}</ListGroupItem>;
};

const SchemaJson = connect(({ schemaDesigner }) => {
  const { schema, open } = schemaDesigner;
  return { schema, open };
})(SchemaJsonComponent);

export default SchemaJson;
