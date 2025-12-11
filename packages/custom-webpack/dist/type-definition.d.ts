import { Target } from '@angular-devkit/architect/src/input-schema';
import { json } from '@angular-devkit/core';
export type TargetOptions = json.JsonObject & Target;
