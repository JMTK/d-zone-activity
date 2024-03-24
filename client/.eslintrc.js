module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "es2024": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": true,
        "ecmaVersion": 2024
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "extends": [
        "plugin:promise/recommended",
        "eslint:recommended",
    ],
    "rules": {
        "prefer-const": "error",
        "no-var": "error",
        "node/no-extraneous-import": "off",
        "quotes": [
            "error",
            "single",
            { "avoidEscape": true, "allowTemplateLiterals": true}
        ],
        "linebreak-style": [
            "warn",
            "unix"
        ],
        "brace-style": ["error", "stroustrup"],
        "object-property-newline": "error",
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-unpublished-import": "off",
        "node/no-deprecated-api": "off",
        "no-unsafe-optional-chaining": "off",
        "no-dupe-class-members": "off",
        "node/no-missing-import": "off",
        "no-useless-escape": "off",
        "no-process-exit": "off",
        "node/no-missing-require": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/prefer-nullish-coalescing": ["error", { "ignoreConditionalTests": true }],
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "no-undef": [
            "error"
        ],
        "@typescript-eslint/prefer-for-of": ["warn"],
        "semi": [
            "warn",
            "always"
        ],
        "arrow-spacing": [
            "warn",
            {}
        ],
        "block-scoped-var": [
            "warn"
        ],
        "prefer-template": [
            "error"
        ],
        "no-useless-concat": [
            "error"
        ]
    }
};
