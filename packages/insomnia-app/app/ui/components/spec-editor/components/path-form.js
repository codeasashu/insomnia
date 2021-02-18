import React from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import { convert } from 'insomnia-importers';
import { getContentTypeHeader } from '../../../../common/misc';
import * as RequestModel from '../../../../models/request';
import ErrorBoundary from '../../error-boundary';
import RequestPane from '../request-pane';

@autoBindMethodsForReact()
class PathForm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      forceRefreshKey: 0,
      activeRequest: null,
    };
  }

  async componentDidMount() {
    let requests;
    try {
      requests = await this.convertToInsoRequests(this.props.spec);
    } catch (errors) {
      console.error('[Pathform Designer]', errors);
    }
    console.log('allRequest', requests);

    const activeRequest = this.pickActiveRequest(requests);
    console.log('pickedRequest', activeRequest);
    this.setState({
      forceRefreshKey: Date.now(),
      activeRequest,
    });
  }

  pickActiveRequest(requests) {
    let currentMethod = this.props.method;
    if (!currentMethod) {
      const availableMethods = requests.map(r => r.method);
      currentMethod = availableMethods.length ? availableMethods[0] : undefined;
    }

    if (!currentMethod) {
      return null;
    }

    const doesMethodMatch = r => r.method.toLowerCase() === currentMethod.toLowerCase();

    const activeRequests = requests.filter(doesMethodMatch);
    return activeRequests.length ? activeRequests[0] : null;
  }

  async convertToInsoRequests(spec) {
    const convertedSchema = await convert(JSON.stringify(spec));
    if (!convertedSchema.data) {
      throw Error('Invalid schema! Incompatible with insomnia converter');
    }
    return convertedSchema.data.resources.filter(r => r._type === 'request');
  }

  async componentDidUpdate(prevProps) {
    if (this.props.method !== prevProps.method) {
      let requests;
      try {
        requests = await this.convertToInsoRequests(this.props.spec);
      } catch (errors) {
        console.error('[Pathform Designer]', errors);
      }

      const activeRequest = this.pickActiveRequest(requests);
      this.setState({
        forceRefreshKey: Date.now(),
        activeRequest,
      });
    }
  }

  handleImport() {
    console.log('handleImport');
  }

  handleUpdateRequestMethod(request, method) {
    this.setState({ activeRequest: { ...request, method } });
  }

  handleUpdateSettingsUseBulkParametersEditor(val) {
    console.log('bulk param changed', val);
  }

  handleUpdateSettingsUseBulkHeaderEditor(val) {
    console.log('bulk header changed', val);
  }

  handleUpdateSettingsShowPasswords(val) {
    console.log('update show password', val);
  }

  handleUpdateRequestUrl(request, url) {
    console.log('update request url', url);
    this.setState({ activeRequest: { ...request, url } });
  }

  handleUpdateRequestParameters(request, params) {
    console.log('update request params', params);
    const parameters = params.filter(p => p.name !== '' && p.hasOwnProperty('schema'));
    this.setState({ activeRequest: { ...request, parameters } });
  }

  handleUpdateRequestHeaders(request, headers) {
    console.log('update request headers', request, headers);
    this.setState({ activeRequest: { ...request, headers } });
  }

  handleUpdateRequestBody(request, body) {
    console.log('update request body', body);
    this.setState({ activeRequest: { ...request, body } });
  }

  handleUpdateRequestAuthentication(val) {}

  handleSendRequestWithActiveEnvironment(val) {}

  handleForceUpdateRequestHeaders(val) {}

  handleForceUpdateRequest(val) {}

  handleUpdateRequestMimeType(mime) {
    const request = this.state.activeRequest;
    const headers = request.headers ? [...request.headers] : [];
    const contentTypeHeader = getContentTypeHeader(headers);

    const pairId = `pair_${Date.now()}`;

    if (contentTypeHeader) {
      console.log('here1');
      contentTypeHeader.value = mime;
    } else {
      console.log('here2');
      headers.push({
        id: pairId,
        name: 'Content-Type',
        value: mime,
        schema: { type: 'string' },
      });
    }

    const body = RequestModel.newBodyRaw(request.body.text || '', mime);
    this.setState({ activeRequest: { ...request, headers, body } });
  }

  handleGenerateCodeForActiveRequest(val) {}

  handleRender(val) {
    console.log('handler render', val);
  }

  _renderRequestPane() {
    const {
      activeEnvironment,
      handleRender,
      settings,
      handleGetRenderContext,
    } = this.props.wrapperProps;

    const { forceRefreshKey, activeRequest } = this.state;

    return (
      <ErrorBoundary showAlert>
        <RequestPane
          request={activeRequest}
          handleRender={handleRender}
          handleGetRenderContext={handleGetRenderContext}
          environmentId={activeEnvironment ? activeEnvironment._id : ''}
          forceRefreshCounter={forceRefreshKey}
          forceUpdateRequest={this.handleForceUpdateRequest}
          forceUpdateRequestHeaders={this.handleForceUpdateRequestHeaders}
          handleGenerateCode={this.handleGenerateCodeForActiveRequest}
          handleImport={this.handleImport}
          handleSend={this.handleSendRequestWithActiveEnvironment}
          headerEditorKey={1}
          isVariableUncovered={true}
          nunjucksPowerUserMode={settings.nunjucksPowerUserMode}
          settings={settings}
          oAuth2Token={null}
          updateRequestAuthentication={this.handleUpdateRequestAuthentication}
          updateRequestBody={this.handleUpdateRequestBody}
          updateRequestHeaders={this.handleUpdateRequestHeaders}
          updateRequestMimeType={this.handleUpdateRequestMimeType}
          updateRequestParameters={this.handleUpdateRequestParameters}
          updateRequestUrl={this.handleUpdateRequestUrl}
          updateSettingsShowPasswords={this.handleUpdateSettingsShowPasswords}
          updateSettingsUseBulkHeaderEditor={this.handleUpdateSettingsUseBulkHeaderEditor}
          updateSettingsUseBulkParametersEditor={this.handleUpdateSettingsUseBulkParametersEditor}
          updateRequestMethod={this.handleUpdateRequestMethod}
        />
      </ErrorBoundary>
    );
  }

  render() {
    return <div className="tall">{this._renderRequestPane()}</div>;
  }
}

export default PathForm;
