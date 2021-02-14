import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SchemaSelectors from './elements/schema-selectors';
import * as schemaDesignerActions from '../../redux/modules/schema-designer';

import { Button, SvgIcon } from 'insomnia-components';

import './schema-designer.css';
import SchemaJson from './elements/schema-json.js';
import LocaleProvider from './locale';
import * as ui from './ui';

class SchemaDesigner extends React.Component {
  constructor(props) {
    super(props);
    this.alterMsg = this.alterMsg.bind(this);
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

  getChildContext() {
    return {
      getOpenValue: keys => {
        return _.get(this.props.open, keys);
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
    this.props.changeType({ keys: [key], value });
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

  _handleItemClick(type) {
    console.log('clicked type', type);
  }

  render() {
    const { schema } = this.props;
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

        <ui.FlexRow>
          <ui.FlexItem>
            {schema.type === 'object' && (
              <ui.StyledActions onClick={() => this.addChildField('properties')}>
                <SvgIcon icon="plus" />
              </ui.StyledActions>
            )}
            <ui.FlexItem>
              {schema.type === 'object' && (
                <ui.StyledNavigate show={this.state.show} onClick={this.clickIcon}>
                  <SvgIcon icon="chevron-down" />
                </ui.StyledNavigate>
              )}
              <ui.StyledTooltip
                message={
                  <SchemaSelectors
                    selectedItem={schema.type || 'object'}
                    handleItemClick={e => this.changeType(`type`, e)}
                  />
                }
                position="top">
                <Button size="small" variant="text">
                  {schema.type}
                </Button>
              </ui.StyledTooltip>

              <ui.FieldInput
                disabled
                placeholder={'Title'}
                value={this.props.schema.title}
                onChange={e => this.changeValue(['title'], e.target.value)}
              />

              <ui.FieldInput
                disabled
                placeholder={'description'}
                value={schema.description}
                onChange={e => this.changeValue(['description'], e.target.value)}
              />
            </ui.FlexItem>
            <ui.StyledActions font={1} onClick={() => this.showAdv([], this.props.schema)}>
              <ui.StyledTooltip placement="top" message={LocaleProvider('adv_setting')}>
                <SvgIcon icon="gear" />
              </ui.StyledTooltip>
            </ui.StyledActions>
          </ui.FlexItem>
        </ui.FlexRow>
        {this.state.show && <SchemaJson showEdit={this.showEdit} showAdv={this.showAdv} />}
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
  data: PropTypes.object,
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
