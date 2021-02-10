// @flow

import React, { PureComponent } from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import { AUTOBIND_CFG } from '../../../../common/constants';

import Modal from '../../base/modal';
import ModalBody from '../../base/modal-body';
import ModalHeader from '../../base/modal-header';
import ModalFooter from '../../base/modal-footer';

import SchemaDesignerApp from '../schema-designer';

@autoBindMethodsForReact(AUTOBIND_CFG)
class SchemaDesignerModal extends PureComponent {
  state = {
    schema: {},
  };

  _setModalRef(m) {
    this.modal = m;
  }

  _handleOk() {
    console.log('handledOk', this.state.schema);
  }

  hide() {
    console.log('handleCancel', this.state.schema);
    this.modal.hide();
  }

  show({ schema }: Object) {
    // this.setState({ ... });
    console.log('[SchemaDesignerModal]', schema);
    this.setState({ schema });
    this.modal && this.modal.show();
  }

  handleChange(schema) {
    console.log('spec changed', schema);
    this.setState({ schema });
  }

  render() {
    return (
      <Modal ref={this._setModalRef}>
        <ModalHeader>Schema Designer</ModalHeader>
        <ModalBody className="wide pad">
          <SchemaDesignerApp data={this.state.schema} onChange={this.handleChange} />
        </ModalBody>
        <ModalFooter>
          <div>
            <button className="btn" onClick={this.hide}>
              Cancel
            </button>
            <button className="btn" onClick={this._handleOk}>
              Ok
            </button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }
}

export default SchemaDesignerModal;
