// why separate bigint with int? stupid javascript (i think)

import { LC, DisError } from './auto-common';
import { AstNode, NodeInvalid, NodeValue, BinOp, Optype } from './auto-node';

enum Tok {
    STR,
    INT,
    PLUS, MINUS, STAR, SLASH,
    ID, ON, COMMA, WITH,
    LPAREN, RPAREN,
    LCURLY, RCURLY,
    ASSIGN,
    REPLY, SEND, TO, EMBED, REMOVE,
    COLON, SEMICOLON,
    SET, IF, ELSE,
    EOF = -1
}

class Token {
    type: Tok;
    lex: string;
    str: string;
    lc: LC;

    constructor(type: Tok, lex: string, str: string, lc: LC) {
        this.type = type;
        this.lex = lex;
        this.str = str;
        this.lc = lc.copy();
    }

    toString(): string {
        return `Token(type: ${this.type}, lex: ${this.lex}, str: ${this.str}, [${this.lc.l}:${this.lc.c}])`;
    }
}

class Scanner {
    private source: string;
    tokens: Array<Token> = [];
    private p: number = -1;
    private char: string = '\0';
    private _lc: LC = new LC(1, 0);
    private lc: LC = new LC(1, 0);
    error_objs: Array<DisError> = [];

    static escape_char: { [key: string]: string } = {
        'n': '\n',
        'r': '\r',
        't': '\t',
    };

    static keywords: { [key: string]: Tok } = {
        'on': Tok.ON,
        'with': Tok.WITH,
        'reply': Tok.REPLY,
        'send': Tok.SEND,
        'remove': Tok.REMOVE,
        'to': Tok.TO,
        'embed': Tok.EMBED,
        'set': Tok.SET,
        'if': Tok.IF,
        'else': Tok.ELSE,
    };

    constructor(source: string) {
        this.source = source;
        this.advance();
    }

    private advance() {
        this.p++;
        this.char = this.p < this.source.length ? this.source.charAt(this.p) : '\0';
        if (this.char == '\n') {
            this._lc.l++;
            this._lc.c = 1;
        } else {
            this._lc.c++;
        }
    }

    scan() {
        while (this.p < this.source.length) {
            this.lc = this._lc.copy();
            this.scan_token();
        }
        this.tokens.push(new Token(Tok.EOF, 'EOF', 'EOF', this.lc));
    }

    private scan_token() {
        switch (this.char) {
            case '\n':
            case '\t':
            case '\r':
            case ' ':
                this.advance();
                break;
            
            case '"':
            case "'":
                this.scan_string();
                break;


            case '=':
                this.tokens.push(new Token(Tok.ASSIGN, this.char, this.char, this.lc));
                this.advance();
                break;


            case ',':
                this.tokens.push(new Token(Tok.COMMA, this.char, this.char, this.lc));
                this.advance();
                break;


            case ':':
                this.tokens.push(new Token(Tok.COLON, this.char, this.char, this.lc));
                this.advance();
                break;
            case ';':
                this.tokens.push(new Token(Tok.SEMICOLON, this.char, this.char, this.lc));
                this.advance();
                break;


            case '(':
                this.tokens.push(new Token(Tok.LPAREN, this.char, this.char, this.lc));
                this.advance();
                break;
            case ')':
                this.tokens.push(new Token(Tok.RPAREN, this.char, this.char, this.lc));
                this.advance();
                break;


            case '{':
                this.tokens.push(new Token(Tok.LCURLY, this.char, this.char, this.lc));
                this.advance();
                break;
            case '}':
                this.tokens.push(new Token(Tok.RCURLY, this.char, this.char, this.lc));
                this.advance();
                break;


            case '+':
                this.tokens.push(new Token(Tok.PLUS, this.char, this.char, this.lc));
                this.advance();
                break;
            case '-':
                this.tokens.push(new Token(Tok.MINUS, this.char, this.char, this.lc));
                this.advance();
                break;
            case '*':
                this.tokens.push(new Token(Tok.STAR, this.char, this.char, this.lc));
                this.advance();
                break;
            case '/':
                this.tokens.push(new Token(Tok.SLASH, this.char, this.char, this.lc));
                this.advance();
                break;
            
            default:
                if (this.char.match(/[0-9]/))
                    this.scan_int();
                else if (this.char.match(/[a-zA-Z_]/))
                    this.scan_id();
                else {
                    this.error_objs.push({
                        type: 'SyntaxError',
                        lc: this._lc.copy(),
                        msg: `Invalid character '${this.char}'`
                    });
                    this.advance();
                }
                break;
        }
    }

    private scan_string() {
        const q = this.char;
        this.advance();

        let lex: string = q, val: string = '';

        while ((this.p < this.source.length) && this.char != q) {
            lex += this.char;
            if (this.char == '\\') {
                this.advance();
                lex += this.char;
                if (this.char in Scanner.escape_char) {
                    val += Scanner.escape_char[this.char];
                    this.advance();
                } else if (this.char.match(/[0-9]/)) {
                    let iv: string = this.char;
                    this.advance();
                    lex += this.char;

                    let dic = 1;
                    while (this.char.match(/[0-9]/) && dic != 4) {
                        iv += this.char;
                        dic++;
                        this.advance();
                        lex += this.char;
                    }

                    val += String.fromCharCode(parseInt(iv));
                } else if (this.char === q) {
                    val += q;
                    this.advance();
                } else {
                    val += '\\';
                    this.advance();
                }
                continue;
            }
            val += this.char;
            this.advance();
        }

        if (this.char != q) {
            this.error_objs.push({
                type: 'SyntaxError',
                lc: this._lc.copy(),
                msg: `Unclosed string literal (put ${q} here)`
            });
        }

        this.advance();
        lex += q;

        this.tokens.push(new Token(Tok.STR, lex, val, this._lc));
    }

    private scan_int() {
        let num: string = this.char;

        this.advance();
        while (this.char.match(/[0-9]/)) {
            num += this.char;
            this.advance();
        }

        this.tokens.push(new Token(Tok.INT, num, num, this.lc));
    }

    private scan_id() {
        let id: string = this.char;
        
        this.advance();
        while (this.char.match(/[a-zA-Z0-9_]/)) {
            id += this.char;
            this.advance();
        }

        let t: Tok = Tok.ID;

        if (id in Scanner.keywords)
            t = Scanner.keywords[id];
        
        this.tokens.push(new Token(t, id, id, this.lc));
    }
}


class Parser {
    private tokens: Array<Token>;
    private p: number = 0;
    private prev: Token;
    private curr: Token;
    private lc: LC | null = null;

    nodes: Array<AstNode> = [];

    error_objs: Array<DisError> = [];

    constructor(tokens: Array<Token>) {
        this.tokens = tokens;
        this.curr = this.tokens[this.p];
        this.prev = this.curr;
    }

    private next_token() {
        this.p++;
        this.prev = this.curr;
        this.curr = this.p < this.tokens.length ? this.tokens[this.p] : new Token(Tok.EOF, 'EOF', 'EOF', new LC(0,0));
    }

    public parse() {
        while (this.curr.type != Tok.EOF) {
            this.lc = this.curr.lc;
            this.parse_token();
        }
    }

    private parse_token() {
        this.nodes.push(this.expr());
    }

    private expr_prec2(): AstNode {
        this.next_token();
        switch (this.prev.type) {
            case Tok.STR: return new NodeValue(this.prev.str, this.prev.lc);
            case Tok.INT: return new NodeValue(parseInt(this.prev.str), this.prev.lc);
            default:
                this.error_objs.push({
                    type: 'SyntaxError',
                    lc: this.prev.lc,
                    msg: `Unexpected ${this.prev.lex}`
                });
                return new NodeInvalid();
        }
    }

    private expr_prec1(): AstNode {
        let n: AstNode = this.expr_prec2();

        while ([Tok.STAR, Tok.SLASH].includes(this.curr.type)) {
            const op: Optype = this.curr.type == Tok.STAR ? Optype.MUL : Optype.DIV;
            const lc = this.curr.lc;
            this.next_token();
            n = new BinOp(n, this.expr_prec2(), op, lc);
        }
        
        return n;
    }
    
    private expr(): AstNode {
        let n: AstNode = this.expr_prec1();
        
        while ([Tok.PLUS, Tok.MINUS].includes(this.curr.type)) {
            const op: Optype = this.curr.type == Tok.PLUS ? Optype.ADD : Optype.SUB;
            const lc = this.curr.lc;
            this.next_token();
            n = new BinOp(n, this.expr_prec1(), op, lc);
        }

        return n;
    }
}


export function auto_parse(source: string): Array<DisError> | null {
    const s = new Scanner(source);
    s.scan();
    
    if (s.error_objs.length > 0) return s.error_objs;

    //for (const t of s.tokens)
    //    console.log(t.toString());

    const p = new Parser(s.tokens);
    p.parse();

    if (p.error_objs.length > 0) return p.error_objs;

    for (const node of p.nodes)
        console.log(node.toString());

    return null;
}
