/**
 * This function uses middleware over try/catch to handle errors from async function hooks (mongodb)
 * @param {function} fn
 * @returns
 */
module.exports = (fn) => (doc, next) => {
  fn(doc, next).catch(next);
};
