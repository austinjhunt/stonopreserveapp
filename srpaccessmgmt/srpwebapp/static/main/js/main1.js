/* Function called on click of "Register" button on register.html template */
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
                    console.log(data);
                    if (data['result'] == 'register success'){
                        window.location = '/login'; // auto log in after register
                    }
                    else{
                        console.log(data['result']);
                        alert("Unable to register your account at this time. Please try again soon.");

                    }
                }
            });
    }
}

/* Function called on click of "Login" button on login.html template */
function login(){
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();
    if (email.trim() == '' || password.trim() == ''){
        alert("Please ensure that both fields are filled in before submitting.");
    }
    $.ajax(
            {
                type: "POST",

                data: {
                    btnType: 'login',
                    email: email,
                    password: password,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (data) {
                    if (data['result'] == 'auth success')
                        window.location = '/'; // log in.
                    else
                        alert("Could not authenticate. Please try a different email or password.");
                }
            });

}

function logout(){
    $.ajax(
            {
                type: "POST",
                data: {
                    btnType: 'logout',
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (data) {
                    if (data['result'] == 'logout success')
                        window.location = '/login'; // direct to log in page
                    else
                        alert("Could not log out.");
                }
            });
}



function send_pw_reset_email() {

    var email_address = $("#inputEmail").val();

    $.ajax(
        {
            type: "POST",
            data: {
                /*same backend functionality as before, just for one question rather than entire quiz*/
                btnType: 'password_reset_request',
                email_address: email_address,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                if (data['result'] == "it worked") {
                        $("#emailsent").fadeIn();
                    }
                else if (data['result'] == 'email DNE') {
                    $("#emailfailed").fadeIn();
                }
                setTimeout(function(){
                    window.location = '/login';
                },5000)

            }



        })
}
