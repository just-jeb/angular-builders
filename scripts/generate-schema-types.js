// Generates `src/schema.ts` from `src/schema.json` with quicktype. Run from a package directory.
//
// quicktype 26 turns a top-level `additionalProperties` schema into a TypeScript index signature on
// the options interface. For jest that signature (`string[]`) clashes with every typed option, so the
// generated file no longer compiles. The typed form is only a hint for TypeScript; Angular CLI validates
// against the shipped `schema.json`, which this script leaves untouched. The types are generated from a
// copy where the keyword is relaxed to `true`, which yields an `unknown` index signature that every typed
// option satisfies.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const schemaPath = path.resolve('src/schema.json');
const outPath = path.resolve('src/schema.ts');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
if (typeof schema.additionalProperties === 'object') {
  schema.additionalProperties = true;
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-types-'));
try {
  const tmpSchema = path.join(tmpDir, 'schema.json');
  fs.writeFileSync(tmpSchema, JSON.stringify(schema));
  execFileSync(
    process.execPath,
    [require.resolve('quicktype'), '-s', 'schema', tmpSchema, '--no-prefer-unions', '-o', outPath],
    { stdio: 'inherit' }
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
