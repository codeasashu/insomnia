import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as schemaDesignerActions from '../../redux/modules/schema-designer';

import { SvgIcon, Tooltip, ToggleSwitch, ListGroup, ListGroupItem } from 'insomnia-components';
import Input from '../base/debounced-input';

import './schema-designer.css';
import SchemaJson from './elements/schema-json.js';
import { SCHEMA_TYPE, debounce, JSONPATH_JOIN_CHAR } from './utils.js';
import LocaleProvider from './locale';
import { Row, Col } from './elements/design';

class SchemaDesigner extends React.Component {
  constructor(props) {
    super(props);
    this.alterMsg = debounce(this.alterMsg, 2000);
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

  componentWillReceiveProps(nextProps) {
    if (typeof this.props.onChange === 'function' && this.props.schema !== nextProps.schema) {
      const oldData = JSON.stringify(this.props.schema || '');
      const newData = JSON.stringify(nextProps.schema || '');
      if (oldData !== newData) return this.props.onChange(newData);
    }
    if (this.props.data && this.props.data !== nextProps.data) {
      this.props.changeEditorSchema({ value: JSON.parse(nextProps.data) });
    }
  }

  componentWillMount() {
    let data = this.props.data;
    if (!data) {
      data = `{
        "type": "object",
        "title": "title",
        "properties":{}
      }`;
    }
    this.props.changeEditorSchema({ value: JSON.parse(data) });
  }

  getChildContext() {
    return {
      getOpenValue: keys => {
        return _.get(this.props.open, keys.join(JSONPATH_JOIN_CHAR));
      },
      changeCustomValue: this.changeCustomValue,
      Model: this.props.Model,
      isMock: this.props.isMock,
    };
  }

  alterMsg = () => {
    // return message.error(LocaleProvider('valid_json'));
  };

  changeType = (key, value) => {
    this.props.changeType({ key: [key], value });
  };

  addChildField = key => {
    this.props.addChildField({ key: [key] });
    this.setState({ show: true });
  };

  clickIcon = () => {
    this.setState({ show: !this.state.show });
  };

  // 修改备注信息
  changeValue = (key, value) => {
    if (key[0] === 'mock') {
      value = value ? { mock: value } : '';
    }
    this.props.changeValue({ key, value });
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

  // 修改备注/mock参数信息
  changeDesc = (e, name) => {
    this.setState({
      [name]: e,
    });
  };

  // 高级设置
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

  handleAdvCancel = () => {
    this.setState({
      advVisible: false,
    });
  };

  showAdv = (key, value) => {
    this.setState({
      advVisible: true,
      itemKey: key,
      curItemCustomValue: value, // 当前节点的数据信息
    });
  };

  //  修改弹窗中的json-schema 值
  changeCustomValue = newValue => {
    this.setState({
      curItemCustomValue: newValue,
    });
  };

  changeCheckBox = e => {
    this.setState({ checked: e });
    this.props.requireAll({ required: e, value: this.props.schema });
  };

  render() {
    const { checked } = this.state;
    const { schema } = this.props;

    const disabled = schema.type !== 'object' && schema.type !== 'array';

    return (
      <div className="json-schema-react-editor">
        {/* {advVisible && (
          <Modal
            title={LocaleProvider('adv_setting')}
            maskClosable={false}
            visible={advVisible}
            onOk={this.handleAdvOk}
            onCancel={this.handleAdvCancel}
            okText={LocaleProvider('ok')}
            width={780}
            cancelText={LocaleProvider('cancel')}
            className="json-schema-react-editor-adv-modal"
          >
            <CustomItem data={JSON.stringify(this.state.curItemCustomValue, null, 2)} />
          </Modal>
        )} */}

        <ListGroup>
          <ListGroupItem indentLevel={0}>
            <Col span={8} className="col-item name-item col-item-name">
              <Row type="flex" justify="space-around" align="middle">
                <Col span={2} className="down-style-col">
                  {schema.type === 'object' ? (
                    <span className="down-style" onClick={this.clickIcon}>
                      {this.state.show ? (
                        <SvgIcon icon="chevron-down" />
                      ) : (
                        <SvgIcon icon="chevron-up" />
                      )}
                    </span>
                  ) : null}
                </Col>
                <Col span={22}>
                  <Input disabled value="root" />
                  <Tooltip placement="top" title={'checked_all'}>
                    <ToggleSwitch
                      checked={checked}
                      disabled={disabled}
                      onChange={this.changeCheckBox}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
            <Col span={3} className="col-item col-item-type">
              <select
                className="type-select-style"
                onChange={e => this.changeType(`type`, e)}
                value={schema.type || 'object'}>
                {SCHEMA_TYPE.map((item, index) => {
                  return (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  );
                })}
              </select>
            </Col>
            <Col span={this.props.isMock ? 4 : 5} className="col-item col-item-mock">
              <Input
                disabled
                placeholder={'Title'}
                value={this.props.schema.title}
                onChange={e => this.changeValue(['title'], e.target.value)}
              />
              {/* <SvgIcon
                    icon="brackets"
                    onClick={() => this.showEdit([], 'title', this.props.schema.title)
                    } /> */}
            </Col>
            <Col span={this.props.isMock ? 4 : 5} className="col-item col-item-desc">
              <Input
                disabled
                placeholder={'description'}
                value={schema.description}
                onChange={e => this.changeValue(['description'], e.target.value)}
              />
              {/* <SvgIcon 
                    icon="brackets"
                    onClick={() =>
                        this.showEdit([], 'description', this.props.schema.description)
                    } /> */}
            </Col>
            <Col span={2} className="col-item col-item-setting">
              <span className="adv-set" onClick={() => this.showAdv([], this.props.schema)}>
                <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
                  <SvgIcon icon="gear" />
                </Tooltip>
              </span>
              {schema.type === 'object' ? (
                <span onClick={() => this.addChildField('properties')}>
                  <Tooltip placement="top" title={LocaleProvider('add_child_node')}>
                    <SvgIcon icon="plus" />
                  </Tooltip>
                </span>
              ) : null}
            </Col>
          </ListGroupItem>
          <SchemaJson showEdit={this.showEdit} showAdv={this.showAdv} />
        </ListGroup>
      </div>
    );
  }
}

SchemaDesigner.childContextTypes = {
  getOpenValue: PropTypes.func,
  changeCustomValue: PropTypes.func,
  Model: PropTypes.object,
  isMock: PropTypes.bool,
};

SchemaDesigner.propTypes = {
  data: PropTypes.string,
  onChange: PropTypes.func,
  showEditor: PropTypes.bool,
  isMock: PropTypes.bool,
};

const mapStateToProps = ({ schemaDesigner }) => {
  const { schema, open } = schemaDesigner;
  return { schema, open };
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

export default connect(mapStateToProps, mapDispatchToProps)(SchemaDesigner);
