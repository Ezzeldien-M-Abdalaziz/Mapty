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

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout{      
    type = 'running'; 
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
        this._setDescription();
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
        containerWorkouts.addEventListener('click',this._moveToPopup);
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

    _hideForm(){
        //Empty Inputs
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        //add hidden class
        form.style.display='none';    //using this one here with the settimeout() is all about to remove the animation that happens if we only relay one adding the hidden class ,, try hashing these two line and see the animation 
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'),1000);
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
            //console.log(workout);
        }

        //check if activity is cycling, create cycling object
        if(type === 'cycling'){
            const elevation = +inputElevation.value;

            if(!validInput(distance,duration,elevation)|| !allPositive(distance,duration)) alert("Input has to be Positive Numbers");

            workout = new Cycling([lat,lng],distance,duration,elevation);
            //console.log(workout);
        }


        //add new object to the workout array
        this.#workouts.push(workout);
        //console.log(this.#workouts);

        //render workout on map as marker
        this._renderWorkoutMarker(workout);

        //render workout on list
        this._renderWorkout(workout);


        //hide form + clear input fields
        this._hideForm();

        //display marker  
    }

    _renderWorkoutMarker(workout){
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`
        })
        ) 
        .setPopupContent(`${workout.type === 'running'? '🏃‍♂️' : '🚴 '} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout){
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running'? '🏃‍♂️' : '🚴 '}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
            </div>
        `;

        if(workout.type === 'running'){
        html+=`
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
            </li>
            `;
        }

        if(workout.type === 'cycling'){
        html+=`
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
            </li>
            `;
        }

        form.insertAdjacentHTML('afterend',html);
    }

    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout');   //closest() method in JavaScript is used to find the closest ancestor element that matches a specified CSS selector.

        if(!workoutEl) return;  //shield or guard condition

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);   //searchs in the array for the workout that has the same id as the one we clicked at
         
}

}

const app = new App();

        // let li = document.querySelector(`.workout--${workout.type}`);
        // li.addEventListener('click',function(e){
            
            
        // });