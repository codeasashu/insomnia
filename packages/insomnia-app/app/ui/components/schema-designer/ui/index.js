import styled from 'styled-components';
import { Tooltip } from 'insomnia-components';
import Input from '../../base/debounced-input';

export const StyledActions = styled.span`
    display: inline-flex;
    justify-content: center;

    &:hover {
        background-color: rgba(0,0,0,0.1);
    }

    ${({ width = 20 }) => `width: ${width}px;`}
    ${({ font = 0.8 }) => `font-size: ${font}rem;`}
    ${({ height }) => height && `height: ${height};`}
`;

// export const InlineActions = styled.span`
//     display: inline-grid;
//     height: 100%;
//     vertical-align: middle;
//     margin: 0 auto;
//     width: 20px;
// `;

export const StyledAction = styled.span`
  display: inline-block;
`;

export const StyledNavigate = styled(StyledActions)`
  ${({ show }) => !show && `transform: rotate(-90deg);`}
`;

export const FlexRow = styled.div`
  width: 100%;
  display: flex;

  input {
    padding: 1px 13px;
  }
`;

export const FlexItem = styled.div`
  display: flex;
  flex: 1 1 0%;

  ${({ center }) => center && `align-items: center;`}
`;

export const FieldInput = styled(Input)`
  background-color: rgba(0, 0, 0, 0);
  &:focus {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

export const StyledTooltip = styled(Tooltip)`
  display: inline-flex !important;
`;
