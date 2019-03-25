/* Function called on click of "Register" button on register.html template */

"use strict";
$(document).ready(function(){
    $("#my_preloader_container").fadeOut('slow');

    /* Show the HTML page only after the js and css are completely loaded */
    setTimeout(function(){
        $("body").css("visibility","visible");
    }, 1000);

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

    $(function () {
        $('#datetimepicker6').datetimepicker();
        $('#datetimepicker7').datetimepicker({
            useCurrent: false //Important! See issue #1075
        });
        $("#datetimepicker6").on("dp.change", function (e) {
            $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
        });
        $("#datetimepicker7").on("dp.change", function (e) {
            $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
        });
    });


     <!-- use js to set button contents to only icons, can't be done with css -->
    if ($(window).width() < 480) {
        $("#homebtn").html('<i class="fas fa-fw fa-home"></i>');
        $("#emergencybtnsidebar").html('<i class="fas fa-fw fa-ambulance"></i>');
        // welcome msg different for mobile
        $("#welcomemsg").html('Welcome to the Stono River Preserve, {{ first_name }}!<br/>Swipe between views or use' +
            ' the top left dropdown!');
    }
    else {
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
        $("#my_preloader_container").fadeIn('slow');
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
                    $("#my_preloader_container").fadeOut('slow');
                    if (data['result'] == 'email sent'){
                        //Comment out this portion with the backend's send_mail portion; server's smtp port blocked.
                        $("#emailsentmodal").modal('show'); // auto log in after register
                    }
                    else if (data['result'] == 'email taken'){
                        $("#emailsentmodalcontent").html('This email address is already in use for an existing' +
                            ' account.');
                        $("#emailsentmodal").modal('show');
                    }
                    else{
                        $("#emailsentmodalcontent").html('Unable to register your account at this time. Please try again soon.')
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
    var email = $("#inputEmail").val().trim();
    var password = $("#inputPassword").val().trim();
    if (email == '' || password == ''){
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
                    if (data['result'] == 'auth fail')
                        alert("Could not authenticate. Please try a different email or password.");
                    else
                        window.location = window.location.href.replace('login',''); 
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
                        // replace end with login , direct to login page
                        if (/stonoriverapp\/$/.test(window.location)){ // with slash at end
                            window.location = window.location.href.replace('stonoriverapp/','stonoriverapp/login'); // direct to log in page
                        }
                        else if (/stonoriverapp$/.test(window.location)){//no slash at end
                            window.location = window.location.href.replace('stonoriverapp','stonoriverapp/login');
                        }

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
                    window.location = 'login';
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


function schedulevisit(){
    var starttime = $("#input_starttime").val();
    var endtime = $("#input_endtime").val();
    $.ajax(
        {
            type: "POST",
            data: {
                /*same backend functionality as before, just for one question rather than entire quiz*/
                btnType: 'schedule_visit',
                start_time: starttime,
                end_time: endtime,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#schedulevisitresult").html("Your visit has been scheduled! Updating calendar...");
                setTimeout(function(){
                    window.location.reload();
                },3000);
            }
        });
}


/* edit lock code modal functions */
function showeditlockcodemodal(lockid,gate,lockcode){

    $("#editlockcodemodal").modal('show');
    var editcodetable = document.createElement('table');
    var header = document.createElement('thead');
    $(header).append('<th>Lock Code</th><th>Gate</th>');

    var editrow = document.createElement('tr');
    $(editrow).append('<td><input id="lockcodeinput_' + lockid + '" autofocus value="'+ lockcode + '"></td><td>' +
        '<input id="gatenuminput_' + lockid + '"  value="' + gate + '"></td>');

    $(editcodetable).append(header).append(editrow);
    $("#savelockcodeeditsbutton").on("click", function(){ savelockcodeedits(lockid); });
    $("#editlockcodecontent").html(editcodetable);

}
function savelockcodeedits(lockid){
    var newlockcode  = $("#lockcodeinput_" + lockid).val();
    var newgatenum = $("#gatenuminput_" + lockid).val();
    console.log("new stuff");
    console.log(newlockcode);
    console.log(newgatenum);
    $.ajax(
        {
            type: "POST",
            data: {
                /*same backend functionality as before, just for one question rather than entire quiz*/
                btnType: 'edit_lock_code',
                lock_id: lockid,
                new_lock_code: newlockcode,
                new_gate_num: newgatenum,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#editlockcodecontent").html("<h5>Lock code updating...</h5>")
                setTimeout(function(){
                    window.location.reload();
                },3000);
            }
        });


}



function showdeletelockcodemodal(lockid){
    $("#deletelockcodemodal").modal('show');
    $("#deletelockcodecontent").html("Are you sure you want to delete this lock code?");

    $("#deletelockcodebutton").on("click", function(){ deletelockcode(lockid); });
}

function deletelockcode(lockid){
    $.ajax(
        {
            type: "POST",
            data: {
                /*same backend functionality as before, just for one question rather than entire quiz*/
                btnType: 'delete_lock_code',
                lock_id: lockid,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#deletelockcodecontent").html("<h5>Deleting gate...</h5>")
                setTimeout(function(){
                    window.location.reload();
                },3000);
            }
        });
}

function savenewgate(){
    var newgatecode = $("#newgatecode").val();
    var newgatenum = $("#newgatenum").val();
    // need sanitization!
    if (newgatenum.trim() == '' || newgatenum.trim() == ''){
        alert("Please ensure neither field is empty.");
    }
    $.ajax(
        {
            type: "POST",
            data: {
                /*same backend functionality as before, just for one question rather than entire quiz*/
                btnType: 'create_new_gate',
                new_gate_num: newgatenum,
                new_gate_code: newgatecode,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#addnewgatemodalcontent").html("<h5>Creating gate...</h5>")
                setTimeout(function(){
                    window.location.reload();
                },3000);
            }
        });

}

function swapbtn(){
    var to; // use a single ajax request. if to == on, change status to on property. if off, change status to off
    // property.

    if($("#arrivebtn").html().includes("Arrived")){
        to = 'on';
    }
    else{
        to = 'off';
    }

    $.ajax(
        {
            type: "POST",
            data: {
                /*same backend functionality as before, just for one question rather than entire quiz*/
                btnType: 'change_user_status',
                to: to,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'success'){
                    if (to == 'on'){ //arrived on property
                        $("#arrivebtn").html($("#arrivebtn").html().replace("Arrived", "Leaving"));
                    }
                    else{ // leaving property.
                        $("#arrivebtn").html($("#arrivebtn").html().replace("Leaving", "Arrived"));
                    }
                    $("#arrivebtn").toggleClass('btn-info  btn-warning');
                    $("#arrivebtnicon").toggleClass('fa-check fa-sign-out-alt');
                }
                else{ // fail
                    alert("Could not change your status. Try again soon.")
                }
            }
        });

}


function swipingtoggle(){
    $('#swipinggifcontainer').toggle('slow');
    $("#swipinggificon").toggleClass('fa-eye fa-question')
}

function redirectToLoginAfterVerified(){
     // activate/MjQ/54u-6668beb36bb99077fb10/
    // if pattern includes activate/MjQ/54u-6668beb36bb99077fb10/
    if (window.location.href.indexOf('activate')>-1){
        // then get rid of the ?fbclid=.... part
        var regexp = /activate.*/gi
        window.location.href=window.location.href.replace(regexp,'login');
    }

}
function redirectToRegisterAfterFailedVerified(){
     // activate/MjQ/54u-6668beb36bb99077fb10/
    // if pattern includes activate/MjQ/54u-6668beb36bb99077fb10/
    if (window.location.href.indexOf('activate')>-1){
        // then get rid of the ?fbclid=.... part
        var regexp = /activate.*/gi
        window.location.href=window.location.href.replace(regexp,'register');
    }
}