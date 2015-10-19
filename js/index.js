/**
 * Bootstrap
 */
document.addEventListener('DOMContentLoaded', function() {
  var api = new Api(
      "https://api.clubislive.nl/",
      "<JOUW API KEY>"
    ),
    formElement = document.forms[0];

  function formSubmit(e) {
    var vars = api.formValues(formElement);

    if (e) e.preventDefault();

    api.performer.register(vars, function(error, result) {
      var errorsElement = document.querySelector('#errors');

      errorsElement.style.display = 'none';

      if (result.Errors) {
        // We got errors.

        while (errorsElement.childNodes.length > 0) {
          errorsElement.removeChild( errorsElement.firstChild );
        }

        errorsElement.style.display = 'block';

        for (var inputName in result.Errors) {
          var inputErrors = result.Errors[inputName],
              inputElement = document.querySelector('input[name=' + inputName + ']');

          if (inputElement.className.indexOf('error') == -1) {
            inputElement.className = inputElement.className + " error";
          }

          for (var i in inputErrors) {
            var liError = document.createElement('li');

            liError.textContent = inputErrors[i].message;

            errorsElement.appendChild(liError);
          }
        }
      }
    });

    return false;
  }

  formElement.onsubmit = formSubmit;

  window.user_username.addEventListener('blur', function() {
    api.performer.checkUsername(window.user_username.value, function(error, result) {
      if (result.Errors && result.Errors.username) {
        alert("Deze gebruikersnaam is al in gebruik");
      }
    });
  });
});
