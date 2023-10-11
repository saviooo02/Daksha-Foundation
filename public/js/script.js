let menuBar= document.querySelector('#menu-bar');
let navBar= document.querySelector('.nav-links');

window.onscroll= () =>{
    menuBar.classList.remove('fa-times');
    navBar.classList.remove('active');
};

menuBar.addEventListener('click', () =>{
    menuBar.classList.toggle('fa-bars');
    menuBar.classList.toggle('fa-times');
    navBar.classList.toggle('active');

});
// Function to animate the counts
function animateCounts() {
    var countElements = document.querySelectorAll('.count');
    countElements.forEach(function(element) {
      var targetCount = parseInt(element.innerHTML);
      var currentCount = 0;
      var increment = Math.ceil(targetCount / 50); // Adjust animation speed here
  
      var timer = setInterval(function() {
        currentCount += increment;
        if (currentCount >= targetCount) {
          clearInterval(timer);
          currentCount = targetCount;
        }
        element.innerHTML = currentCount;
      }, 20); // Adjust animation interval here
    });
  }
  
  // Call the function when the section is in the viewport
  var impactSection = document.getElementById('impact');
  var impactSectionOffset = impactSection.offsetTop - window.innerHeight;
  
  function checkViewport() {
    if (window.pageYOffset > impactSectionOffset) {
      animateCounts();
      window.removeEventListener('scroll', checkViewport);
    }
  }
  
  window.addEventListener('scroll', checkViewport);
  
