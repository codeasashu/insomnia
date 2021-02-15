// @flow
import * as React from 'react';
import styled from 'styled-components';
import SvgIcon, { IconEnum } from '../svg-icon';
import Dropdown from '../dropdown/dropdown';
import DropdownItem from '../dropdown/dropdown-item';

type ActionProps = {
  onEdit: () => void,
  onDelete: () => void,
};

const StyledDropdown: React.ComponentType<{}> = styled.div`
  width: 100%;
  div:first-child {
    float: right;
    clear: both;
  }
`;

const SidebarActions = ({ onEdit, onDelete }: ActionProps) => {
  return (
    <StyledDropdown>
      <Dropdown renderButton={<SvgIcon icon={IconEnum.ellipsesCircle} />}>
        <DropdownItem stayOpenAfterClick={false} onClick={onEdit}>
          <label htmlFor="edit">Edit</label>
        </DropdownItem>
        <DropdownItem stayOpenAfterClick={false} onClick={onDelete}>
          <label htmlFor="delete">Delete</label>
        </DropdownItem>
      </Dropdown>
    </StyledDropdown>
  );
};

export default SidebarActions;
