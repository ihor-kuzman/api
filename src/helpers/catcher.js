/**
 * Catcher for "async" middleware
 *
 * @param {Function} middleware - Express middleware
 * @returns {Function} - Wrapped middleware
 */
function catcher(middleware) {
    return (req, res, next) => Promise.resolve(middleware(req, res, next)).catch(next);
}

// Export catcher
export default catcher;
