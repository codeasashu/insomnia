// @flow

import React, { PureComponent } from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import { AUTOBIND_CFG } from '../../../common/constants';

import Modal from '../base/modal';
import ModalBody from '../base/modal-body';
import ModalHeader from '../base/modal-header';
import ModalFooter from '../base/modal-footer';

@autoBindMethodsForReact(AUTOBIND_CFG)
class SchemaDesignerModal extends PureComponent {
  _setModalRef(m) {
    this.modal = m;
  }

  _handleOk() {
    console.log('handledOk');
  }

  hide() {
    this.modal.hide();
  }

  show({ schema }: Object) {
    // this.setState({ ... });
    console.log('[SchemaDesignerModal]', schema);
    this.modal && this.modal.show();
  }

  render() {
    return (
      <Modal ref={this._setModalRef}>
        <ModalHeader>Schema Designer</ModalHeader>
        <ModalBody className="wide pad">
          <p>This is schema designer</p>
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
