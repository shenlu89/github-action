export interface PandocOptions {
from?: string;
to?: string;
output?: string;
standalone?: boolean;
template?: string;
[key: string]: any;
}
export declare class PandocWasm {
constructor();
initialize(): Promise<void>;
convert(input: string, options?: PandocOptions): Promise<string>;
pandoc(argsStr: string, inputStr: string): string;
}
export declare const wasmPath: string;
export declare function getWasmBuffer(): Buffer;
export declare function convert(input: string, options?: PandocOptions): Promise<string>;
