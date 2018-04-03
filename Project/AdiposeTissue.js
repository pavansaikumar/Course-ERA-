// Import statements should be seen
// Import from the body event should be seen

export class AdiposeTissue{
	// Learn how to write the private variables


	constructor(myBody){
		this.body = myBody;
    	this.glucoseAbsorbed_ = 0;
        this.bAAToGlutamine_ = 0;
        this.lipolysisRate_ = 0;
        this.fat = (body.fatFraction_)*(body.bodyWeight_)*1000.0;
	}

	processTick(){
		if( this.body.blood.getBGL() < this.body.blood.normalGlucoseLevel_ ) {
            var lipolysis = this.body.insulinResistance_*this.lipolysisRate_;
            this.body.blood.gngSubstrates += this.lipolysis;
        } else {
            this.body.blood.gngSubstrates += this.lipolysisRate_;
        }
	
		if( this.body.blood.branchedAminoAcids > this.bAAToGlutamine_ ) {
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += this.bAAToGlutamine_;
        } else {
            this.body.blood.glutamine += this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
        
        //System.out.println("Total Glucose Absorbed by Adipose Tissue " + totalGlucoseAbsorption);
        //System.out.println("Glucose_Consumed_in_a_Minute_by_AdiposeTissue " + glucoseConsumedINaMinute);
        
        SimCtl.time_stamp();
        console.log(" BodyWeight: " + this.body.bodyWeight_);
	}

	setParams(){
		for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.ADIPOSE_TISSUE.value).entries()) {
    		switch (key) {
    			case "glucoseOxidized_" : { this.glucoseAbsorbed = value; break; }
    			case "glucoseToAlanine_" : { this.lipolysisRate_ = value; break; }
    			case "bAAToGlutamine_" : { this.bAAToGlutamine_ = value; break; }
    		}
    	}
	}

	 lipogenesis(glucoseInMG) {
    	// one gram of glucose has 4kcal of energy
        // one gram of TAG has 9 kcal of energy
        //System.out.println("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
        this.body.bodyWeight_ -=  this.fat/1000.0;
        this.fat += glucoseInMG*4.0/9000.0;
        this.body.bodyWeight_ += this.fat/1000.0;
        //System.out.println("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
    }

     consumeFat(kcal) {
    	this.body.bodyWeight_ -= this.fat/1000.0;
        this.fat -= this.kcal/9.0;
        this.body.bodyWeight_ += this.fat/1000.0;
    }

      addFat(newFatInMG) {
    	 this.body.bodyWeight_ -= this.fat/1000.0;
    	 this.fat += newFatInMG/1000.0;
    	 this.body.bodyWeight_ += this.fat/1000.0;
    	 //System.out.println("BodyWeight: addFat " + body.bodyWeight_ + " newfat " + newFatInMG);
    } 

}