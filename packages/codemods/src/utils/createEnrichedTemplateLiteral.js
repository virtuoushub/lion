const { traverseHtml } = require('providence-analytics');
const { parse5 } = require('parse5');

const PLACEHOLDER = '{{}}';

/**
 * @param {BabelAstPath} taggedTemplateExpressionPath
 */
function createEnrichedTemplateLiteral(taggedTemplateExpressionPath) {
  const stitchedTpl = taggedTemplateExpressionPath.node.quasi.quasis
    .map(templateEl => templateEl.value.raw)
    .join(PLACEHOLDER);
  const p5Ast = parse5(stitchedTpl);

  // Add expressions to attributes
  let exprIndex = 0;
  traverseHtml(p5Ast, {
    childNodes(p5Path) {
      p5Path.node.attrs.forEach(attrObj => {
        if (attrObj.value === PLACEHOLDER) {
          // eslint-disable-next-line no-param-reassign
          attrObj.expression = p5Path.node.quasi.expressions[exprIndex];
          exprIndex += 1;
        }
        const typeMap = { '?': 'boolean', '.': 'property', '@': 'event' };
        Object.entries(typeMap).forEach(([symbol, type]) => {
          if (attrObj.name.startsWith(symbol)) {
            // eslint-disable-next-line no-param-reassign
            attrObj.type = type;
          }
        });
      });
    },
  });

  return {
    taggedTemplateExpressionPath,
    enrichedP5Ast: p5Ast,
  };
}

module.exports = { createEnrichedTemplateLiteral };
