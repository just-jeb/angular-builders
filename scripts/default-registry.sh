
#!/bin/bash

NPM_CONFIG_PROVENANCE=true yarn lerna publish --dist-tag=next --preid=beta --conventional-prerelease --yes
