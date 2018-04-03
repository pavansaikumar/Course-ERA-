// Need to complete the package of java script
// need to import the functions for calling them do not for get that

import {EventType, E} from './EventType.js';

export class ExerciseEvent extends Event{
	
	constructor(fireTime, duration, exerciseID){
	super(fireTime, E);
	this.duration = duration;
	this.exerciseID = exerciseID;
	}
}