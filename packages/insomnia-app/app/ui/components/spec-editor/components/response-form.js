import * as React from 'react';
import { autoBindMethodsForReact } from 'class-autobind-decorator';
import ReactOpenapiDesigner from 'react-openapi-designer';

@autoBindMethodsForReact()
class ResponseForm extends React.PureComponent {
  render() {
    const { schema, handleChange } = this.props;
    console.log('response schema', schema);
    return (
      <div>
        <ReactOpenapiDesigner.Response dark schema={schema} onChange={handleChange} />
      </div>
    );
  }
}

export default ResponseForm;
