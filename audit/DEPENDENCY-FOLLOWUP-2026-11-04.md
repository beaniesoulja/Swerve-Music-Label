# Dependency follow-up

## Result

Updated only `@typescript-eslint/typescript-estree`'s minimatch dependency from 10.2.5 to 11.0.4. Its caller uses the named `minimatch(path, pattern, { dot: true })` function, which remains supported. Explicit matching cases, TypeScript, all existing ESLint rules, 17 unit tests, 17 integration tests and the Cloudflare production build pass.

Fresh `npm audit`: **12 moderate, zero high/critical** (previously 13 moderate). `npm audit --omit=dev`: **zero findings**. No rules were disabled, packages renamed, advisory filters added or versions falsified to change the report.

## Remaining findings

All 12 entries trace to minimatch 3.1.5 in the development lint graph: minimatch itself; ESLint; @eslint/config-array; @eslint/eslintrc; @eslint-community/eslint-utils; eslint-plugin-react; eslint-plugin-jsx-a11y; typescript-eslint; and its eslint-plugin, parser, type-utils and utils packages. They are not twelve independent website vulnerabilities.

The current React and accessibility plugins require minimatch's callable v3 API. Version 11 exports an object with a named function. A global override breaks those callers; disabling their rules would reduce existing coverage. ESLint's latest 10.14.0 still declares minimatch ^10.2.6, so upgrading ESLint alone does not solve the graph.

The [maintainer advisory](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249) describes amplification in `firstPhasePreProcess` at `optimizationLevel >= 2`. Inspection of the installed 3.1.5 source confirms it has neither that function, `secondPhasePreProcess`, nor `optimizationLevel`. GitHub's broader affected range is [under an open clarification request](https://github.com/github/advisory-database/issues/10811). This is evidence that the specific reported mechanism does not apply to v3, not an upstream withdrawal of the advisory or a guarantee against other defects.

The site accepts no visitor-controlled lint glob patterns. Retain the honest audit count and revisit when the legacy plugins publish compatible updates or the advisory range is corrected. Replacing the complete lint stack solely to hide this disputed development-only report is not part of this fix.
