const fs = require('fs');

fetch('https://raw.githubusercontent.com/gusmangasmara/gs-ipaymu-node/main/src/index.js')
  .then(res => res.text())
  .then(text => {
    fs.writeFileSync('ipaymu_code.js', text);
  })
  .catch(console.error);
