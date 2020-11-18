/**
 * check for TS node registration
 * @param file: file name or file directory are allowed
 * @todo tsNodeRegistration: require ts-node if file extension is TypeScript
 */
export function tsNodeRegister(file: string = '', tsConfig?: string) {
  if (file && file.endsWith('.ts')) {
    // Register TS compiler lazily
    require('ts-node').register({
      project: tsConfig,
      compilerOptions: {
        module: 'commonjs',
      },
    });
  }
}
