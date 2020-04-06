/**
 * Based on ReactArt.js
 * Copyright (c) 2017-present Lavrenov Anton.
 * All rights reserved.
 *
 * MIT
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var Konva = require('konva/lib/Core');
var ReactFiberReconciler = require('react-reconciler');
var ReactDOMComponentTree = require('./ReactDOMComponentTree');
var HostConfig = require('./ReactKonvaHostConfig');

var _require = require('./makeUpdates'),
    toggleStrictMode = _require.toggleStrictMode,
    applyNodeProps = _require.applyNodeProps;

var invariant = require('./invariant');

// export for testing
// const REACT_VERSION = '16.8.3';
// const __matchRectVersion = React.version === REACT_VERSION;
// skip version testing for now
var __matchRectVersion = true;

// That warning is useful, but I am not sure we really need it
// if (!__matchRectVersion) {
//   console.warn(
//     `Version mismatch detected for react-konva and react. react-konva expects to have react version ${REACT_VERSION}, but it has version ${
//       React.version
//     }. Make sure versions are matched, otherwise, react-konva work is not guaranteed. For releases information take a look here: https://github.com/konvajs/react-konva/releases`
//   );
// }

var KONVA_NODES = ['Layer', 'FastLayer', 'Group', 'Label', 'Rect', 'Circle', 'Ellipse', 'Wedge', 'Line', 'Sprite', 'Image', 'Text', 'TextPath', 'Star', 'Ring', 'Arc', 'Tag', 'Path', 'RegularPolygon', 'Arrow', 'Shape', 'Transformer'];

var TYPES = {};

KONVA_NODES.forEach(function (nodeName) {
  TYPES[nodeName] = nodeName;
});

var KonvaRenderer = ReactFiberReconciler(HostConfig);

KonvaRenderer.injectIntoDevTools({
  findFiberByHostInstance: ReactDOMComponentTree.getClosestInstanceFromNode,
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: React.version,
  rendererPackageName: 'react-konva',
  getInspectorDataForViewTag: function getInspectorDataForViewTag() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    console.log(args);
  }
});

function isValidKonvaContainer(container) {
  return container instanceof Konva.Container;
}

var REACT_KONVA_CONTAINER_KEY = Symbol('REACT_KONVA_CONTAINER_KEY');
function render(element, container, props, prevProps, callback) {
  invariant(isValidKonvaContainer(container), 'Target container is not a Konva container.');
  if (!container[REACT_KONVA_CONTAINER_KEY]) {
    container[REACT_KONVA_CONTAINER_KEY] = KonvaRenderer.createContainer(container, false, false);
  }
  var result = KonvaRenderer.updateContainer(element, container[REACT_KONVA_CONTAINER_KEY], null, callback);
  applyNodeProps(container, props, prevProps);
  return;
}

function unmountComponent(container) {
  if (!container[REACT_KONVA_CONTAINER_KEY]) return false;
  KonvaRenderer.unbatchedUpdates(function () {
    KonvaRenderer.updateContainer(null, container[REACT_KONVA_CONTAINER_KEY], null);
  });
  return true;
}

function NodeView(_ref) {
  var node = _ref.node,
      children = _ref.children,
      props = _objectWithoutProperties(_ref, ['node', 'children']);

  var prevProps = React.useRef();
  React.useLayoutEffect(function () {
    if (!node) return;
    return function () {
      return unmountComponent(node);
    };
  }, [node]);
  React.useLayoutEffect(function () {
    if (node) {
      render(children, node, props, prevProps.current);
      prevProps.current = props;
    }
  });
  return null;
}

var StageView = React.forwardRef(function StageView(props, ref) {
  var container = React.useRef(null);

  var _React$useState = React.useState(),
      stage = _React$useState[0],
      setStage = _React$useState[1];

  React.useImperativeHandle(ref, function () {
    return stage;
  }, [stage]);

  var prevProps = React.useRef();
  React.useLayoutEffect(function () {
    if (!Konva.isBrowser || !container.current) return;
    var stage = new Konva.Stage({
      width: props.width,
      height: props.height,
      container: container.current
    });
    render(props.children, stage, props, prevProps.current);
    prevProps.current = props;
    setStage(stage);
    return function () {
      unmountComponent(stage);
      stage.destroy();
    };
  }, []);
  React.useLayoutEffect(function () {
    if (stage) {
      render(props.children, stage, props, prevProps.current);
      prevProps.current = props;
    }
  });

  return React.createElement('div', {
    ref: container,
    accessKey: props.accessKey,
    className: props.className,
    role: props.role,
    style: props.style,
    tabIndex: props.tabIndex,
    title: props.title
  });
});

module.exports = _extends({}, TYPES, {
  __matchRectVersion: __matchRectVersion,
  useStrictMode: toggleStrictMode,
  render: render,
  unmountComponent: unmountComponent,
  NodeView: NodeView,
  StageView: StageView, Stage: StageView
});