const { traverseHtml } = require('providence-analytics');

/**
 *
 * @param {object} enrichedTemplateLiteral
 * @param {object} opts
 */
function findAttrMatch(enrichedTemplateLiteral, opts) {
  const { attrMatchConfigs } = opts;
  traverseHtml(enrichedTemplateLiteral.enrichedP5Ast, {
    childNodes(p5Path) {
      attrMatchConfigs.forEach(attrMatchConfig => {
        if (p5Path.node.nodeName === attrMatchConfig.tagName) {
          p5Path.node.attrs.forEach(attrObj => {
            if (attrObj.name === attrMatchConfig.attrName) {
              attrMatchConfig.onAttrMatch(attrObj);
            }
          });
        }
      });
    },
  });
}

module.exports = { findAttrMatch };
