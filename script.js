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


//parent class
class Workout{   
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords , distance , duration){
        this.coords = coords;    // [lat,lng]
        this.distance = distance; //in Km
        this.duration = duration; //in Min
    }
}

class Running extends Workout{      
    type = 'running'; 
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace(){
        this.pace = this.duration / this.distance;
        return this.pace;    
    }
}

class Cycling extends Workout{
    type = 'cycling'; 
    constructor(coords,distance,duration,elevationGain){
        super(coords,distance,duration)
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed(){
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

const run1 = new Running([39,-12] , 5.2,24,178);
const cycling1 = new Cycling([39,-12] , 27,95,523);

console.log(run1);
console.log(cycling1);

////////////////////////////////////////////////////
//APLLICATION ARCHITECTURE
class App{
    #map;
    #mapEvent;
    #workouts = [];
    
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

        //get data from the form
        const type = inputType.value; 
        const distance = +inputDistance.value;    //"+" used here to convert the value to int since it retrives as string
        const duration = +inputDuration.value;
        const {lat,lng} = this.#mapEvent.latlng; 
        let workout;

        //valid input check function 
        const validInput = (...inputs) => 
        inputs.every(inp => Number.isFinite(inp));   // `every() method` returns false if not every input in the array meets the condition 
        
        //positive check function
        const allPositive = (...inputs) => 
        inputs.every(inp => inp > 0);

        //check if activity is running, create running object
        if(type === 'running'){
            const cadence = +inputCadence.value;
            //check if data is valid
            if(!validInput(distance,duration,cadence) || !allPositive(distance,duration,cadence)) alert("Input has to be Positive Numbers");

            workout = new Running([lat,lng],distance,duration,cadence);
            const li = document.createElement("li");
            li.innerHTML = `<h2 class="workout__title">Running on ${months[workout.date.getMonth()]} ${workout.date.getDay()}</h2>
            <div class="workout__details">
                <span class="workout__icon">🏃‍♂️</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.calcPace()}</span>
                <span class="workout__unit">spm</span>
            </div>`;

            li.classList.add('workout','workout--running');
            li.setAttribute('data-id',workout.id);
            containerWorkouts.appendChild(li);
            console.log(workout);
        }

        //check if activity is cycling, create cycling object
        if(type === 'cycling'){
            const elevation = +inputElevation.value;

            if(!validInput(distance,duration,elevation)|| !allPositive(distance,duration)) alert("Input has to be Positive Numbers");

            workout = new Cycling([lat,lng],distance,duration,elevation);

            const li = document.createElement("li");
            li.innerHTML = `<h2 class="workout__title">cycling on ${months[workout.date.getMonth()]} ${workout.date.getDay()}</h2>
            <div class="workout__details">
                <span class="workout__icon">🚴‍♀️</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div> <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.calcSpeed()}</span>
                <span class="workout__unit">m</span>
            </div>`;

            li.classList.add('workout','workout--cycling');
            li.setAttribute('data-id',workout.id);
            containerWorkouts.appendChild(li);
            console.log(workout);
        }


        //add new object to the workout array
            this.#workouts.push(workout);
            console.log(this.#workouts);

        //render workout on map as marker
        this.renderWorkoutMarker(workout);
        //render workout on list

        //hide form + clear input fields
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

        //display marker  
    }

    renderWorkoutMarker(workout){
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`
        })
        ) 
        .setPopupContent('workout')
        .openPopup();
    }
}



const app = new App();


// let id = (new Date() + '').slice(-10);
// console.log(id);