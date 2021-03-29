import * as React from 'react';
import { cold } from 'react-hot-loader';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
// import SchemaDesignerApp from '../../schema-designer';
import ReactOpenapiDesigner from 'react-openapi-designer';

@autoBindMethodsForReact()
class SchemaForm extends React.PureComponent {
  render() {
    const { schema, handleChange } = this.props;
    return (
      <div>
        <ReactOpenapiDesigner.Schema dark schema={schema} onChange={handleChange} />
      </div>
    );
  }
}

export default cold(SchemaForm);
