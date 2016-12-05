// @flow
import path from 'path';
import { readFileSync } from 'fs';
import type { Node, ESLintNode, Targets } from '../DetermineCompat';


export const supportedTargets: Targets = [
  'chrome', 'firefox', 'opera', 'safari', 'android', 'ie', 'edge',
  'ios_saf', 'op_mini', 'android', 'bb', 'op_mob', 'and_chr', 'and_ff',
  'ie_mob', 'and_uc', 'samsung'
];

function isValid(node: Node, eslintNode: ESLintNode, targets: Targets): bool {
  // Filter non-matching objects and properties
  if (
    eslintNode.callee.object.name !== node.object ||
    eslintNode.callee.property.name !== node.property
  ) return true;

  // Check the CanIUse database to see if targets are supported
  const caniuseRecord: Object = JSON.parse(
    readFileSync(path.join(__dirname, `./caniuse/features-json/${node.id}.json`)).toString()
  ).stats;

  // Check if targets are supported. By default, get the latest version of each
  // target environment
  return targets.every((target: Object): bool => {
    const versions = Object.values(caniuseRecord[target]);
    const latest = versions[versions.length - 1];
    return latest !== 'n';
  });
}

const CanIUseProvider: Node[] = [
  // ex. new ServiceWorker()
  {
    id: 'serviceworkers',
    ASTNodeType: 'CallExpression',
    object: 'document',
    property: 'ServiceWorker',
    isValid
  },
  // ex. document.querySelector()
  {
    id: 'queryselector',
    ASTNodeType: 'CallExpression',
    object: 'document',
    property: 'querySelector',
    isValid
  },
  // ex. document.currentScript()
  {
    id: 'document-currentscript',
    ASTNodeType: 'CallExpression',
    object: 'document',
    property: 'currentScript',
    isValid
  }
];

export default CanIUseProvider;
