import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { globals: globals.node },
    rules: {
      camelcase: "off",
      "no-useless-constructor": "off",
      semi: ["error", "never"],
      indent: ["error", 2],
    },
    ignores: ["dist", "node_modules", "coverage"],
  },
  tseslint.configs.recommended,
])
