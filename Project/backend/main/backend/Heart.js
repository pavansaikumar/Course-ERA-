
class Heart {
	
    constructor (mybody) {
    	this.body = mybody;
        this.lactateOxidized_ = 0;
        this.basalGlucoseAbsorbed_ = 14; //mg per minute
        
        this.Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
        this.Glut4VMAX_ = 0; //mg per kg per minute
    }
    
    
    processTick() {
        
        //double basalAbsorption = basalGlucoseAbsorbed_*(body.bodyWeight_);
        var basalAbsorption = this.basalGlucoseAbsorbed_;
        this.body.blood.removeGlucose(basalAbsorption);
        
        // Absorption via GLUT4
        
        var bgl = this.body.blood.getBGL();
        var scale = (1.0 -this.body.insulinResistance_)*(this.body.blood.insulin)*(this.body.bodyWeight_);
        var g = scale*this.Glut4VMAX_*bgl/(bgl + this.Glut4Km_);
        
        this.body.blood.removeGlucose(g);

        if( this.body.blood.lactate >= this.lactateOxidized_ ) {
            this.body.blood.lactate -= this.lactateOxidized_;
        } else {
            this.body.blood.lactate = 0;
        }
        
        //console.log("Total Glucose Absorbed by Heart " + totalGlucoseAbsorption);
    }
    // TO do after maps
    setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.HEART.value).entrySet()) {
    		switch (e.getKey()) {
    			case "lactateOxidized_" : { lactateOxidized_ = e.getValue(); break; }
    			case "basalGlucoseAbsorbed_" : { basalGlucoseAbsorbed_ = e.getValue(); break; }
    			case "Glut4Km_" : { Glut4Km_ = e.getValue(); break; }
    			case "Glut4VMAX_" : { Glut4VMAX_ = e.getValue(); break; }
    		}
    	}
    }
}
