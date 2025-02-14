/**
 * This function uses middleware over try/catch to handle errors from async function controllers
 * @param {function} fn
 * @returns
 */
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
