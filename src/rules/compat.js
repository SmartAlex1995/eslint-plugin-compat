// @flow
import Lint, { generateErrorName } from '../Lint';
import type { ESLintNode, Node } from '../Lint'; // eslint-disable-line


type ESLint = {
  [x: string]: (node: ESLintNode) => void
};

type Context = {
  node: ESLintNode,
  settings: {
    targets: Array<string>,
    polyfills: Array<string>
  },
  report: () => void
};

export default {
  meta: {
    docs: {
      description: 'Ensure cross-browser API compatibility',
      category: 'Compatibility',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context: Context): ESLint {
    // FIXME: lint() creates a new Set on every invocation. Fix this by removing
    //        creating a single set and passing a refrence lint() a reference
    //        to it
    //
    // FIXME: Another performance enhancement includes collecting all the rules
    //        into a single list. As of now, every call to lint() must find
    //        all the corresponding AST node rules.
    function lint(node: ESLintNode) {
      const { isValid, rule, unsupportedTargets } = Lint(
        node,
        context.settings.targets,
        context.settings.polyfills
          ? new Set(context.settings.polyfills)
          : undefined
      );

      if (!isValid) {
        context.report({
          node,
          message: [
            generateErrorName(rule),
            'is not supported in latest', // HACK: 'latest' is hardcoded. should
            unsupportedTargets.join(', ') //       be resolved dynamically using
          ].join(' ')                     //       eslintrc config
        });
      }
    }

    return {
      // HACK: Ideally, rules will be generated at runtime. Each rule will have
      //       have the ability to register itself to run on specific AST
      //       nodes. For now, we're using the `CallExpression` node since
      //       its what most rules will run on
      CallExpression: lint,
      MemberExpression: lint,
      NewExpression: lint
    };
  }
};
