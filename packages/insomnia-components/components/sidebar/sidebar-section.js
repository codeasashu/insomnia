// @flow
import * as React from 'react';
import { useLayoutEffect } from 'react';
import SidebarHeader from './sidebar-header';
import SidebarPanel from './sidebar-panel';
import SidebarFilter from './sidebar-filter';
import SidebarItem from './sidebar-item';
import SvgIcon, { IconEnum } from '../svg-icon';
import { CircleButton } from '../button';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useToggle } from 'react-use';

type SectionProps = {
  title: string,
  handleAddItemClick: () => void,
  renderBody: (filterValue: string) => React.Node,
};

const StyledDropdown: React.ComponentType<{}> = styled.div`
  width: 100%;
  div:first-child {
    float: right;
    clear: both;
  }
`;

const StyledIcon: React.ComponentType<{}> = styled(SvgIcon)`
  padding-left: 0;
  display: inline-flex;
`;

const StyledSection: React.ComponentType<{}> = styled(motion.ul)`
  overflow: hidden;
  box-sizing: border-box;
  border-bottom: 1px solid var(--hl-md);
`;

const StyledNoResults: React.ComponentType<{}> = styled.div`
  padding: var(--padding-xs) var(--padding-xs) var(--padding-md) var(--padding-md);
  color: var(--color-warning);
`;

const SidebarSection = ({ title, renderBody, handleAddItemClick }: SectionProps) => {
  const [bodyVisible, toggleBodyVisible] = useToggle(false);
  const [filterVisible, toggleFilterVisible] = useToggle(false);
  const [filterValue, setFilterValue] = React.useState('');
  const [schemaName, setSchemaName] = React.useState('');
  const [addItemVisible, toggleAddItemVisible] = useToggle(false);

  const handleFilterChange = React.useCallback((e: SyntheticInputEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  }, []);

  useLayoutEffect(() => {
    toggleFilterVisible(false);
    setFilterValue('');
  }, [bodyVisible, toggleFilterVisible]);

  return (
    <StyledSection>
      <SidebarHeader
        headerTitle={title}
        sectionVisible={bodyVisible}
        toggleSection={toggleBodyVisible}
        toggleFilter={toggleFilterVisible}
        handleAddItem={toggleAddItemVisible}
      />
      <SidebarPanel childrenVisible={bodyVisible}>
        <SidebarFilter filter={filterVisible} onChange={handleFilterChange} />
        {addItemVisible && (
          <SidebarItem>
            <input value={schemaName} onChange={e => setSchemaName(e.target.value)} />
            <StyledDropdown>
              <CircleButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddItemClick(schemaName);
                  setSchemaName('');
                  toggleAddItemVisible();
                }}
                height="16px"
                width="16px">
                <StyledIcon icon={IconEnum.checkmark} />
              </CircleButton>
            </StyledDropdown>
          </SidebarItem>
        )}
        {renderBody(filterValue) || (
          <StyledNoResults>No results found for "{filterValue}"...</StyledNoResults>
        )}
      </SidebarPanel>
    </StyledSection>
  );
};

export default SidebarSection;
