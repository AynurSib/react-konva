/**
 * Based on ReactArt.js
 * Copyright (c) 2017-present Lavrenov Anton.
 * All rights reserved.
 *
 * MIT
 */
'use strict';

const ReactKonvaCore = require('./ReactKonvaCore');
const ReactKonvaView = require('./ReactKonvaView');
// import full konva to enable all nodes
const Konva = require('konva');

module.exports = {
  ...ReactKonvaCore,
  ...ReactKonvaView
};
