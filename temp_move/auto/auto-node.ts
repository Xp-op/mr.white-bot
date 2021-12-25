import { LC } from './auto-common';

export enum NodeType {
    INVALID = -1,
    VALUE,
    BIN_OP,
    ON,
    SET_VAR,
    IF,
    IF_ELSE,
    SEND,
    REPLY,
    REMOVE,
    EMBED
}

export interface AstNode {
    type: NodeType;
    lc: LC;
    toString(): string;
}

export enum Optype {
    ADD,
    SUB,
    MUL,
    DIV
}

export class NodeInvalid implements AstNode {
    type: NodeType = NodeType.INVALID;
    lc: LC = new LC(-1, -1);
}

export class NodeValue implements AstNode {
    type: NodeType = NodeType.VALUE;

    value: any;
    lc: LC;

    constructor(val: any, lc: LC) {
        this.value = val;
        this.lc = lc;
    }

    toString(): string {
        return `Value{ ${this.value} }`;
    }
}

export class BinOp implements AstNode {

    type: NodeType = NodeType.BIN_OP;
    
    left: AstNode;
    right: AstNode;
    op: Optype;

    lc: LC;

    constructor(left: AstNode, right: AstNode, op: Optype, lc: LC) {
        this.left = left;
        this.right = right;
        this.op = op;
        this.lc = lc;
    }

    toString(): string {
        return `BinOp{ left: ${this.left.toString()}, op: ${this.op}, right: ${this.right.toString()} }`;
    }
}