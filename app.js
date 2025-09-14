// footer
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('main-footer').innerHTML = data;
  });

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
});


// button
const syncPointer = ({ x: pointerX, y: pointerY }) => {
  const x = pointerX.toFixed(2);
  const y = pointerY.toFixed(2);
  const xp = (pointerX / window.innerWidth).toFixed(2);
  const yp = (pointerY / window.innerHeight).toFixed(2);
  document.documentElement.style.setProperty('--x', x);
  document.documentElement.style.setProperty('--xp', xp);
  document.documentElement.style.setProperty('--y', y);
  document.documentElement.style.setProperty('--yp', yp);
};
document.body.addEventListener('pointermove', syncPointer);


// navbar
function initHamburgers() {
  document.querySelectorAll('.hamburger').forEach((hamburger) => {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('active');
      const navbarMenu = this.closest('.navbar').querySelector('.navbar-menu');
      navbarMenu.classList.toggle('active');
    });
  });
}

// Run again AFTER navbar is loaded
initHamburgers();

document.querySelectorAll(".nav-link").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});


//card
const cards = document.querySelectorAll(".card");
cards.forEach((card, index) => {
  if (index >= cards.length - 4) { // last 4 cards
    card.classList.add("coming-soon");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.innerText = "Coming Soon";
    card.appendChild(overlay);
  }
});
