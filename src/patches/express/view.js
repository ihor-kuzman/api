import View from 'express/lib/view';

import twig from '../../helpers/twig';

/**
 * Lookup view by the given `name`
 *
 * @override
 * @private
 * @param {string} base - Original lookup
 */
View.prototype.lookup = (base => function lookup(name) {
    return base.call(this, twig.parsePath(name));
})(View.prototype.lookup);
