const socket = io()
socket.on('profilepic', (url) => {
    const container = document.getElementById("container");
    container.innerHTML = ''
    var img = document.createElement("IMG");
    img.setAttribute("src", url);
    img.setAttribute("width", "30%");
    container.appendChild(img)
})

var rstBtn = document.querySelector('#pswrst');
rstBtn.disabled = true

function pressHandler(e) {    
    
    if ((this.value.length) <= 6) {
        rstBtn.disabled = true
    } else {
        rstBtn.disabled = false
    }
}
document.querySelector('#oldpwd').addEventListener("keyup",pressHandler);
document.querySelector('#nwpwd').addEventListener("keyup",pressHandler);