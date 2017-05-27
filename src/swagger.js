/**
 * Copyright (c) 2017 Callan Peter Milne
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
'use strict';

const SWAGGER_VERSION = '2.0';
const API_VERSION = '1.0.0';
const API_TITLE = 'DS Entity REST API';
const API_URL = 'DS Entity REST API';
const API_SCHEMES = ['http'];
const API_HOST = '192.168.220.31'
const API_CONSUMES = ['application/json'];
const API_PRODUCES = ['application/json'];
const API_DESCRIPTION =
  '[eviratec.com.au](https://www.eviratec.com.au)';

module.exports = function (thing) {

  let spec = newSwaggerSpec();

  defineRoutes(thing.routes, spec);
  defineTypes(thing.types, spec);

  return spec;

};

function defineTypes (types, spec) {
  Object.keys(types).forEach((typeName) => {
    let type = types[typeName];
    spec.definitions[typeName] = type;
  });
}

function defineRoutes (routes, spec) {
  routes.forEach((route) => {

    let method = route.method.toLowerCase();
    let uri = route.uri;

    let e;

    initUri(uri, spec);

    e = spec.paths[uri][method] = {
      operationId: route.operationId,
      summary: '',
      description: '',
      tags: [route.modelType],
      parameters: [],
      produces: ['application/json'],
      responses: {
        500: {
          description: 'Internal Server Error',
        },
      },
    };

    if ('get' === method) {

      let isListRoute;

      e.responses['200'] = {
        description: 'Success',
        schema: {
          $ref: `#/definitions/${route.modelType}`,
        },
      };

      e.responses['404'] = {
        description: 'Not Found',
      };

      isListRoute = route.uri.match(/List$/);

      if (isListRoute) {
        e.summary = `Retrieves a list of ${route.pluralUriName}`;
        e.responses['200'].schema = {
          type: 'array',
          items: {
            $ref: `#/definitions/${route.modelType}`,
          },
        };
      };

      if (!isListRoute) {
        e.summary = `Retrieves an existing ${route.modelType}`;
      }

    }

    if ('delete' === method) {

      e.summary = `Deletes an existing ${route.modelType}`;

    }

    if ('post' === method) {

      e.summary = `Creates a new ${route.modelType}`;

      e.parameters.push({
        name: 'model',
        in: 'body',
        description: `The new **${route.modelType}** to add`,
        required: true,
        schema: {
          $ref: `#/definitions/New${route.modelType}`,
        },
      });

      e.responses['302'] = {
        description: 'Success',
      };

      e.responses['400'] = {
        description: 'Bad Request',
      };

    }

  });
}

function initUri (uri, spec) {

  if (uriInitialised(uri, spec)) {
    return;
  }

  let pathParams;

  pathParams = [{
    name: 'UserID',
    in: 'path',
    type: 'number',
    required: true,
    description: 'The ID of the user who owns the resource',
  }];

  if (/\/T\/\{ClassName\}/.test(uri)) {
    pathParams.push({
      name: 'ClassName',
      in: 'path',
      type: 'string',
      required: true,
      description: 'The EntityType\'s ClassName',
    });
  }

  if (/\/E\/\{EntityID\}/.test(uri)) {
    pathParams.push({
      name: 'EntityID',
      in: 'path',
      type: 'number',
      required: true,
      description: 'The Entity\'s ID',
    });
  }

  if (/\/A\/\{AttributeKey\}/.test(uri)) {
    pathParams.push({
      name: 'AttributeKey',
      in: 'path',
      type: 'string',
      required: true,
      description: 'The Attribute\'s AttributeKey',
    });
  }

  spec.paths[uri] = {
    parameters: pathParams,
  };

}

function newSwaggerSpec () {
  return {
    swagger: SWAGGER_VERSION,
    info: {
      version: API_VERSION,
      title: API_TITLE,
      description: API_DESCRIPTION,
    },
    host: API_HOST,
    schemes: API_SCHEMES,
    consumes: API_CONSUMES,
    produces: API_PRODUCES,
    paths: {},
    definitions: {},
  };
}

function uriInitialised (uri, spec) {
  return uri in spec.paths;
}
