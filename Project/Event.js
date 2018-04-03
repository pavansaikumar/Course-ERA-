// Need to complete the package of java script
// need to import the functions for calling them do not for get that

// check why this is used in eventType.js
import {EventType} from './EventType.js';
import {PriQ,PriQElt} from './PriQ.js';

var eventType;
export class Event extends PriQElt{
	

	constructor(fireTime, the_type){
		this.fireTime  = fireTime;
		eventType = the_type;
		cost0 = fireTime;
		cost1 = 0;
	}
}