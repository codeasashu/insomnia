// @flow
import * as React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import { AUTOBIND_CFG } from '../../../common/constants';
import YAML from 'yaml';
import YAMLSourceMap from 'yaml-source-map';
import { Sidebar } from 'insomnia-components';
import type { ApiSpec } from '../../../models/api-spec';
import { trackEvent } from '../../../common/analytics';
import { showModal } from '../modals';
import SchemaDesignerModal from '../schema-designer/modals/schema-designer-modal';

type Props = {|
  apiSpec: ApiSpec,
  handleSetSelection: (chStart: number, chEnd: number, lineStart: number, lineEnd: number) => void,
|};

type State = {|
  error: string,
|};

const StyledSpecEditorSidebar: React.ComponentType<{}> = styled.div`
  overflow: hidden;
  overflow-y: auto;
`;

@autoBindMethodsForReact(AUTOBIND_CFG)
class SpecEditorSidebar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: '',
      specContentJSON: false,
    };
  }

  _handleScrollEditor(pos: {
    start: { line: number, col: number },
    end: { line: number, col: number },
  }) {
    trackEvent('Spec Sidebar', 'Navigate');
    const { handleSetSelection } = this.props;

    // NOTE: We're subtracting 1 from everything because YAML CST uses
    //   1-based indexing and we use 0-based.
    handleSetSelection(pos.start.col - 1, pos.end.col - 1, pos.start.line - 1, pos.end.line - 1);
  }

  _mapPosition(itemPath: Array<any>) {
    const sourceMap = new YAMLSourceMap();
    const { contents } = this.props.apiSpec;
    const scrollPosition = {
      start: {
        line: 0,
        col: 0,
      },
      end: {
        line: 0,
        col: 200,
      },
    };
    // Account for JSON (as string) line number shift
    if (this.state.specContentJSON) {
      scrollPosition.start.line = 1;
    }
    const specMap = sourceMap.index(YAML.parseDocument(contents, { keepCstNodes: true }));
    const itemMappedPosition = sourceMap.lookup(itemPath, specMap);
    const isServersSection = itemPath[0] === 'servers';
    scrollPosition.start.line += itemMappedPosition.start.line;
    if (!isServersSection) {
      scrollPosition.start.line -= 1;
    }
    scrollPosition.end.line = scrollPosition.start.line;

    this._handleScrollEditor(scrollPosition);
  }

  _handleItemClick = (...itemPath): void => {
    this._mapPosition(itemPath);
  };

  _handleAddItem = (...itemPath): void => {
    console.log('not implemented');
  };

  _handleEditItem = (...itemPath): void => {
    const { handleSpecUpdate } = this.props;
    const schema = this._getSchema(itemPath);
    showModal(SchemaDesignerModal, {
      schema,
      handleOnUpdate: updatedSchema => {
        const spec = this.getSpec();
        const uspec = _.set(spec, itemPath, updatedSchema);
        const updatedYamlSpec = YAML.stringify(uspec);
        handleSpecUpdate(updatedYamlSpec);
        this._mapPosition(itemPath);
      },
    });
  };

  _updateSpec = (itemPath: Array, schema: Object): Object => {
    let spec = this.getSpec();
    let clonedSpec = Object.assign({}, spec);
    itemPath.forEach(path => {
      spec = spec && spec[path];
    });
    spec = schema;
    clonedSpec = spec;
    return clonedSpec;
  };

  _getSchema = (itemPath: Array): Object => {
    let spec = this.getSpec();
    itemPath.forEach(path => {
      spec = spec && spec[path];
    });
    return spec;
  };

  componentDidMount() {
    const { contents } = this.props.apiSpec;
    try {
      JSON.parse(contents);
    } catch (e) {
      this.setState({ specContentJSON: false });
      return;
    }
    this.setState({ specContentJSON: true });
  }

  getSpec(): Object {
    const { apiSpec } = this.props;
    return YAML.parse(apiSpec.contents);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return <p className="notice error margin-sm">{error}</p>;
    }

    const specJSON = this.getSpec();

    return (
      <StyledSpecEditorSidebar>
        <Sidebar
          jsonData={specJSON}
          onClick={this._handleItemClick}
          onAdd={this._handleAddItem}
          onEdit={this._handleEditItem}
        />
      </StyledSpecEditorSidebar>
    );
  }
}

export default SpecEditorSidebar;
