// Generating slides
var arrCities = []; // Change number of slides in CSS also
var arrType = [];
var arrNames = [];
var numOfCities = 0;
var arrCitiesDivided = [];

const $cont = $('.cont');
const $slider = $('.slider');
const $nav = $('.nav');
const winW = $(window).width();
const animSpd = 750; // Change also in CSS
const distOfLetGo = winW * 0.2;
var curSlide = 1;
var animation = false;
var autoScrollVar = true;
var diff = 0;

$(document).ready(function() {

    $cont.hide();
    //$("#submit-spawn").hide();

    window.addEventListener('message', function(event) {
        var data = event.data;
        if (data.type === "ui") {
            if (data.status == true) {
                $(".cont").fadeIn(250);
            } else {
                $(".cont").fadeOut(250);
            }
        }

        if (data.action == "setupLocations") {
            setupLocations(data.locations, data.houses)
        }

        if (data.action == "setupAppartements") {
            setupApps(data.locations)
        }
    })

});


function generateSlide(city) {
    let frag1 = $(document.createDocumentFragment());
    let frag2 = $(document.createDocumentFragment());
    const numSlide = arrCities.indexOf(arrCities[city]) + 1;
    const firstLetter = arrCitiesDivided[city][0].charAt(0);

    const $slide =
        $(`<div data-target="${numSlide}" class="slide slide--${numSlide}">
            <div class="slide__darkbg slide--${numSlide}__darkbg"></div>
            <div class="slide__text-wrapper slide--${numSlide}__text-wrapper"></div>
          </div>`);

    const letter =
        $(`<div class="slide__letter slide--${numSlide}__letter">
            ${firstLetter}
          </div>`);

    for (let i = 0, length = arrCitiesDivided[city].length; i < length; i++) {
        const text =
            $(`<div class="slide__text slide__text--${i + 1}">
              ${arrCitiesDivided[city][i]}
            </div>`);
        frag1.append(text);
    }

    const navSlide = $(`<li data-target="${numSlide}" class="nav__slide nav__slide--${numSlide}"></li>`);
    frag2.append(navSlide);
    $nav.append(frag2);

    $slide.find(`.slide--${numSlide}__text-wrapper`).append(letter).append(frag1);
    $slider.append($slide);

    if (arrCities[city].length <= 4) {
        $('.slide--' + numSlide).find('.slide__text').css("font-size", "12vw");
    }
}

// Navigation
function bullets(dir) {
    $('.nav__slide--' + curSlide).removeClass('nav-active');
    $('.nav__slide--' + dir).addClass('nav-active');
}

function timeout() {
    animation = false;
}

function pagination(direction) {
    animation = true;
    diff = 0;
    $slider.addClass('animation');
    $slider.css({
        'transform': 'translate3d(-' + (curSlide - direction) * 100 + '%, 0, 0)'
    });


    $slider.find('.slide__darkbg').css({
        'transform': 'translate3d(' + (curSlide - direction) * 50 + '%, 0, 0)'
    });


    $slider.find('.slide__letter').css({
        'transform': 'translate3d(0, 0, 0)'
    });


    $slider.find('.slide__text').css({
        'transform': 'translate3d(0, 0, 0)'
    });

}

function navigateRight() {
    if (!autoScrollVar) return;
    if (curSlide >= numOfCities) return;
    pagination(0);
    setTimeout(timeout, animSpd);
    bullets(curSlide + 1);
    curSlide++;
}

function navigateLeft() {
    if (curSlide <= 1) return;
    pagination(2);
    setTimeout(timeout, animSpd);
    bullets(curSlide - 1);
    curSlide--;
}

function toDefault() {
    pagination(1);
    setTimeout(timeout, animSpd);
}

var currentLocation = null

$(document).on('click', '.nav__slide:not(.nav-active)', function() {
    let target = +$(this).attr('data-target');
    bullets(target);
    curSlide = target;
    pagination(1);

    if (arrType[curSlide] !== "lab") {
        $("#spawn-label").html("SPAWN - " + arrNames[curSlide - 1]);
        $("#submit-spawn").attr("data-location", arrCities[curSlide - 1]);
        $("#submit-spawn").attr("data-type", arrType[curSlide - 1]);
        $("#submit-spawn").fadeIn(100);
        $.post('https://qb-spawn/setCam', JSON.stringify({
            posname: arrCities[curSlide - 1],
            type: arrType[curSlide - 1],
        }));
        currentLocation = this;
    }
});

$(document).on('click', '#submit-spawn', function(evt) {
    evt.preventDefault(); //dont do default anchor stuff
    var location = $(this).data('location');
    var spawnType = $(this).data('type');
    //$(".cont").hide();

    $("div").remove(".slide__text");
    $("div").remove(".slide__letter");
    $("div").remove(".slide");
    $("li").remove(".nav__slide");

    if (spawnType !== "appartment") {
        $.post('https://qb-spawn/spawnplayer', JSON.stringify({
            spawnloc: location,
            typeLoc: spawnType
        }));
    } else {
        $.post('https://qb-spawn/chooseAppa', JSON.stringify({
            appType: location,
        }));
    }
});

function setupLocations(locations, myHouses) {

    arrCities = [];
    arrType = []
    arrNames = [];

    //var parent = $('.cont')
    //$cont.html("");


    setTimeout(function() {
        arrCities.push("current");
        arrType.push("current");
        arrNames.push("Last Location");
        //$(parent).append('<div class="location" id="location" data-location="current" data-type="current" data-label="Last Location"><p><span id="current-location">Last Location</span></p></div>');

        $.each(locations, function(index, location) {
            arrCities.push(location.location);
            arrType.push("normal");
            arrNames.push(location.label);
            //$(parent).append('<div class="location" id="location" data-location="'+location.location+'" data-type="normal" data-label="'+location.label+'"><p><span id="'+location.location+'">'+location.label+'</span></p></div>')
        });

        if (myHouses != undefined) {
            $.each(myHouses, function(index, house) {
                arrCities.push(house.house);
                arrType.push("house");
                arrNames.push(house.label);
                //$(parent).append('<div class="location" id="location" data-location="'+house.house+'" data-type="house" data-label="'+house.label+'"><p><span id="'+house.house+'">'+house.label+'</span></p></div>')
            });
        }

        $cont.append('<div class="submit-spawn" id="submit-spawn"><p><span id="spawn-label"></span></p></div>');
        //$('.submit-spawn').hide();

        numOfCities = arrCities.length;
        arrCitiesDivided = [];
        currLoc = arrCities[0];

        arrNames.map(city => {
            let length = city.length;
            let letters = Math.floor(length / 4);
            let exp = new RegExp(".{1," + letters + "}", "g");

            arrCitiesDivided.push(city.match(exp));
        });

        console.log(arrCitiesDivided);

        for (let i = 0, length = numOfCities; i < length; i++) {
            generateSlide(i);
        }

        $('.nav__slide--1').addClass('nav-active');

        if (arrType[curSlide - 1] !== "lab") {
            $("#spawn-label").html("SPAWN - " + arrNames[curSlide - 1]);
            $("#submit-spawn").attr("data-location", arrCities[curSlide - 1]);
            $("#submit-spawn").attr("data-type", arrType[curSlide - 1]);
            $("#submit-spawn").fadeIn(100);
            $.post('https://qb-spawn/setCam', JSON.stringify({
                posname: arrCities[curSlide - 1],
                type: arrType[curSlide - 1],
            }));
            currentLocation = this;
        }
    }, 100)
}

function setupApps(apps) {

    arrCities = [];
    arrType = []
    arrNames = [];

    $.each(apps, function(index, app) {
        //console.log(app.name + " " + app.label)
        arrCities.push(app.name);
        arrType.push("appartment");
        arrNames.push(app.label);
    });

    $cont.append('<div class="submit-spawn" id="submit-spawn"><p><span id="spawn-label"></span></p></div>');

    numOfCities = arrCities.length;
    arrCitiesDivided = [];
    currLoc = arrCities[0];

    arrNames.map(city => {
        let length = city.length;
        let letters = Math.floor(length / 4);
        let exp = new RegExp(".{1," + letters + "}", "g");

        arrCitiesDivided.push(city.match(exp));
    });

    //console.log(arrCitiesDivided);

    for (let i = 0, length = numOfCities; i < length; i++) {
        generateSlide(i);
    }

    $('.nav__slide--1').addClass('nav-active');

    if (arrType[curSlide - 1] !== "lab") {
        $("#spawn-label").html("SPAWN - " + arrNames[curSlide - 1]);
        $("#submit-spawn").attr("data-location", arrCities[curSlide - 1]);
        $("#submit-spawn").attr("data-type", "appartment");
        $("#submit-spawn").fadeIn(100);
        $.post('https://qb-spawn/setCam', JSON.stringify({
            posname: arrCities[curSlide - 1],
            type: "appartment",
        }));
    }
}