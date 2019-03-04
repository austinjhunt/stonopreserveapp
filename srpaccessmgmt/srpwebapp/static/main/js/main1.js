/* Function called on click of "Register" button on register.html template */

"use strict";
$(document).ready(function(){
    $("#my_preloader_container").fadeOut('slow');

    // activate the carousel on document.ready
    $('.owl-carousel').owlCarousel({
            loop: false,
            nav: true,
            items: 1,
            stagePadding: 7,
            margin: 7,
            mouseDrag: true,
            pagination: false,
            singleItem: true,
        });

    $("#dataTable").DataTable();
    $("#dataTable2").DataTable();

    if ($(window).width() > 480) {
        $('#calendar').fullCalendar({
            height: 650,
            selectable: true, /* allow user to select multiple time slots by clicking and dragging */
            // put your options and callbacks here
            dayClick: function (date, jsEvent, view) {
                $('#confirmEventModal').modal();
                $('#event_details').html(date.format());
            }
        });
        $('#calendar').fullCalendar('changeView', 'agendaDay');
    }

    /* use a more responsive date/time picker for mobile */
    else if ($(window).width() < 480) {
        $('#date_picker').dtpicker();
    }
});
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
        alert("Please use your College of Charleston email address.");
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
function schedule(){
    var x = $("#scheduleform");
    if (x.css('display') == "block"){
        x.fadeOut();
    }
    else{
        x.fadeIn();
    }


}



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



        });
}

function showdtpicker(){
    $("#date_picker").toggle();
}


/* Student and Faculty View order will be the same */
/* Announcements 0, Schedule a visit 1, photo gallery 2 */

/* Put superuser exclusive pages last to avoid order inconsistencies */
/* Announcements 0, Schedule a visit 1, photo gallery 2, View all users 3, All scheduled visits 4

/* functions to automate navigation between slides */
function showannouncementsview(){
    $('#myCarousel').trigger('to.owl.carousel', 0);
}
function showscheduleview(){
    $('#myCarousel').trigger('to.owl.carousel', 1);
}
function showphotosview(){
    $('#myCarousel').trigger('to.owl.carousel', 2);
}
function showlistview(){ // for superuser
    $('#myCarousel').trigger('to.owl.carousel', 3);
}

function showallusersview(){
    $('#myCarousel').trigger('to.owl.carousel', 4);
}