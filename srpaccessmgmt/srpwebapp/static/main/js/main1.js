function register_new_account(){
    var password = $("#inputPassword").val();
    var email = $("#inputEmail").val();
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var confPass = $("#confirmPassword").val();

    // check if any input fields empty (ignore ' 's)
    if (password.trim() == '' || email.trim() == '' || firstName.trim() == '' || lastName.trim() == '' || confPass.trim() == ''){
        alert("Please ensure that all fields are filled out before submitting.");
    }

    // make sure they entered same password in second field
    else if (password != $("#confirmPassword").val()){
        alert("Password confirmation does not match password");
    }

    //do some validation, make sure they use mycharleston email
    else if (!email.endsWith("cofc.edu")){
        alert("Please use your College of Charleston email address.")
    }

    else {
        var acctType;
        if (email.endsWith("g.cofc.edu")){
            acctType = "student";
        }
        else{ // must just be a xxx@cofc.edu address, so: faculty
            acctType = "faculty";
        }
        $.ajax(
            {
                type: "POST",

                data: {
                    btnType: 'register_new_account',
                    firstName: $("#firstName").val(),
                    lastName: $("#lastName").val(),
                    email: $("#inputEmail").val(),
                    password: $("#inputPassword").val(),
                    accountType: acctType,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (data) {
                    window.location = '/login'; // auto log in after register
                }
            });
    }
}