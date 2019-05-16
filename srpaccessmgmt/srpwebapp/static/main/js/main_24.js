/* Function called on click of "Register" button on register.html template */

"use strict";


// Global variables view (governs zoom/center, map (high-level container for all other layers),
// coordPairs (dict for maintaining locations of users {userid: [long,lat]..}), mapVectorLayer (a layer that
// contains the mapVectorSource), mapVectorSource (the lower level container for all of the position icons where
// position icons will need to be updated periodically); use mapVectorSource so that you can use getFeatureById()
var map, view, coordPairs, mapVectorLayer, mapVectorSource, updatelocations;

$(document).ready(function () {
    /* when a user is on the property, their button at the top says "Leaving".
    If they reload the page, and they have not "left", we don't want the button status to
    go back to the default "Arrived." so send a quick request to check if their location is listed
    as active in database. if so, toggle button status to "leaving" state. use ajax, don't reload page.
     */
    $.ajax(
    {
        type: "GET",
        data: {
            btnType: 'check_user_status_init',
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        },
        success: function (data) {
            if (data['status'] == 'on'){
                //toggle button to the orange leaving state
                $("#arrivebtn").html($("#arrivebtn").html().replace("Arrived", "Leaving"));
                $("#arrivebtn").toggleClass('btn-info  btn-warning');
                $("#arrivebtnicon").toggleClass('fa-check fa-sign-out-alt');
            }
            $("#my_preloader_container").fadeOut('slow');
        }
    });

    /* Show the HTML page only after the js and css are completely loaded */
    setTimeout(function () {
        $("body").css("visibility", "visible");
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
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '/' + mm + '/' + yyyy;

    // date datepicker
    var $input = $('.datepicker').pickadate({
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

    // Create a live map. Initialize user locations to empty list.
    function init() {
        /* Live Map */
        view = new ol.View({
            center: [0, 0],
            zoom: 16
        });
        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
            ],
            view: view
        });
        coordPairs = [];
        /* create a static vector layer that will contain all of the "position" features */
        mapVectorLayer = new ol.layer.Vector({
            map: map,
        });
        // if mobile, change size of map so it doesn't extend beyond screen, which is the default.
        if ($(window).width() < 480) {
            map.updateSize()
        }

    }
    // call the init() function on page load.
    init();

    // globally defined function updatelocations; this will load the active user's locations from the database
    // (stored as lat/long coordinates) into the dynamic map.
    updatelocations = function (map) {

        // get the long/lat of all active users from backend
        $.ajax({
            type: "GET",
            data: {
                btnType: 'get_user_locations',
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                console.log("Loading new locations");
                // Update global locations dictionary with updated locations.
                var coordPairs = data['locations'];
                console.log(coordPairs);
                var posFeatures = [];
                // if there are no active users (no locations to show in map), then only show "no users on site" header.
                if (Object.keys(coordPairs).length == 0) {
                    $("#map").fadeOut();
                    $("#users_on_site_table").empty();
                    $("#users_on_site_table_container").fadeOut();
                    $("#nousersonsiteheader").fadeIn();
                }
                // otherwise, load into the dynamic map the lat/long coordinate pairs. also present below the map a
                //table with active users such that a user can be clicked to recenter map onto their location.
                else {
                    $("#users_on_site_table_container").fadeIn();
                    $("#map").fadeIn();
                    $("#nousersonsiteheader").fadeOut();
                    /* for each pair of coordinates retrieved from backend */
                    for (var userID in coordPairs) {
                        var coordinates = ol.proj.fromLonLat(coordPairs[userID]); // [long,lat]
                        /* Create a position feature for each location */
                        var positionFeature = new ol.Feature();
                        // for the id of the location marker, use the id of the user
                        positionFeature.setId(userID);
                        positionFeature.setStyle(new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 6,
                                fill: new ol.style.Fill({
                                    color: '#3399CC'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: '#fff',
                                    width: 2
                                })
                            }),
                        }));

                        /* set position feature's location using coordinates if they exist; else set position to null */
                        positionFeature.setGeometry(coordinates != null ? new ol.geom.Point(coordinates) : null);
                        /* add this position feature to the posFeatures list */
                        posFeatures.push(positionFeature);
                    }
                    // Update the vector layer defined globally with these new positions.
                    mapVectorSource = new ol.source.Vector({
                        features: posFeatures
                    });
                    mapVectorLayer.setSource(
                        mapVectorSource
                    );


                    // now update the table with active users
                    var users_on_site = data['users_on_site'];
                    $("#users_on_site_table").empty();
                    for (var i = 0; i < users_on_site.length; i++) {
                        var user = JSON.parse(users_on_site[i]);
                        // add a new row
                        $("#users_on_site_table").append("" +
                            "<tr><td>" + user.first_name + " " + user.last_name + "</td>" +
                            "<td><button class='btn btn-lg btn-info' onclick='locateUser(" + user.id + ");'>Find" +
                            " User</button></td></tr>");
                    }
                }
            },
        });
    };

    // initialize map by centering it on stono property.
     center_map_on_stono();

    // make initial call manually on document ready. after this, the setInterval function will call it every minute.
    // this function writethenreadlocations will 1) write this current user's location to the DB, then 2)
    // load all active locations in DB into the dynamic map
    writethenreadlocations(function(){
        updatelocations(map);
    });
});


// function for locating user; click "find user" to recenter map onto their location
function locateUser(userid) {
    // set since each position feature has the id of some user in that table, set the center of the view to the
    // coordinates of the appropriate position feature
    var posFeatureToLocate = mapVectorSource.getFeatureById(userid);
    var coordsToCenter = posFeatureToLocate.getGeometry().getCoordinates();
    map.getView().setCenter(coordsToCenter);
}

// Use Google's Geolocation API. User consent to being tracked is assumed by their presence on a CofC Foundation
// owned property, so for now, no real need for asking for consent to be tracked.
// Future implementation idea: use a toggle button in the nav bar to turn GPS tracking on/off.

// Instead of continuous tracking which would drain user battery, use a periodic "one-shot" method to obtain
// user location at 1 min intervals.
//Note: geoSuccess,geoError and geoOptions will be used for WRITING CURRENT USER'S UPDATED LOCATION TO DATABASE.
// Always write this prior to loading locations into the dynamic map to ensure map is most updated version of locations.
//var startPos;
var geoSuccess = function (position) {
    //console.log("Writing new location... Lat = " + position.coords.latitude + ', Long = ' +
    // position.coords.longitude);
    // pass these values to backend with ajax, update lat/long in the User_On_Property table
    $.ajax(
        {
            type: "POST",
            data: {
                btnType: 'update_location',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
               // don't do anything, want this to be a background process
            }
        });
};

// don't recenter every minute, just center it on the stono property when the page initially loads
function center_map_on_stono(){
    var propertylocation = [-80.176227, 32.738898];
    // center the view on one of the users (logically, the last one in the previous loop)
    var centerloc = ol.proj.fromLonLat(propertylocation);
    map.getView().setCenter(centerloc);


}

// Unfortunately, not all location lookups are successful. Perhaps a GPS could not be located or
// the user has suddenly disabled location lookups. In the event of an error, a second, optional
// argument to getCurrentPosition() is called so that you can notify the user inside the callback:
var geoError = function (error) {
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
    maximumAge: 0,
    // 2: Unless you set a timeout, your request for the current position might never return.
    timeout: 10 * 1000
};

// Function to write the user's new location and then read the new locations from the database to update the
// dynamic map. Use a callback function to ensure the read happens after the write.
function writethenreadlocations(callback){
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions); // update current user's location.
    callback(); // load all locations into dynamic map.
}

// the initial writethenreadlocations call is made on document.ready. after that initial call, this setInterval
// takes over.
setInterval(function () {
    writethenreadlocations(function(){
        updatelocations(map);
    });
}, 60000);



function register_new_account() {
    var password = $("#inputPassword").val();
    var email = $("#inputEmail").val();
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var confPass = $("#confirmPassword").val();

    // check if any input fields empty (ignore ' 's)
    if (password.trim() == '' || email.trim() == '' || firstName.trim() == '' || lastName.trim() == '' || confPass.trim() == '') {
        alert("Please ensure that all fields are filled out before submitting.");
    }

    // make sure they entered same password in second field
    else if (password != $("#confirmPassword").val()) {
        alert("Password confirmation does not match password");
    }

    //do some validation, make sure they use mycharleston email
    else if (!email.endsWith("cofc.edu")) {
        alert("Please use your College of Charleston email address.");
    }

    else {
        var acctType;
        if (email.endsWith("g.cofc.edu")) {
            acctType = "student";
        }
        else { // must just be a xxx@cofc.edu address, so: faculty
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
                    if (data['result'] == 'email sent') {
                        //Comment out this portion with the backend's send_mail portion; server's smtp port blocked.
                        $("#emailsentmodal").modal('show'); // auto log in after register
                    }
                    else if (data['result'] == 'email taken') {
                        $("#emailsentmodalcontent").html('This email address is already in use for an existing' +
                            ' account.');
                        $("#emailsentmodal").modal('show');
                    }
                    else {
                        $("#emailsentmodalcontent").html('Unable to register your account at this time. Please try again soon.')
                    }
                }
            });
    }
}

/* Function called on click of "Login" button on login.html template */
function schedule() {
    var x = $("#scheduleform");
    if (x.css('display') == "block") {
        x.fadeOut();
    }
    else {
        x.fadeIn();
    }


}


function login() {
    var email = $("#inputEmail").val().trim();
    var password = $("#inputPassword").val().trim();
    if (email == '' || password == '') {
        alert("Please ensure that both fields are filled in before submitting.");
    }
    $("#my_preloader_container").fadeIn('slow');
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
                else {
                    location.reload();
                }

            }
        });

}

function logout() {
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
                setTimeout(function () {
                    window.location = 'login';
                }, 5000)

            }


        });
}

function showdtpicker() {
    $("#date_picker").toggle();
}


/* Student and Faculty View order will be the same */
/* Announcements 0, Schedule a visit 1, photo gallery 2 */

/* Put superuser exclusive pages last to avoid order inconsistencies */

/* Announcements 0, Schedule a visit 1, photo gallery 2, View all users 3, All scheduled visits 4

/* functions to automate navigation between slides */
function showannouncementsview() {
    $('#myCarousel').trigger('to.owl.carousel', 0);
}

function showscheduleview() {
    $('#myCarousel').trigger('to.owl.carousel', 1);
}

function showphotosview() {
    $('#myCarousel').trigger('to.owl.carousel', 2);
}

function showlistview() { // for superuser
    $('#myCarousel').trigger('to.owl.carousel', 3);
}

function showallusersview() {
    $('#myCarousel').trigger('to.owl.carousel', 4);
}

function showlivemapview() {
    $("#myCarousel").trigger('to.owl.carousel', 5);
}


function schedulevisit() {
    var visitdate = $("#input_visitdate").val();
    var starttime = $("#input_starttime").val();
    var endtime = $("#input_endtime").val();
    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'schedule_visit',
                start_time: starttime,
                end_time: endtime,
                visit_date: visitdate,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#schedulevisitresult").html("Your visit has been scheduled! Updating calendar...");
                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            }
        });
}


/* edit lock code modal functions */
function showeditlockcodemodal(lockid, gate, lockcode) {

    $("#editlockcodemodal").modal('show');
    var editcodetable = document.createElement('table');
    var header = document.createElement('thead');
    $(header).append('<th>Lock Code</th><th>Gate</th>');

    var editrow = document.createElement('tr');
    $(editrow).append('<td><input id="lockcodeinput_' + lockid + '" autofocus value="' + lockcode + '"></td><td>' +
        '<input id="gatenuminput_' + lockid + '"  value="' + gate + '"></td>');

    $(editcodetable).append(header).append(editrow);
    $("#savelockcodeeditsbutton").on("click", function () {
        savelockcodeedits(lockid);
    });
    $("#editlockcodecontent").html(editcodetable);

}

function savelockcodeedits(lockid) {
    var newlockcode = $("#lockcodeinput_" + lockid).val();
    var newgatenum = $("#gatenuminput_" + lockid).val();
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'edit_lock_code',
                lock_id: lockid,
                new_lock_code: newlockcode,
                new_gate_num: newgatenum,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#editlockcodecontent").html("<h5>Lock code updating...</h5>")
                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            }
        });


}

function showdeletelockcodemodal(lockid) {
    $("#deletelockcodemodal").modal('show');
    $("#deletelockcodecontent").html("Are you sure you want to delete this lock code?");

    $("#deletelockcodebutton").on("click", function () {
        deletelockcode(lockid);
    });
}

function deletelockcode(lockid) {
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'delete_lock_code',
                lock_id: lockid,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#deletelockcodecontent").html("<h5>Deleting gate...</h5>")
                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            }
        });
}

function savenewgate() {
    $("#my_preloader_container").fadeIn();
    var newgatecode = $("#newgatecode").val();
    var newgatenum = $("#newgatenum").val();
    // need sanitization!
    if (newgatenum.trim() == '' || newgatenum.trim() == '') {
        alert("Please ensure neither field is empty.");
    }
    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'create_new_gate',
                new_gate_num: newgatenum,
                new_gate_code: newgatecode,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {

                $("#addnewgatemodalcontent").html("<h5>Creating gate...</h5>")
                setTimeout(function () {
                    window.location.reload();
                }, 3000);
            }
        });

}

function toggleuserstatus() {
    var to; // use a single ajax request. if to == on, change status to on property. if off, change status to off
    // property.
    if ($("#arrivebtn").html().includes("Arrived")) {
        to = 'on';
    }
    else {
        to = 'off';
    }

    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'change_user_status',
                to: to,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'success') {
                    // pass in updatelocations(map) as the callback function to the success function defined
                    // below to execute it only after updating the database.
                    toggleuserstatus_success(to, function () {
                        updatelocations(map);
                    });
                }
                else { // fail
                    alert("Could not change your status. Try again soon.")
                }
            }
        });
}

// use a callback function. prevent updatelocations(map) from executing BEFORE the user status has changed in the
// database.
function toggleuserstatus_success(to, callback) {
    // Do stuff before callback.
    if (to == 'on') { //arrived on property
        $("#arrivebtn").html($("#arrivebtn").html().replace("Arrived", "Leaving"));
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions); // update current user's location.
    }
    else { // leaving property.
        $("#arrivebtn").html($("#arrivebtn").html().replace("Leaving", "Arrived"));
    }
    $("#arrivebtn").toggleClass('btn-info  btn-warning');
    $("#arrivebtnicon").toggleClass('fa-check fa-sign-out-alt');

    // Execute callback. (load all active locations into dynamic map)
    callback();
}

function swipingtoggle() {
    $('#swipinggifcontainer').toggle('slow');
    $("#swipinggificon").toggleClass('fa-eye fa-question')
}

function redirectToLoginAfterVerified() {
    // activate/MjQ/54u-6668beb36bb99077fb10/
    // if pattern includes activate/MjQ/54u-6668beb36bb99077fb10/
    if (window.location.href.indexOf('activate') > -1) {
        // then get rid of the ?fbclid=.... part
        var regexp = /activate.*/gi
        window.location.href = window.location.href.replace(regexp, 'login');
    }
}

function redirectToRegisterAfterFailedVerified() {
    // activate/MjQ/54u-6668beb36bb99077fb10/
    // if pattern includes activate/MjQ/54u-6668beb36bb99077fb10/
    if (window.location.href.indexOf('activate') > -1) {
        // then get rid of the ?fbclid=.... part
        var regexp = /activate.*/gi
        window.location.href = window.location.href.replace(regexp, 'register');
    }
}

function nav_home() {
    showannouncementsview();
}

function triggerslideshow() {
    $(".sscontainer").toggle();
    $(".tz-gallery").toggle();

    var slideIndex = 1;
    showSlides(slideIndex);

    // Next/previous controls
    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    // Thumbnail image controls
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides(n) {
        var i;
        var slides = document.getElementsByClassName("ssmySlides");
        var dots = document.getElementsByClassName("ssdemo");
        var captionText = document.getElementById("sscaption");
        if (n > slides.length) {
            slideIndex = 1
        }
        if (n < 1) {
            slideIndex = slides.length
        }
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
        captionText.innerHTML = dots[slideIndex - 1].alt;
    }
}

function deleteuser(userid) {
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'delete_user',
                userid: userid,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'cantdeleteself') {
                    $("#cantdeleteself").modal('show');
                    setTimeout(function () {
                        $("#cantdeleteself").modal('hide');
                    }, 2500)
                }
                else { // fail
                    location.reload();
                }
            }
        });
}

function add_announcement() {
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {

                btnType: 'add_announcement',
                announcement_body: $("#announcement_body").val(),
                announcement_title: $("#announcement_title").val(),
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'success') {
                    location.reload();
                }
                else { // fail
                    $("#my_preloader_container").fadeOut();
                    alert("Failed to create announcement. Please try again later.")
                }
            }
        });
}

function delete_announcement(a_id) {
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {
                btnType: 'delete_announcement',
                a_id: a_id,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'success') {
                    location.reload();
                }
                else { // fail
                    $("#my_preloader_container").fadeOut();
                    alert("Failed to delete announcement. Please try again later.")
                }
            }
        });
}

function delete_photo(imgpath, imgid) {
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {
                btnType: 'delete_photo',
                imgpath: imgpath,
                imgid: imgid,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'success') {
                    location.reload();
                }
                else { // fail
                    $("#my_preloader_container").fadeOut();
                    alert("Failed to delete photo. Please try again later.")
                }
            }
        });
}

function show_img_preview_modal(imgpath, uploadername, upload_datetime, caption) {
    $("#photo_preview_container").html('<button id="photopreviewexitbtn"' +
        ' onclick="$(\'#photopreviewmodal\').modal(\'hide\');" class="btn btn-primary btn-danger"><i' +
        ' class="fa fa-window-close"></i></button><img class="previewphoto" ' +
        'src="' + imgpath + '">' +
        '<div class="photopreviewtext">Uploaded by ' + uploadername + ' on ' + upload_datetime + '<hr' +
        ' style="border:1px solid white; margin:5px auto;"/><br/>' + caption + '</div>');
    $("#photopreviewmodal").modal('show');

}

function delete_visit(visit_id){
    $("#my_preloader_container").fadeIn();
    $.ajax(
        {
            type: "POST",
            data: {
                btnType: 'delete_visit',
                visit_id: visit_id,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            },
            success: function (data) {
                // ajax complete, change button.
                if (data['result'] == 'success') {
                    location.reload();
                }
                else { // fail
                    $("#my_preloader_container").fadeOut();
                    alert("Failed to delete visit. Please try again later.")
                }
            }
        });
}

