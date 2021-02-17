// @flow

import React, { PureComponent } from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';

import Modal from '../base/modal';
import ModalBody from '../base/modal-body';
import ModalHeader from '../base/modal-header';
import ModalFooter from '../base/modal-footer';

import SchemaDesignerApp from '../schema-designer';

@autoBindMethodsForReact()
class SchemaDesignerModal extends PureComponent {
  state = {
    schema: {},
  };

  _setModalRef(m) {
    this.modal = m;
  }

  _handleOk() {
    this.modal.hide();
    if (typeof this._handleOnUpdate === 'function') {
      this._handleOnUpdate(this.state.schema);
    }
  }

  hide() {
    this.modal.hide();
  }

  show({ schema, handleOnUpdate }: Object) {
    console.log('[SchemaDesignerModal]', schema);
    this.setState({ schema });
    this.modal && this.modal.show();
    this._handleOnUpdate = handleOnUpdate;
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
