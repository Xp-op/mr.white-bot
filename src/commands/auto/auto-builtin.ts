import { Maybe } from "./auto-common";
import { DisBuiltin, DisObject, MaybeObj } from "./auto-obj";

export abstract class DBaseObj extends DisObject {
    init(args: DisObject[]): Maybe<DisObject> {
        return make_null();
    }

    view(args: DisObject[]): Maybe<DisObject> {
        return new Maybe<DisObject>(new DisString(`[Object:${this.typename}]`));
    }
}

export class DisType extends DBaseObj {
    typename: string = 'Type';
    type: DisObject;

    type_: DisObject;
    typename_: string;

    constructor(o: DisObject) {
        super();
        this.type_ = o;
        this.typename_ = o.typename;
        this.type = DisBuiltin["type"] ?? this;
    }

    init(args: DisObject[]): MaybeObj {
        if (args.length == 0)
            return new Maybe<DisObject>({ type: 'TypeError', msg: 'Type.init need atleast 1 argument' }, true);
        const v = args[0].gettype([]);
        if (v.err) return v;

        this.type_ = v.val as DisObject;
        return make_null();
    }

    view(args: DisObject[]): Maybe<DisObject> {
        return new Maybe<DisObject>(new DisString(`[Type:${this.typename_}]`));
    }

    make(args: DisObject[]): Maybe<DisObject> {
        const o = this.type.new_obj();
        const v = o.init(args);

        return v.err ? v : new Maybe<DisObject>(o);
    }

    new_obj(...args: any): DisObject {
        return new DisType(...args);
    }
}

export class DisString extends DBaseObj {
    typename: string = 'string';
    type: DisObject;
    val: string = '';

    constructor(v?: string) {
        super();
        if (v !== undefined)
            this.val = v;
        this.type = DisBuiltin["string"] ?? this;
    }

    init(args: DisObject[]): MaybeObj {
        if (args.length < 1)
            return make_null();
        
        const r = args[0].str([]);
        if (r.err) return r;

        const s = r.val as DisObject;

        if (s.type != this)
            return new Maybe<DisObject>({
                type: 'TypeError',
                msg: `${args[0].typename}.str return ${s.typename}`
            });
        
        this.val = (s as DisString).val;
        return make_null();
    }
}

export class NullType extends DBaseObj {
    typename: string = 'NullType';
    type: DisObject;

    constructor() {
        super();
        this.type = new DisType(DisBuiltin["null"] ?? this);
    }

    init(args: DisObject[]): MaybeObj {
        return make_null();
    }
}

DisBuiltin["null"] = new NullType();

export function make_null() {
    return new Maybe<DisObject>(DisBuiltin["null"]!);
}