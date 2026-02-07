import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;
