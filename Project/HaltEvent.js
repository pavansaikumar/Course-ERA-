// Need to complete the package of java script
// need to import the functions for calling them do not for get that

import {EventType, H} from './EventType.js';

export class HaltEvent extends Event{
	
	constructor(fireTime){
	super(fireTime, H);
	}
}