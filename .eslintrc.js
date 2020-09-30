module.exports = {
    env: {
        node: true,
        browser: true,
    },
    extends: [
        'airbnb',
        'airbnb/hooks',
    ],
    parser: 'babel-eslint',
    rules: {
        'no-shadow': 'off',
        'no-plusplus': 'off',
        'no-continue': 'off',
        'no-await-in-loop': 'off',
        'no-nested-ternary': 'off',
        'no-param-reassign': 'off',
        'no-underscore-dangle': [
            'error', {
                allow: ['_id'],
                allowAfterSuper: true,
                allowAfterThis: true,
            },
        ],
        'no-multiple-empty-lines': [
            'error', {
                max: 1,
                maxBOF: 0,
                maxEOF: 1,
            },
        ],
        'no-unused-vars': [
            'error', {
                vars: 'all',
                args: 'none',
                ignoreRestSiblings: true,
            },
        ],

        indent: [
            'error', 4, {
                SwitchCase: 1,
            },
        ],
        'max-len': [
            'error', 120, 4, {
                ignoreUrls: true,
                ignoreComments: true,
                ignoreRegExpLiterals: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'arrow-parens': [
            'error', 'as-needed', {
                requireForBlockBody: true,
            },
        ],
        'lines-between-class-members': [
            'error', 'always', {
                exceptAfterSingleLine: true,
            },
        ],
        'object-curly-newline': [
            'error', {
                multiline: true,
                consistent: true,
            },
        ],
        'class-methods-use-this': 'off',
        'global-require': 'off',
        'prefer-destructuring': 'warn',

        'import/prefer-default-export': 'off',

        'react/prop-types': [
            'error', {
                skipUndeclared: true,
            },
        ],
        'react/destructuring-assignment': 'warn',
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-tag-spacing': [
            'error', {
                closingSlash: 'never',
                beforeSelfClosing: 'never',
                afterOpening: 'never',
                beforeClosing: 'never',
            },
        ],
        'react/jsx-filename-extension': [
            'error', {
                extensions: ['.js', '.jsx'],
            },
        ],
        'react/jsx-one-expression-per-line': 'off',

        'jsx-a11y/label-has-associated-control': 'off',
    },
};
