const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: path.dirname(require.resolve("./package.json")),
  recommendedConfig: {},
});

module.exports = [
  ...compat.extends("expo"),
  {
    ignores: ["dist/*", "rootStore.example.ts", "nativewind-env.d.ts", "node_modules/*"],
  },
  {
    rules: {
      "import/first": "off",
    },
  },
];
