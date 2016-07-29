# Introduction: simple-ts-schema
With this code it its possible to create simple schemas of objects that can validate both the type and value of the content. This is designed to be used as an decorator. This means _experimentalDecorators: true_ should be set in your projects _tsconfig.json_. The decorator is exposed as _SchemaComponent_ while models included are exposed as _SchemaModels_.

# Usage
To use this in your project and save it in the package.json file do:
`npm install simple-ts-schema --save`

Please be aware that we use [semantic versioning](http://semver.org). This means that you should be able to safely subscribe to updates on this module for versions 1.x.x or 2.x.x etc. Major versions for example from 1.x.x to 2.x.x is not safe as the module API might change.

# How to
The best way to show you how this works is by example. Please follow one below.

```typescript
import {SchemaComponent, SchemaModels}            from    'simple-ts-schema';

/**
* Create a datatype boolean
*/
class MyBoolean implements SchemaModels.Element {
    public _value: any;
    constructor(data: any) {

        // convert to correct form
        if (data === 'false') {
            data = false;
        } else if (data === 'true') {
            data = true;
        }

        if (data !== false && data !== true) {
            throw new Error('not a boolean');
        }
        this._value = data;
    }
}

/**
* Create a datatype string
*/
class MyString implements SchemaModels.Element {
    public _value: any;
    constructor(data: any) {

        this._value = data;
    }
}

/**
* Create values our goat can have
*/
let: goatNames: SchemaModels.Values = {};
goatNames['hans'] = true;
goatNames['Grethe'] = false;    // The actual true/false dont matter is not checked

/**
* Create a schema
*/
@SchemaComponent
export class Goat {
    public name: SchemaModels.PropertyDefinition = {
        max: 2,     // can have up to two names
        min: 1,     // Needs at least one name
        types: [MyString]   // array of types supported by this property
        values: goatNames   // only allow hans or Grethe
    };
    public cool: SchemaModels.PropertyDefinition = {
        max: 1, 
        min: 0,
        types: [MyBoolean]
    };
    constructor(data: any, enforce: SchemaModels.Enforce) {

        // do nothing
    }
}

// This is okay
new Goat({cool: true, name: ['hans']}) ;
// This is not missing name
new Goat({cool: true}); 
// this is not name is not array
new Goat({cool: false, name: 'Grethe'});
// this is not cool is not boolean
new Goat({cool: 'false', name: ['Grethe']});

```


# License
The MIT License (MIT)

