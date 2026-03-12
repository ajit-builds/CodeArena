window.addEventListener('load',()=>{
    const loader=document.getElementById('loader');
    setTimeout(()=>{
        loader.classList.add('loader-hidden');
    },1500);
});
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 500){
        navbar.classList.add("show");
    } else {
        navbar.classList.remove("show");
    }

});


document.addEventListener("DOMContentLoaded", () => {

const container = document.querySelector(".programdiff-scrollbar");

container.innerHTML += container.innerHTML;

let scrollSpeed = 0.5;

function autoScroll(){

    container.scrollLeft += scrollSpeed;

    if(container.scrollLeft >= container.scrollWidth / 2){
        container.scrollLeft = 0;
    }

}

setInterval(autoScroll,10);

});