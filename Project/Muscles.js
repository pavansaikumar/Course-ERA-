//package sim;

//import java.util.Map.Entry;

//import org.apache.commons.math3.distribution.PoissonDistribution;

// import enums.BodyOrgan;
// Need to import java libraries in to Js
// Need to see line 175


export class Muscles {

    constructor(myBody) {
    	this.body = myBody;
    	this.glycogenMax_ = 0.4*(this.body.bodyWeight_)*15000.0; //40% of body weight is muscles
        this.glycogen = this.glycogenMax_;
        this.glucose = 0;
        this.volume_ = 1;
        // Frayn Chapter 9
        
        this.bAAToGlutamine_ = 0;
        
        this.basalGlucoseAbsorbed_ = 0.344; //mg per kg body weight per minute 
        
        //See the explanation in processTick()
        this.glycolysisMin_ = 0.4; //mg per kg per minute
        // 2.22 micromol per kg per minute = 2.22*180.1559/1000 mg per kg per minute = 0.4 mg per per minute
        this.glycolysisMax_ = 9*this.glycolysisMin_; //mg per kg per minute
        
        this.Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
        this.Glut4VMAX_ = 20.0; //mg per kg per minute
        
        this.glucoseOxidationFraction_ = 0.5;
    }
    
    processTick() {
        
        var rand__  = new PoissonDistribution(100);
        var glycolysisMin__  = new PoissonDistribution(100.0*this.glycolysisMin_);
        var basalAbsorption__  = new PoissonDistribution(100.0*this.basalGlucoseAbsorbed_);
        var Glut4VMAX__  = new PoissonDistribution(100.0*this.Glut4VMAX_);
        
        var x; // to hold the random samples
        var totalAbsorption = 0;
        var toGlycolysis = 0;
        // Now do the real work

        if( this.body.isExercising() ) {
   
            x =  rand__.sample();
            var glucoseConsumed = 0.1*(this.x/100.0)*1000.0*(this.body.currEnergyExpenditure)/4.0; // in milligrams
            console.log("Muscle removing glucose from blood " + glucoseConsumed);
            this.body.blood.removeGlucose(glucoseConsumed);
            
            var glycogenShare;
            var fatShare;
            var intensity = this.body.exerciseTypes.get(body.currExercise).intensity_;
            if( intensity >= 6.0 ) {
                glycogenShare = 0.3; // for MET 6 and above, 30% of energy comes from glycogen 
                fatShare = 0.4;
            } else {
                    if( intensity < 3.0 ) {
                        glycogenShare = 0;
                        fatShare = 0.9;
                    } else {
                        glycogenShare = 0.3*(intensity - 3.0 )/3.0;
                        fatShare = 0.9 -0.5*(intensity - 3.0)/3.0;
                    }
            }
            x = rand__.sample();
            var glycogenConsumed = glycogenShare*(x/100.0)*1000.0*(this.body.currEnergyExpenditure)/4.0; // in milligrams
            var energyFromFat = fatShare*(x/100.0)*(this.body.currEnergyExpenditure); // in kcal
            
            this.glycogen -= glycogenConsumed;
            this.body.adiposeTissue.consumeFat(energyFromFat);
            
            var glycolysisShare;
            
            if( intensity < 18.0 ) {
                x = this.glycolysisMin__.sample();
                x = x*(this.body.bodyWeight_)/100.0;
                
                if( x > this.glycolysisMax_*(this.body.bodyWeight_))
                    x = this.glycolysisMax_*(this.body.bodyWeight_);
                
                this.glycolysisShare = x + ((intensity-1.0)/17.0)* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
            } else glycolysisShare = this.glycolysisMax_*(this.body.bodyWeight_);
            
            this.glycogen -= glycolysisShare;
            this.body.blood.lactate += glycolysisShare;
        } else {
            x =  basalAbsorption__.sample();
            x = x*(body.bodyWeight_)/100.0;
            
            this.body.blood.removeGlucose(x);
            
            this.glycogen += x;
            if(this.glycogen > this.glycogenMax_)
            {
                this.glucose += this.glycogen - this.glycogenMax_;
                this.glycogen = this.glycogenMax_;
            }
            
            totalAbsorption = x;
           
            var bgl = this.body.blood.getBGL();
            var glMuscles = this.glucose/volume_;
            var diff = bgl-glMuscles;
            
            var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
            
            var g;
            
            if( diff > 0 )
            {
                x = (Glut4VMAX__.sample());
                x = x*(this.body.bodyWeight_)/100.0;
                g = scale*x*diff/(diff + Glut4Km_);

                this.body.blood.removeGlucose(g);
                x = this.glycogen;
                this.glycogen += (1.0 - this.glucoseOxidationFraction_)*g;
                totalAbsorption += (1.0 - this.glucoseOxidationFraction_)*g;
                
                if(this.glycogen > this.glycogenMax_)
                {
                    this.glucose += this.glycogen - this.glycogenMax_;
                    this.glycogen = this.glycogenMax_;
                }
            }
            
        
            scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
            
            x = this.glycolysisMin__.sample();
            x = x*(this.body.bodyWeight_)/100.0;
            
            if( x > this.glycolysisMax_*(this.body.bodyWeight_))
                x = this.glycolysisMax_*(this.body.bodyWeight_);
            
            toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
            g = toGlycolysis;
            
            if( g <= this.glucose ) {
                this.glucose -= g;
		        this.body.blood.lactate += g;
            } else {
            	g -= this.glucose;
                this.body.blood.lactate += glucose;
                this.glucose = 0;
                
                if( this.glycogen >= g )
                {
                    this.glycogen -= g;
                    this.body.blood.lactate += g;
                }
                else
                {
                    this.body.blood.lactate += this.glycogen;
                    toGlycolysis = toGlycolysis -g + this.glycogen;
                    this.glycogen = 0;
                }
            }
            //System.out.println("After glycolysis, muscle glycogen " + glycogen + " mg, blood lactate "
            //+ body.blood.lactate + " mg, g " + g + " mg");
            
            // consume fat for 90% of the energy needs during resting state
            x = rand__.sample();
            var energyFromFat = 0.9*(x/100.0)*(this.body.currEnergyExpenditure); // in kcal
            this.body.adiposeTissue.consumeFat(energyFromFat);
        }
        
        if( this.glycogen < 0 ) {
            console.log("Glycogen went negative");
            System.exit(-1); /// NEED TO SEE This
        }
        
        //Muscles generate glutamine from branched amino acids.
        if( this.body.blood.branchedAminoAcids > this.bAAToGlutamine_ ) {
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += this.bAAToGlutamine_;
        } else {
            this.body.blood.glutamine += this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
        
    }
   
    setParams() {
    	for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.MUSCLES.value).entries()) {
    		switch (key) {
    			case "Glut4Km_" : { this.Glut4Km_ = key; break; }
    			case "Glut4VMAX_" : { this.Glut4VMAX_ = key; break; }
    			case "basalGlucoseAbsorbed_" : { this.basalGlucoseAbsorbed_ = key; break; }
    			case "glucoseOxidationFraction_" : { this.glucoseOxidationFraction_ = key; break; }
    			case "bAAToGlutamine_" : { this.bAAToGlutamine_ = key; break; }
    			case "glycolysisMin_" : { this.glycolysisMin_ = key; break; }
    			case "glycolysisMax_" : { this.glycolysisMax_ = key; break; }
    		}
    	}
    }
}
