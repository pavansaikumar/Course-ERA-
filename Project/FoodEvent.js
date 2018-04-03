// Need to complete the package of java script
// need to import the functions for calling them do not for get that

import {EventType, F} from './EventType.js';

export class FoodEvent extends Event{
	
	constructor(fireTime, quantity, foodID){
	super(fireTime, F);
	this.quantity = quantity;
	this.foodID = foodID;
	}
}