const socket = io()

function makeRows(rows, cols, data) {
  const container = document.getElementById("container");
  container.innerHTML = ''
  container.style.setProperty('--grid-rows', rows);
  container.style.setProperty('--grid-cols', cols);
  for (c = 0; c < (rows * cols); c++) {
      
    let profile = document.createElement("div");

    var img = document.createElement("IMG");
    img.setAttribute("src", data[c].url);
    img.setAttribute("width", "140px");
    img.setAttribute("height", "140px");
        
    var h1 = document.createElement("H1");
    var t = document.createTextNode(data[c].name);
    h1.appendChild(t);
    h1.className = "f1"
        
    var h2 = document.createElement("H1");
    var t = document.createTextNode("KD : "+data[c].kd);
    h2.appendChild(t);
    h2.className = "f1"
        
    var h3 = document.createElement("H1");
    var t = document.createTextNode(data[c].player_desc);
    h3.appendChild(t);
    h3.className = "f2"

    profile.appendChild(img)
    profile.appendChild(h1)
    profile.appendChild(h2)
    profile.appendChild(h3)

    profile.className = "card"

    container.appendChild(profile).className = "grid-item";
  };
};

socket.on('gridData', ({rows,columns, result}) => {
  makeRows(rows,columns, result);
})

function paginationResponder(id){
  var x = document.getElementsByClassName('active')
  for(i=0; i<x.length; ++i){
    x[i].classList.remove('active')
  }
  socket.emit('paginationRequest', id)
  document.getElementById(id.toString()).className = 'active'
}