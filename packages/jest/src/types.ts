// The type is used to replace the `any` type to be more explicit with return types.
// We can't use the `Config` type from `jest` since this might be a breaking change.
export type JestConfig = Record<string, any>;
