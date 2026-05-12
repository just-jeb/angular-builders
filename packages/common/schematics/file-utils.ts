import { Tree, SchematicsException } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Reads a JSON file from the workspace tree.
 */
export function readJsonFile<T>(tree: Tree, filePath: string): T {
  const buffer = tree.read(filePath);
  if (!buffer) {
    throw new SchematicsException(`File not found: ${filePath}`);
  }
  try {
    return JSON.parse(buffer.toString('utf-8'));
  } catch (e) {
    throw new SchematicsException(`Failed to parse JSON file ${filePath}: ${e}`);
  }
}

/**
 * Writes a JSON file to the workspace tree.
 */
export function writeJsonFile<T>(tree: Tree, filePath: string, data: T): void {
  const json = JSON.stringify(data, null, 2);
  tree.overwrite(filePath, json);
}

/**
 * Checks if a file exists in the workspace tree.
 */
export function fileExists(tree: Tree, filePath: string): boolean {
  return tree.exists(filePath);
}

/**
 * Gets a text file content from the workspace tree.
 */
export function readTextFile(tree: Tree, filePath: string): string {
  const buffer = tree.read(filePath);
  if (!buffer) {
    throw new SchematicsException(`File not found: ${filePath}`);
  }
  return buffer.toString('utf-8');
}

/**
 * Writes text content to the workspace tree.
 */
export function writeTextFile(tree: Tree, filePath: string, content: string): void {
  tree.create(filePath, content);
}
