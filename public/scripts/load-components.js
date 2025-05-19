import { initDrawer } from "/scripts/mobile-menu.js";
import { initUserMenuToggle } from "/scripts/dashboard.js";

document.addEventListener('DOMContentLoaded', () => {    
    fetch("/components/header.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("header-container").innerHTML = data;
            initDrawer();
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
    
    fetch("/components/topbar.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("topbar").innerHTML = data;
            initUserMenuToggle();
        });
    
    fetch("/components/sidebar.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("sidebar").innerHTML = data;
        });
});