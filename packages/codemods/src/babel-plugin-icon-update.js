const { createEnrichedTemplateLiteral } = require('./utils/createEnrichedTemplateLiteral.js');
const { findAttrMatch } = require('./utils/findAttrMatch.js');

const PLACEHOLDER = '{{}}';

/**
 *
 * @param {*} attrObj
 */
function replaceValue(attrObj, opts) {
  let value;
  if (value === PLACEHOLDER && attrObj.expression.type === 'Literal') {
    value = attrObj.expression.value;
  } else {
    value = attrObj.value;
  }

  const mapped = opts.oldToNewMap[value];
  if (mapped) {
    // eslint-disable-next-line no-param-reassign
    attrObj.value = mapped;
  }
}

const attrMatchConfigs = [
  {
    tagName: 'lion-icon',
    attrName: 'icon-id',
    onAttrMatch: replaceValue,
  },
  {
    tagName: 'lion-icon',
    attrName: '.iconId',
    onAttrMatch: replaceValue,
  },
];

export default function () {
  // const { types: t } = babel;
  return {
    name: 'icon-update', // not required
    visitor: {
      TaggedTemplateExpression(path, state) {
        if (path.node.tag.name !== 'html') {
          return;
        }
        const enrichedTemplateLiteral = createEnrichedTemplateLiteral(path);
        // This manipulates enrichedTemplateLiteral
        findAttrMatch(enrichedTemplateLiteral, { attrMatchConfigs, ...state.opts });
        // Now write back result to TaggedTemplateExpression
      },
    },
  };
}
