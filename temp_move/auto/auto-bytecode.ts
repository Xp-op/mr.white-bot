import { LC } from "./auto-common";

export enum OpCode {
    PUSH,
    ADD,
    SUB,
    MUL,
    DIV
}

export interface Instruction {
    code: OpCode;
    lc: LC;
    toString(): string;
}

export class InstrPush implements Instruction {
    code: OpCode = OpCode.PUSH;
    lc: LC;

    constructor()
}