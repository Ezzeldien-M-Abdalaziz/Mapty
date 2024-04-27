'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map , mapEvent;

if(navigator.geolocation)    //because there is some browsers doesn't support it;
navigator.geolocation.getCurrentPosition(
    function(position) {
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude,longitude];  //out coordinates
        //console.log(coords);

        // this code is from the documentation of the liberary to show the map
        map = L.map('map').setView(coords, 15);   //15 here is the num of zoom on the map  //'map' is an id with styling of the map
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {   //the theme of the map 
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //handling click on map
            map.on('click' , function(mapE){
                mapEvent = mapE;
                form.classList.remove('hidden');
                inputDistance.focus();

            });

            
        //end of code
    },
    function(){
        alert('ssxs');
    } 
);


//event listener for form
form.addEventListener("submit",function(e){
    e.preventDefault();
    
    //clear input fields
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        //display marker
    const {lat,lng} = mapEvent.latlng;
    L.marker({lat,lng}).addTo(map).bindPopup(L.popup({
        maxWidth:250,
        minWidth:100,
        autoClose:false,
        closeOnClick:false,
        className:'running-popup'
    })
    ) 
    .setPopupContent('WorkOut')
    .openPopup();
});

inputType.addEventListener('change',function(e){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

});