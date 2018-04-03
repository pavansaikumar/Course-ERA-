//package sim;
//import java.io.BufferedReader;
//import java.io.FileReader;
//import java.io.IOException;
//import java.util.Random;

//import enums.EventType;
//import events.*;
//import util.PriQ;

/* The global class implementing
 * the simulation controller.
 */


export function SimCtl {
	/*=============================================================================================
	public static final SimCtl sim = new SimCtl();
	public static final HumanBody body = new HumanBody();
	
	public static final int TICKS_PER_DAY = 24*60;
	public static final int TICKS_PER_HOUR = 60;
	
	public static long ticks = 0;
	
    public static Random myEngine() {
    	return new Random(System.currentTimeMillis());
    }
    ================================================================================================
    */
    
    var eventQ = new PriQ();
    
    function SimCtl() { ticks = 0; }
    
    function elapsed_days() { return ticks / TICKS_PER_DAY; }
    
    function elapsed_hours() {
    	var x = ticks % TICKS_PER_DAY;
    	return (x / TICKS_PER_HOUR);
    }
    
    function elapsed_minutes() {
    	var x = ticks % TICKS_PER_DAY;
    	return (x % TICKS_PER_HOUR);
    }
    /*=================================================================================================
    public static void time_stamp() {
    	console.log(sim.elapsed_days() + ":" + sim.elapsed_hours() + ":" + sim.elapsed_minutes() + " ");
    }==================================================================================================
    /*/
    
    function readEvents(filename) {
        var BufferedReader = new Java.type("java.io.BufferedReader");
        var br =  new BufferedReader;
    	br = null;


        var FileReader = new Java.type("java.io.FileReader");
        var fr =  new FileReader;
        fr = null;


        function addEvent(long fireTime, int type, long subtype, long howmuch) {
        switch (type) {
            case 0:
                FoodEvent e = new FoodEvent(fireTime, howmuch, subtype);
                eventQ.priq_add(e);
                break;
            case 1:
                ExerciseEvent f = new ExerciseEvent(fireTime, howmuch, subtype);
                eventQ.priq_add(f);
                break;
            case 2:
                HaltEvent g = new HaltEvent(fireTime);
                eventQ.priq_add(g);
                break;
            default:
                break;
        }
    }
//===================================== Need to revist this have some questions
    	try {
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		var line = null; // Need to see this class and take that in to acount
    		while ((line = br.readLine()) != null) {
    			String[] tok = line.split(" ")[0].split(":");	// double split!
    			var day = Integer.valueOf(tok[0]);
    			var hour = Integer.valueOf(tok[1]);
    			var minutes = Integer.valueOf(tok[2]);
    			var fireTime = day * TICKS_PER_DAY + hour * TICKS_PER_HOUR + minutes;
    			
    			var type = Integer.valueOf(tok[3]);
    			var subtype = Integer.valueOf(tok[4]);
    			var howmuch = Integer.valueOf(tok[5]);
    			
    			addEvent(fireTime,type,subtype,howmuch);
    		}
            //////////////////////////////////
    		
    	} catch (IOException e) {
    		System.out.println("Error opening file : " + filename);
    		e.printStackTrace();
    		System.exit(-1);
    	} finally {
    		try {
    			if (br != null) br.close();
    			if (fr != null) fr.close();
    		} catch (IOException ioe) { ioe.printStackTrace(); System.exit(-1); }
    	}
    }
    
//===============================================================================   
    
    function fire_event() {
    	var event_ = null;
    	try {
    		event_ = eventQ.priq_gethead();
    		if (event_.fireTime > ticks) return -1;//// Need to see this exceptions
    	} catch (ClassCastException|NullPointerException e) {
    		console.log("No event left");
    		System.exit(-1);
    	}
        
        var event_type = event_.eventType;
        
        switch(event_type) {
            case FOOD:
                body.processFoodEvent( ((FoodEvent)event_).foodID, ((FoodEvent)event_).quantity);
                break;
            case EXERCISE:
                body.processExerciseEvent(((ExerciseEvent)event_).exerciseID, ((ExerciseEvent)event_).duration);
                break;
            case HALT:
                System.exit(0);
            default:
                break;
        } // end switch case
       	
        event_ = eventQ.priq_rmhead();
        return 1;
    }
    
    function run_simulation() {
    	 // Always in this loop
        while(true) {
            // @SuppressWarnings("unused")
			var val;
            while( (val = fire_event()) == 1 );
            // At this point:
            // no more event to fire;
            body.processTick();
            ticks++;
            //System.out.println(elapsed_days() + ":" + elapsed_hours() + ":" + elapsed_minutes());
        }
    }
    
    //friend int main(int argc, char *argv[]);
}
