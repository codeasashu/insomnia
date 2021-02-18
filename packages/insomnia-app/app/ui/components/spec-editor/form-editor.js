import * as React from 'react';
import _ from 'lodash';
import { APISpecBuilder, OAS_SECTIONS } from '../../../common/api-specs';
import PathForm from './components/path-form';
import SchemaForm from './components/schema-form';

const PickLeft = <p>Select a component from left</p>;

class FormEditor extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      component: null,
    };
  }

  getPathProps = itemPath => {
    const schema = this.builder.getPathItem(itemPath[1]);
    const method = itemPath.length === 3 ? itemPath[2] : null;
    return { name: itemPath[1], schema, method };
  };

  getSchemaProps = itemPath => {
    const schema = this.builder.getSchema(itemPath[2]);
    return { name: itemPath[2], schema };
  };

  updateComponent(component) {
    this.setState({ component });
    this.builder = APISpecBuilder.create(this.props.spec);
  }

  componentDidMount() {
    if (this.props.component) this.setState({ component: this.props.component });
    this.builder = APISpecBuilder.create(this.props.spec);
  }

  handleSpecChange(itemPath, value) {
    const spec = this.builder.getSpec();
    _.set(spec, itemPath, value);
    const yamlSpec = APISpecBuilder.create(spec).getSpecAsYaml();
    this.props.onChange(yamlSpec);
  }

  getRenderer(section, propsHandler, itemPath) {
    const itemProps = propsHandler(itemPath);
    const childProps = {
      ...this.props,
      ...itemProps,
      spec: this.builder.getSpec(),
      handleChange: val => this.handleSpecChange(itemPath, val),
    };
    switch (section) {
      case OAS_SECTIONS.PATH:
        return <PathForm {...childProps} />;
      case OAS_SECTIONS.SCHEMA:
        return <SchemaForm {...childProps} />;
      default:
        return <PickLeft />;
    }
  }

  getComponent(component) {
    if (!component || !component.length || component.length <= 1) {
      return PickLeft;
    }

    let args = { section: null, props: null };

    if (this.builder.isPath(component)) {
      args = { section: OAS_SECTIONS.PATH, props: this.getPathProps };
    }
    if (component.length > 2 && this.builder.isSchema(component)) {
      args = { section: OAS_SECTIONS.SCHEMA, props: this.getSchemaProps };
    }

    return this.getRenderer(args.section, args.props, component);
  }

  render() {
    const componentItem = this.getComponent(this.state.component);
    return componentItem;
  }
}

export default FormEditor;
