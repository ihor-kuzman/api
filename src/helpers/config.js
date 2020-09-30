import path from 'path';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import merge from 'lodash/merge';

const namespaces = {};

class Config {
    constructor() {
        this.storage = {};

        this.load('.', require.context('../config', true, /\.(js|json|yml)$/));
    }

    load(namespace, context) {
        // handle reserved namespaces
        if (['server'].includes(namespace)) {
            throw new Error('Reserved namespace');
        }

        // prepare namespace
        if (typeof context === 'function') {
            context.keys().forEach((key) => {
                // require context
                const data = context(key) || {};

                // save to namespace
                namespaces[path.join(namespace, key)] = data.default || data;
            });
        } else {
            namespaces[namespace] = context;
        }

        // load and merge configs
        Object.keys(namespaces).forEach((key) => {
            // get config from namespace
            const config = namespaces[key];
            const namespace = path.dirname(key).replace(/[\\/]/g, '.');

            // merge configs
            this.storage = merge({}, this.storage, namespace && namespace !== '.' ? { [namespace]: config } : config);
        });
    }

    get(key) {
        if (!this.has(key)) {
            throw new Error(`Undefined config key: ${key}`);
        }
        return get(this.storage, key);
    }

    set(key, value) {
        set(this.storage, key, value);
    }

    has(key) {
        return has(this.storage, key);
    }
}

export default new Config();
