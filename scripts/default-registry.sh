
#!/bin/bash

npm config get registry
yarn config get registry
npx lerna publish --dist-tag=test --preid=beta --conventional-prerelease --yes