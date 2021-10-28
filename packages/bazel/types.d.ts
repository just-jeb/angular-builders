declare module '@bazel/bazelisk/bazelisk' {
  function getNativeBinary(): Promise<number>|string;
}

declare module '@bazel/ibazel' {
  function getNativeBinary(): Promise<number>|string;
}
