import { Maybe } from "./auto-common";

// DisObject = Discord Object
export abstract class DisObject {
    abstract type: DisObject;
    abstract typename: string;

    abstract init(args: DisObject[]): Maybe<DisObject>;

    gettype(_args: DisObject[]): Maybe<DisObject> {
        return new Maybe<DisObject>(this.type!);
    }

    abstract view(args: DisObject[]): Maybe<DisObject>;
    str(args: DisObject[]): Maybe<DisObject> { return this.view([]); }
    
    add(args: DisObject[]): Maybe<DisObject>
        { return new Maybe<DisObject>({ type: 'TypeError', msg: `${this.typename} Doesn't support operation adder` }); }
    
    sub(args: DisObject[]): Maybe<DisObject>
        { return new Maybe<DisObject>({ type: 'TypeError', msg: `${this.typename} Doesn't support operation subtract` }); }
    
    mul(args: DisObject[]): Maybe<DisObject>
        { return new Maybe<DisObject>({ type: 'TypeError', msg: `${this.typename} Doesn't support operation multiplication` }); }
    
    div(args: DisObject[]): Maybe<DisObject>
        { return new Maybe<DisObject>({ type: 'TypeError', msg: `${this.typename} Doesn't support operation division` }); }

    getattr(args: DisObject[]): Maybe<DisObject> {
        if (args.length < 1)
            return new Maybe<DisObject>({ type: 'TypeError', msg: `${this.typename}.getattr need atleast 1 argument` });
        return new Maybe<DisObject>({ type:'', msg:'' });
    }

    make(args: DisObject[]): Maybe<DisObject> {
        return new Maybe<DisObject>({
            type: 'TypeError',
            msg: `${this.typename} is not makeable`
        });
    }

    abstract new_obj(...args: any): DisObject;
}

export type MaybeObj = Maybe<DisObject>;

export let DisBuiltin: { [key: string]: DisObject | null } = {
    "type": null,
    "string": null,
    "int": null,
    "null": null,
}