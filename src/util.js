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
  
  let randomChoice = arr => {
    if (arr.length) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    return null;
  };

  return Object.freeze({
    makeGrid,
    randomChoice,
  });
})();
