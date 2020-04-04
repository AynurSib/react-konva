/**
 * Based on ReactArt.js
 * Copyright (c) 2017-present Lavrenov Anton.
 * All rights reserved.
 *
 * MIT
 */
'use strict';

const React = require('react');
const Konva = require('konva/lib/Core');
const ReactFiberReconciler = require('react-reconciler');
const ReactDOMComponentTree = require('./ReactDOMComponentTree');
const HostConfig = require('./ReactKonvaHostConfig');
const { toggleStrictMode } = require('./makeUpdates');
const invariant = require('./invariant');

// export for testing
// const REACT_VERSION = '16.8.3';
// const __matchRectVersion = React.version === REACT_VERSION;
// skip version testing for now
const __matchRectVersion = true;

// That warning is useful, but I am not sure we really need it
// if (!__matchRectVersion) {
//   console.warn(
//     `Version mismatch detected for react-konva and react. react-konva expects to have react version ${REACT_VERSION}, but it has version ${
//       React.version
//     }. Make sure versions are matched, otherwise, react-konva work is not guaranteed. For releases information take a look here: https://github.com/konvajs/react-konva/releases`
//   );
// }

const KONVA_NODES = [
  'Layer',
  'FastLayer',
  'Group',
  'Label',
  'Rect',
  'Circle',
  'Ellipse',
  'Wedge',
  'Line',
  'Sprite',
  'Image',
  'Text',
  'TextPath',
  'Star',
  'Ring',
  'Arc',
  'Tag',
  'Path',
  'RegularPolygon',
  'Arrow',
  'Shape',
  'Transformer'
];

const TYPES = {};

KONVA_NODES.forEach(function(nodeName) {
  TYPES[nodeName] = nodeName;
});

const KonvaRenderer = ReactFiberReconciler(HostConfig);

KonvaRenderer.injectIntoDevTools({
  findFiberByHostInstance: ReactDOMComponentTree.getClosestInstanceFromNode,
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: React.version,
  rendererPackageName: 'react-konva',
  getInspectorDataForViewTag: (...args) => {
    console.log(args);
  }
});

function isValidKonvaContainer(container) {
  return container instanceof Konva.Container;
}

const REACT_KONVA_CONTAINER_KEY = Symbol('REACT_KONVA_CONTAINER_KEY');
function render(element, container, callback) {
  invariant(
    isValidKonvaContainer(container),
    'Target container is not a Konva container.',
  );
  if (!container[REACT_KONVA_CONTAINER_KEY]) {
    container[REACT_KONVA_CONTAINER_KEY] = KonvaRenderer.createContainer(container, false, false);
  }
  return KonvaRenderer.updateContainer(element, container[REACT_KONVA_CONTAINER_KEY], null, callback);
}

function unmountComponent(container) {
  if (!container[REACT_KONVA_CONTAINER_KEY]) return false;
  KonvaRenderer.unbatchedUpdates(() => {
    KonvaRenderer.updateContainer(null, container[REACT_KONVA_CONTAINER_KEY], null, );
  });
  return true;
}

// TODO: https://github.com/react-spring/react-three-fiber/blob/8fa501a81bf59629283fbd09d872d805638fb52d/src/reconciler.tsx#L425
const hasSymbol = typeof Symbol === 'function' && Symbol.for
const REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca
function createPortal(children, containerInfo, implementation, key) {
  invariant(
    isValidKonvaContainer(containerInfo),
    'Target container is not a Konva container.',
  );
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo,
    implementation,
  };
}

module.exports = {
  ...TYPES,
  __matchRectVersion,
  useStrictMode: toggleStrictMode,
  render,
  unmountComponent,
  createPortal,
};
