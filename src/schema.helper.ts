import {Enforce}                               from './models/enforce';
import {Element}                               from './models/element';

/**
 * Interface describing a Data
 */
export interface Data {
    [key: string]: any;
}

/**
 * Methods for validation of the content of an object
 */
export class SchemaHelper {
    /**
     * Populate the instance of a Data with some data and validate the data
     * @param {Data}   data        data to be used in population and to be validated
     * @param {Enforce} validate    the level of of validation required
     * @param data
     */
    public popAndValidate(data: Data, validate: Enforce): void {

        let target: Data = this;

        // if validation should occure for required fields
        if (validate === Enforce.required) {

            // loop fields to see if they are present and check for required fields
            Object.keys(target).forEach((key: string) => {

                // validate it is a native to object prop
                if (target.hasOwnProperty(key)) {

                    // set the value
                    if (data[key] !== undefined) {

                        // binds the new value
                        this.setValue(data, key);

                        // remove the key from provided data
                        delete data[key];

                        // check if field is required if skip is not set
                    } else if (target[key].min !== 0) {

                        // notify about error
                        throw new Error(key + ': is required and not present in provided data');

                        // delete prop if not being set
                    } else {
                        delete target[key];
                    }
                }
            });

            // look though all fields
        } else if (validate === Enforce.exists) {

            Object.keys(this).forEach((key: string) => {

                // validate it is a native to object prop
                if (this.hasOwnProperty(key)) {

                    // set the value
                    if (data[key] !== undefined) {

                        this.setValue(data, key);

                        // remove the key from provided data
                        delete data[key];

                        // delete prop if not being set
                    } else {
                        delete target[key];
                    }
                }
            });
        }

        // check if any properties are left
        Object.keys(data).forEach((key: string) => {

            // no fields should be present so write that back
            throw new Error('Your data ' + key + ': is not allowed');
        });
    }
    /**
     * Bind value to key in this object
     * @param {Data}   data        data containing value to be set
     * @param {String}  key         key in data for value
     */
    public setValue(data: Data, key: string): void {

        // value can take any form since it depend on the class tested
        let value: any;

        // reference to self
        let target: Data = this;

        try {

            // is type an array?
            if (target[key].max !== undefined && target[key].max !== 1) {

                // empty array
                value = [];

                // is provided data all so an array
                if (!Array.isArray(data[key])) {

                    // tell about error
                    throw new Error('Your data ' + key + ' should be an array');

                    // provided data IS an array
                } else {

                    // loop all the data
                    data[key].forEach((elm: string) => {

                        // save correct value
                        value.push(this.getValueFromAllTypes(target[key].type, elm, Enforce.required));
                    });
                }

                // single value test
            } else {

                // test if value type is okay
                value = this.getValueFromAllTypes(target[key].type, data[key], Enforce.required);
            }

            // check binding against valueset if a binding is set   
            if (target[key].binding !== undefined
                && target[key].binding.valueSet.isInValueSet(value, target[key].binding.strength) === false) {

                // notify that valueset is not okay
                throw new Error('Provided value for ' + key + ' is not supported');

            }

            // save value that is okay
            target[key] = value;

            // report when some error has happend
        } catch (e) {
            throw new Error(key + ': ' + e.toString());
        }
    }
    /**
     * Get the value from a type based on an initial value
     * @param {any}      type        type value shall be extracted from
     * @param {any}      value       value to be set to a type
     * @param {Enforce}  validate    level of validation to be done on the type
     */
    public getValueFromType(type: any, value: any, validate: Enforce): any {

        // test if value type is okay and save it
        let temp: Element = new type(value, validate);

        // some datatypes are pure elements check for that
        if (typeof temp._value !== 'undefined') {
            temp = temp._value;
        }

        return temp;
    }
    /**
     * Get the value from all data types
     * @param {Array<any>}  type        type value shall be extracted from
     * @param {any}         value       value to be set to a type
     * @param {Enforce}     validate    level of validation to be done on the type
     */
    public getValueFromAllTypes(types: Array<any>, value: any, validate: Enforce): any {

        // reference to value
        let temp: any;
        let error: string = '';
        let ok: boolean = false;

        // go through all the data types
        types.every((type: any) => {

            try {

                // when one type is ok then skip test of new types
                temp = this.getValueFromType(type, value, validate);
                ok = true;
                return false;

            } catch (err) {

                // append found error
                error += err.message;
                return true;
            }
        });

        // check if ok is true
        if (ok === true) {
            return temp;
        } else {
            throw new Error('Type is not okay for value: ' + value);
        }
    }
}
