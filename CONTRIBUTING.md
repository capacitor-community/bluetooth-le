# Contributing

#### Prepare new version
1. Run `linting`
    ```bash
    npm run lint
    # if there are linting errors
    npm run prettier -- --write
    cd ios && swiftlint autocorrect
    ```
1. Update `CHANGELOG`
1. Generate `docs`
    ```bash
    npm run docgen
    ```
1. Update `usage` in README if necessary
1. Merge to main
1. Create new version
    ```bash
    npm version [<newversion> | major | minor | patch]
    ```
1. Publish
    ```bash
    npm publish
    ```