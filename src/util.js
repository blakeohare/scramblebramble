const Util = (() => {
  
  let makeGrid = (w, h) => {
    let output = [];
    let row = [];
    while (h --> 0) {
      row.push(null);
    }
    while (w --> 0) {
      output.push([...row]);
    }
    return output;
  };
  
  return Object.freeze({
    makeGrid,
  });
})();