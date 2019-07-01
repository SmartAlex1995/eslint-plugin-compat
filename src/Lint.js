// @flow
import { rules } from './providers';
import type { Node, ESLintNode, Targets, lintResultObject } from './LintTypes';

export function generateErrorName(_node: Node): string {
  if (_node.name) return _node.name;
  if (_node.property) return `${_node.object}.${_node.property}()`;
  return _node.object;
}

/**
 * Return false if a if a rule fails
 *
 * TODO: Eventually, targets will default to 'modern', ('chrome@50', safari@8)
 *       See https://github.com/amilajack/eslint-plugin-compat/wiki#release-200
 */
export default function Lint(
  eslintNode: ESLintNode,
  targets: Targets = ['chrome', 'firefox', 'safari', 'edge'],
  polyfills: Set<string>
): ?lintResultObject {
  // Find the corresponding rules for a eslintNode by it's astNodeType
  const failingRule = rules.find(
    (rule: Node): boolean =>
      rule.astNodeType === eslintNode.type &&
      // Check that the rule fails for this node (unless there's a polyfill)
      !rule.isValid(rule, eslintNode, targets) &&
      // v2 allowed users to select polyfills based off their caniuseId. This is
      // no longer supported. Keeping this here to avoid breaking changes.
      !polyfills.has(rule.id) &&
      // Check if polyfill is provided (ex. `Promise.all`)
      !polyfills.has(rule.protoChainId) &&
      // Check if entire API is polyfilled (ex. `Promise`)
      !polyfills.has(rule.protoChain[0])
  );

  return failingRule
    ? {
        rule: failingRule,
        unsupportedTargets: failingRule.getUnsupportedTargets(
          failingRule,
          targets
        )
      }
    : null;
}
