import { Target } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';

export type TargetOptions = json.JsonObject & Target;
