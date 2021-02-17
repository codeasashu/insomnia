import * as React from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import SchemaDesignerApp from '../../schema-designer';

@autoBindMethodsForReact()
class SchemaForm extends React.PureComponent {
  render() {
    const { schema, handleChange } = this.props;
    return (
      <React.Fragment>
        <SchemaDesignerApp data={schema} onChange={handleChange} />
      </React.Fragment>
    );
  }
}

export default SchemaForm;
