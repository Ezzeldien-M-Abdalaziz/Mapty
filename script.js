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

class App{
    #map;
    #mapEvent;
    constructor(){
        this._getPosition();   //we write it here to be excuted once we load the page because constructor is automatically runs as we call an object ,, we can still do the same by calling the method using the object but this's now ofcourse cleaner;
        form.addEventListener("submit",this._newWorkout.bind(this)); //in this eventhandler the "this keyword" is pointing to the "form" element as usuall but to make the "this keyword" points to the App class we need to use bind()
        inputType.addEventListener('change',this._toggleElevationField); //no bind() because this keyword isn't used here
    }

    _getPosition(){
        if(navigator.geolocation)    //because there is some browsers doesn't support it;
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
                alert('couldn\'t get your position');
            });
    }

    _loadMap(position){
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            const coords = [latitude,longitude];  //out coordinates
            // this code is from the documentation of the liberary to show the map
            this.#map = L.map('map').setView(coords, 15);   //15 here is the num of zoom on the map  //'map' is an id with styling of the map
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {   //the theme of the map 
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

            //handling click on map
                this.#map.on('click' , this._showForm.bind(this));
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e){
        e.preventDefault();
        //clear input fields
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        //display marker
        const {lat,lng} = this.#mapEvent.latlng;
        L.marker({lat,lng}).addTo(this.#map).bindPopup(L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:'running-popup'
        })
        ) 
        .setPopupContent('WorkOut')
        .openPopup();
    }
}



const app = new App();



