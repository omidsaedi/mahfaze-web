$(document).ready(function() {
  $('.needs-validation').submit(function(event) {
    if (event.target.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    event.target.classList.add('was-validated');
  });
});
