// @flow

import YAML from 'yaml';
import _ from 'lodash';
import { OpenApiBuilder } from './openapi3';

export function parseApiSpec(
  rawDocument: string,
): {
  contents: Object | null,
  rawContents: string,
  format: 'openapi' | 'swagger' | null,
  formatVersion: string | null,
} {
  const result = {
    contents: null,
    rawContents: rawDocument,
    format: null,
    formatVersion: null,
  };

  // NOTE: JSON is valid YAML so we only need to parse YAML
  try {
    result.contents = YAML.parse(rawDocument);
  } catch (err) {
    throw new Error('Failed to parse API spec');
  }

  if (result.contents) {
    if (result.contents.openapi) {
      // Check if it's OpenAPI
      result.format = 'openapi';
      result.formatVersion = result.contents.openapi;
    } else if (result.contents.swagger) {
      // Check if it's Swagger
      result.format = 'swagger';
      result.formatVersion = result.contents.swagger;
    } else {
      // Not sure what format it is
    }
  }

  return result;
}

export const OAS_SECTIONS = {
  PATH: 'paths',
  SCHEMA: 'schemas',
  RESPONSE: 'responses',
  COMPONENT: 'components',
  PARAMETERS: 'parameters',
};
export class APISpecBuilder {
  constructor(spec) {
    this.builder = OpenApiBuilder.create(spec);
  }

  static create(spec) {
    if (_.isString(spec)) {
      try {
        spec = YAML.parse(spec);
      } catch (err) {
        throw new Error('Failed to parse API spec');
      }
    }
    return new APISpecBuilder(spec);
  }

  getSpec = () => this.builder.getSpec();

  getSpecAsYaml = () => this.builder.getSpecAsYaml();

  addPath = (path, pathItem) => {
    this.builder.addPath(path, pathItem);
    return this;
  };

  isPath = itemPath => itemPath[0] === OAS_SECTIONS.PATH;
  isSchema = itemPath =>
    itemPath[0] === OAS_SECTIONS.COMPONENT && itemPath[1] === OAS_SECTIONS.SCHEMA;

  isResponse = itemPath =>
    itemPath[0] === OAS_SECTIONS.COMPONENT && itemPath[1] === OAS_SECTIONS.RESPONSE;

  addComponent = (section, name, schema = null) => {
    console.log('addComponent', section, name, schema);
    if (section === OAS_SECTIONS.SCHEMA) this.builder.addSchema(name, schema);
    if (section === OAS_SECTIONS.PARAMETERS) this.builder.addParameter(name, schema);
    if (section === OAS_SECTIONS.RESPONSE) this.builder.addResponse(name, schema);
    return this;
  };

  _getValue = (haystack, needle, defaultValue = null) => _.get(haystack, needle, defaultValue);

  getOperation = (path, method) => {
    const pathItem = this.getPathItem(path);
    return this._getValue(pathItem, method, null);
  };

  getPathItem = path => {
    const spec = this.builder.getSpec();
    return this._getValue(spec, [OAS_SECTIONS.PATH, path], null);
  };

  getSchema = name => {
    const spec = this.builder.getSpec();
    return this._getValue(spec, [OAS_SECTIONS.COMPONENT, OAS_SECTIONS.SCHEMA, name], null);
  };

  getResponse = name => {
    const spec = this.builder.getSpec();
    return this._getValue(spec, [OAS_SECTIONS.COMPONENT, OAS_SECTIONS.RESPONSE, name], null);
  };
}
