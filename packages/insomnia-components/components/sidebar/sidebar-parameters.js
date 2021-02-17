// @flow
import * as React from 'react';
import Tooltip from '../tooltip';
import SidebarItem from './sidebar-item';
import SvgIcon, { IconEnum } from '../svg-icon';
import SidebarSection from './sidebar-section';
import SidebarActions from './sidebar-actions';
import StyledInvalidSection from './sidebar-invalid-section';

type Props = {
  parameters: Object,
  onClick: (section: string, ...args: any) => void,
  onAdd: (section: string, ...args: any) => void,
  onEdit: (section: string, ...args: any) => void,
  onDelete: (section: string, ...args: any) => void,
};

// Implemented as a class component because of a caveat with render props
// https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent
export default class SidebarParameters extends React.Component<Props> {
  renderBody = (filter: string): null | React.Node => {
    const { parameters, onClick, onEdit, onDelete } = this.props;

    if (Object.prototype.toString.call(parameters) !== '[object Object]') {
      return <StyledInvalidSection name={'parameter'} />;
    }

    const filteredValues = Object.keys(parameters).filter(parameter =>
      parameter.toLowerCase().includes(filter.toLocaleLowerCase()),
    );

    if (Object.keys(parameters).length && !filteredValues.length) {
      return null;
    }

    return (
      <div>
        {filteredValues.map(parameter => (
          <React.Fragment key={parameter}>
            <SidebarItem onClick={() => onClick('components', 'parameters', parameter)}>
              <div>
                <SvgIcon icon={IconEnum.indentation} />
              </div>
              <span>
                <Tooltip message={parameters[parameter].description} position="right">
                  {parameter}
                </Tooltip>
              </span>
              <SidebarActions
                onEdit={() => onEdit('components', 'parameters', parameter)}
                onDelete={() => onDelete('components', 'parameters', parameter)}
              />
            </SidebarItem>
          </React.Fragment>
        ))}
      </div>
    );
  };

  render() {
    const { onAdd } = this.props;
    return (
      <SidebarSection
        title="PARAMETERS"
        renderBody={this.renderBody}
        handleAddItemClick={val => onAdd('components', 'parameters', val)}
      />
    );
  }
}
