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
const { toggleStrictMode, applyNodeProps } = require('./makeUpdates');
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
function render(element, container, props, prevProps, callback) {
  invariant(
    isValidKonvaContainer(container),
    'Target container is not a Konva container.',
  );
  if (!container[REACT_KONVA_CONTAINER_KEY]) {
    container[REACT_KONVA_CONTAINER_KEY] = KonvaRenderer.createContainer(container, false, false);
  }
  const result = KonvaRenderer.updateContainer(element, container[REACT_KONVA_CONTAINER_KEY], null, callback);
  applyNodeProps(container, props, prevProps);
  return;
}

function unmountComponent(container) {
  if (!container[REACT_KONVA_CONTAINER_KEY]) return false;
  KonvaRenderer.unbatchedUpdates(() => {
    KonvaRenderer.updateContainer(null, container[REACT_KONVA_CONTAINER_KEY], null, );
  });
  return true;
}

function NodeView({ node, children, ...props }) {
  const prevProps = React.useRef();
  React.useLayoutEffect(() => {
    if (!node) return;
    return () => unmountComponent(node);
  }, [ node ]);
  if (node) {
    render(children, node, props, prevProps.current);
    prevProps.current = props;
  }
  return null;
}

const StageView = React.forwardRef(function StageView(props, ref) {
  const container = React.useRef(null);
  const [ stage, setStage ] = React.useState();

  React.useImperativeHandle(ref, () => stage, [ stage ]);

  const prevProps = React.useRef();
  React.useLayoutEffect(() => {
    if (!Konva.isBrowser || !container.current) return;
    const stage = new Konva.Stage({
      width: props.width,
      height: props.height,
      container: container.current,
    });
    render(props.children, stage, props, prevProps.current);
    prevProps.current = props;
    setStage(stage);
    return () => {
      unmountComponent(stage);
      stage.destroy();
    };
  }, [ ]);
  if (stage) {
    render(props.children, stage, props, prevProps.current);
    prevProps.current = props;
  }

  return (
    <div
      ref={container}
      accessKey={props.accessKey}
      className={props.className}
      role={props.role}
      style={props.style}
      tabIndex={props.tabIndex}
      title={props.title}
    />
  );
});

module.exports = {
  ...TYPES,
  __matchRectVersion,
  useStrictMode: toggleStrictMode,
  render,
  unmountComponent,
  NodeView,
  StageView, Stage: StageView,
};
