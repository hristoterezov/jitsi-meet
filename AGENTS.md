# Contributor Guide

## Code structure tips
- Most of our code is defined in react/ directory and all new code should go there.
- Some of our legacy code still lives in the modules/ directory and we are slowly trying to migrate it to the react directory. Adding new code there should be avoided whenever possible.
- In css/ folder we have our SCSS files. We are currently trying to use JSS and migrate the legacy SCSS slowly.
- Our tests are defined in the tests/ directory.

## Testing Instructions
- Find the CI plan in the .github/workflows folder.
- Run npm run tsc:ci to run all TypeScript checks.
- Run npm run lint:ci to run all ESLint checks.
- Run npm start to build the project and start it with the local web dev server.
- Our WDIO tests are defined in tests directory.
- Run npm run test-dev in order to run all WDIO tests. You can also use npm run test-dev-single <test-name> if for the specific use case one test will cover all changes made.
- The commit should pass all tests before you merge.
- To focus on one step you can use: npm run test-dev-single <test-name>
- Fix any test or type errors until everything passes.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions

Comit messages: Follow the convention defined [here](https://www.conventionalcommits.org/en/v1.0.0/#summary)
