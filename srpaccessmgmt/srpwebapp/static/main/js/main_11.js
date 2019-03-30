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
     //new
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd='0'+dd;
    }
    if(mm<10) {
        mm='0'+mm;
    }
    today = dd+'/'+mm+'/'+yyyy;

    // date datepicker
    var $input = $( '.datepicker' ).pickadate({
        formatSubmit: 'mm/dd/yyyy',
        // min: [2015, 7, 14],
        container: '#datecontainer',
        // editable: true,
        closeOnSelect: true,
        closeOnClear: false,
    })
    var picker = $input.pickadate('picker');

    //start time picker
    var $input2 = $("#input_starttime").pickatime({
        container: '#starttimecontainer',
        // editable: true,
        closeOnSelect: true,
        closeOnClear: false,
    });
    var picker = $input2.pickatime('picker');

    //end time picker
    var $input3 = $("#input_endtime").pickatime({
        container: '#endtimecontainer',
        // editable: true,
        closeOnSelect: true,
        closeOnClear: false,
    });
    var picker = $input3.pickatime('picker');



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
        $("#welcomemsg").html('Welcome to the Stono River Preserve!<br/>Swipe between views or use' +
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
    /* Geolocation services with Google's API */
    // check for Geolocation support
    if (navigator.geolocation) {
      console.log('Geolocation is supported!');
    }
    else {
      console.log('Geolocation is not supported for this Browser/OS.');
    }
});


// window onload, happens after document ready
// Note: GEOLOCATION SERVICE DOES NOT WORK WITH INSECURE CONNECTION. NEED HTTPS.

window.onload = function() {
    // Use Google's Geolocation API. User consent to being tracked is assumed by their presence on a CofC Foundation
    // owned property, so for now, no real need for asking for consent to be tracked.
    // Future implementation idea: use a toggle button in the nav bar to turn GPS tracking on/off.

    // Instead of continuous tracking which would drain user battery, use a periodic "one-shot" method to obtain
    // user location at 15 minute intervals.
    var startPos;
    var geoSuccess = function(position) {
        startPos = position;
        document.getElementById('startLat').innerHTML = startPos.coords.latitude;
        document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        console.log(startPos.coords.latitude);
        console.log(startPos.coords.longitude);
    };


    // Unfortunately, not all location lookups are successful. Perhaps a GPS could not be located or
    // the user has suddenly disabled location lookups. In the event of an error, a second, optional
    // argument to getCurrentPosition() is called so that you can notify the user inside the callback:
    var geoError = function(error) {
        console.log('Error occurred. Error code: ' + error.code);

        // error.code can be:
        //   0: unknown error
        //   1: permission denied
        //   2: position unavailable (error response from location provider)
        //   3: timed out
     };

    // pass geoOptions to getCurrentPosition as 3rd argument.
    var geoOptions = {
        // 1: For many use cases, you don't need the user's most up-to-date location; you just need a rough estimate.
        // Use the maximumAge optional property to tell the browser to use a recently obtained geolocation result.
        maximumAge: 5 * 60 * 1000,

        // 2: Unless you set a timeout, your request for the current position might never return.
        timeout: 10 * 1000
    }

    navigator.geolocation.getCurrentPosition(geoSuccess,geoError,geoOptions);
};




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
                    {
                        //document.location.href = "/";
                         window.location = window.location.href.replace('login','').replace('//','');
                    }

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
                       location.reload();
                }
            });
}



function send_pw_reset_email() {

    var email_address = $("#inputEmail").val().trim();

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
    var visitdate = $("#input_visitdate").val();
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
                visit_date: visitdate,
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