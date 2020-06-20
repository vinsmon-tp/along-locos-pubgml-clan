var modal1 = document.getElementById('id01');
var modal2 = document.getElementById('id02');
var modal3 = document.getElementById('id03');
var modal4 = document.getElementById('id04');
var modal5 = document.getElementById('id05');

window.onclick = function(event) {
    if (event.target == modal1 ||
        event.target == modal2 ||
        event.target == modal3 ||
        event.target == modal4 ||
        event.target == modal5) {
        modal1.style.display = "none";
        modal2.style.display = "none";
        modal3.style.display = "none";
        modal4.style.display = "none";
        modal5.style.display = "none";
    }
}


