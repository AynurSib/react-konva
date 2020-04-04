/**
 * Based on ReactArt.js
 * Copyright (c) 2017-present Lavrenov Anton.
 * All rights reserved.
 *
 * MIT
 */
'use strict';

const React = require('react');
const { render, unmountComponent } = require('./ReactKonvaCore');
const { applyNodeProps } = require('./makeUpdates');

const Stage = React.forwardRef(function Stage(props, ref) {
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
    setStage(stage);
    applyNodeProps(stage, props, prevProps.current);
    render(props.children, stage);
    prevProps.current = props;
    return () => {
      unmountComponent(stage);
      stage.destroy();
    };
  }, [ ]);
  React.useLayoutEffect(() => {
    if (!stage) return;
    applyNodeProps(stage, props, prevProps.current);
    render(props.children, stage);
    prevProps.current = props;
  });

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
  Stage,
};
