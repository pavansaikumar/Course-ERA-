//package sim;
//import java.util.Map.Entry;

//import org.apache.commons.math3.distribution.PoissonDistribution;

//import enums.BodyOrgan;

export class Kidney {
    
    constructor(myBody){
    	this.body = myBody;
        
        this,glutamineConsumed_ = 0;
        
        this.glucose = 0;
        this.fluidVolume_ = 1.5; //dl
        
        this.gluconeogenesisRate_ = 1.8*0.45038975;
        this.gngFromLactateRate_ = this.gluconeogenesisRate_; // by default
        
          
        this.Glut2VMAX_ = 5; // mg per kg per minute
        this.Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut1Rate_ = 1; // mg per kg per minute
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559; // mg per kg per minute
        this.glycolysisMax_ = 5*this.glycolysisMin_;
        
        this.reabsorptionThreshold_ = 11*180.1559/10; //mg/dl equivalent of 11 mmol/l
        this.glucoseExcretionRate_ = 100/(11*180.1559/10); // mg per minute per(mg/dl)
        // As BGL increases from 11 mmol/l to 22 mmol/l, glucose excretion in urine increases from 0 to mg/min to 100mg/min.
    }
    
    processTick() {
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        
        var glucoseExcretionRate__ = new PoissonDistribution(this.glucoseExcretionRate_);
        var glycolysisMin__ = new PoissonDistribution(x*this.glycolysisMin_);
        var gngRate__ = new PoissonDistribution(x*this.gluconeogenesisRate_);
        var gngFromLactateRate__ = new PoissonDistribution(x*this.gngFromLactateRate_);
        var Glut2VMAX__ = new PoissonDistribution(x*this.Glut2VMAX_);
        var basalAbsorption__ = new PoissonDistribution(x*this.Glut1Rate_);
        
        var bgl = this.body.blood.getBGL();
        var glInKidney = this.glucose/this.fluidVolume_;
        
        x = this.Glut2VMAX__.sample();
        var y = basalAbsorption__.sample();
        
        if( glInKidney < bgl ) {
            //BUKET NEW: In addition to increased glucose production, renal glucose uptake is increased in both the post-absorptive and postprandial
        	//states in patientswithT2DM[45,46]. So it depends on insulin resistance. (Gerich paper)
            
            var diff = bgl - glInKidney;
            var g = (1 + this.body.insulinResistance_)*x*diff/(diff + this.Glut2Km_);
            // uptake increases for higher insulin resistance.
            // may want to change this formula later - Mukul
            g += y; // basal absorption
            
            this.body.blood.removeGlucose(g);
            this.glucose += g;
            //System.out.println("Kidney removing " + g + " mg of glucose frm blood");
        }
        else
        {
            var diff = glInKidney - bgl;
            var g = (1 + this.body.insulinResistance_)*x*diff/(diff + this.Glut2Km_);
            
            if( g > this.glucose )
            {
                console.log("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1); ///=======================================================================
            }
            
            this.glucose -= g;
            this.body.blood.addGlucose(g);
            console.log("Kidney releasing " + g + " mg of glucose to blood");
        }
                
        var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
        
        x = this.glycolysisMin__.sample();
        if( x > this.glycolysisMax_*(this.body.bodyWeight_)) 
        	x = this.glycolysisMax_*(this.body.bodyWeight_);
        
        var toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( toGlycolysis > this.glucose)
            toGlycolysis = this.glucose;
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis;
       
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        x = this.gngRate__.sample();
        var gng = x *scale;
        this.glucose += this.body.blood.consumeGNGSubstrates(gng);
        console.log("GNG in Kidney " + gng);
        
        
        x =  gngFromLactateRate__.sample();
        this.glucose += this.body.blood.gngFromHighLactate(x);
        
        console.log("GNG from lactate " + x);
        
        if( this.body.blood.glutamine > this.glutamineConsumed_ ) {
            this.body.blood.glutamine -= this.glutamineConsumed_;
        } else {
            this.body.blood.glutamine = 0;
        }
        
        
        bgl = this.body.blood.getBGL();

        if( bgl > reabsorptionThreshold_ )
        {
            x = this.glucoseExcretionRate__.sample();
            var g = x*(bgl-reabsorptionThreshold_);
            this.body.blood.removeGlucose(g);
            console.log("glucose excretion in urine " + g);
        }
    
    }
    
    setParams() {
    	for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.KIDNEY.value).entries()) {
            switch (key) {
			    case "fluidVolume_" : { this.fluidVolume_ = value; break; }
    			case "Glut2VMAX_" : { this.Glut2VMAX_ = value; break; }
    			case "Glut2Km_" : { this.Glut2Km_ = value; break; }
    			case "Glut1Rate_" : { this.Glut1Rate_ = value; break; }
    			case "glycolysisMin_" : { this.glycolysisMin_ = value; break; }
    			case "glycolysisMax_" : { this.glycolysisMax_ = value; break; }
    			case "gluconeogenesisRate_" : { this.gluconeogenesisRate_ = value; break; }
    			case "glutamineConsumed_" : { this.glutamineConsumed_ = value; break; }
    		}
    	}
    }
}
