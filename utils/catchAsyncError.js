/**
 * This function uses middleware over try/catch to handle errors from async function
 * @param {*} fn 
 * @returns 
 */
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
