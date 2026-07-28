import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default [
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // These React Compiler diagnostics are advisory for this existing app;
      // keep the project lint focused on correctness and its RTL/privacy rules.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\b(pl|pr|ml|mr)-(0|1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)\\b|\\btext-(left|right)\\b/]",
          message: "Use logical direction utilities (ps/pe/ms/me/text-start/text-end).",
        },
        {
          selector: "JSXText[value=/[0-9]/]",
          message: "Render numbers, currency, IDs and timestamps with <Numeric>.",
        },
      ],
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**"],
  },
];
