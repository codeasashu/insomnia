// @flow
import * as React from 'react';
import styled from 'styled-components';
import SidebarItem from './sidebar-item';
import SvgIcon, { IconEnum } from '../svg-icon';
import SidebarSection from './sidebar-section';
import StyledInvalidSection from './sidebar-invalid-section';
import Dropdown from '../dropdown/dropdown';
import DropdownItem from '../dropdown/dropdown-item';

const StyledDropdown: React.ComponentType<{}> = styled.div`
  width: 100%;
  div:first-child {
    float: right;
    clear: both;
  }
`;

type Props = {
  schemas: Object,
  onClick: (section: string, ...args: any) => void,
  onEdit: (section: string, ...args: any) => void,
};

const DropdownEllipsis = () => <SvgIcon icon={IconEnum.ellipsesCircle} />;

// Implemented as a class component because of a caveat with render props
// https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent
export default class SidebarSchemas extends React.Component<Props> {
  renderBody = (filter: string): null | React.Node => {
    const { schemas, onClick, onEdit } = this.props;

    if (Object.prototype.toString.call(schemas) !== '[object Object]') {
      return <StyledInvalidSection name={'schema'} />;
    }

    const filteredValues = Object.keys(schemas).filter(schema =>
      schema.toLowerCase().includes(filter.toLocaleLowerCase()),
    );

    if (!filteredValues.length) {
      return null;
    }

    return (
      <div>
        {filteredValues.map(schema => (
          <SidebarItem key={schema} onClick={() => onClick('components', 'schemas', schema)}>
            <div>
              <SvgIcon icon={IconEnum.brackets} />
            </div>
            <span>{schema}</span>
            <StyledDropdown>
              <Dropdown renderButton={DropdownEllipsis}>
                <DropdownItem
                  stayOpenAfterClick
                  onClick={() => onEdit('components', 'schemas', schema)}>
                  <label htmlFor="edit">Edit</label>
                </DropdownItem>
              </Dropdown>
            </StyledDropdown>
          </SidebarItem>
        ))}
      </div>
    );
  };

  render() {
    return <SidebarSection title="SCHEMAS" renderBody={this.renderBody} />;
  }
}
