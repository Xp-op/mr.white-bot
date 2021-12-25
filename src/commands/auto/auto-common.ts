
export class LC {
    l: number;
    c: number;
    constructor(l: number, c: number) {
        this.l = l;
        this.c = c;
    }
    copy(): LC {
        return new LC(this.l, this.c);
    }
}

export type DisError = { type: string, lc: LC, msg: string };

export function format_error(source: string, errs: Array<DisError>): string {
    let err_ = '';
    
    for (const err of errs) {
        const ln = source.split('\n')[err.lc.l-1];
        const ln_p = ' '.repeat(err.lc.c-1) + '^';
        const err_msg = `${err.type}: ${err.msg} [line:${err.lc.l}|column:${err.lc.c}]`;
        err_ += [ln, ln_p, err_msg].join('\n') + '\n\n';
    }

    return err_;
}

type MaybeErr = { type: string, msg: string };

export class Maybe<T> {
    
    val: T | MaybeErr;
    err: Boolean;
    constructor(val: T | MaybeErr, err: Boolean=false) {
        this.val = val;
        this.err = err;
    }
}