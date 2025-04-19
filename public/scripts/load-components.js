document.addEventListener('DOMContentLoaded', () => {    
    fetch("../components/header.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("header-container").innerHTML = data;
        });
    
    fetch("/components/hero.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("hero-container").innerHTML = data;
        });
    
    fetch("/components/footer.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("footer-container").innerHTML = data;
        });
});