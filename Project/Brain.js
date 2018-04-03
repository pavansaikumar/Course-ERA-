// Check the import statements
// Import statement from enums 


export class Brain{

	constructor(myBody){
		this.glucoseOxidized_ = 1.08;
        this.glucoseToAlanine_ = 0;
        this.bAAToGlutamine_ = 0;
        this.body = myBody;
	}



    processTick() {
        this.body.blood.removeGlucose((this.glucoseOxidized_ *(this.body.bodyWeight_))+this.glucoseToAlanine_);
        this.body.blood.alanine += this.glucoseToAlanine_;
        //totalGlucoseAbsorption += (glucoseOxidized_+glucoseToAlanine_)
        
        //Brain generate glutamine from branched amino acids.
        if( this.body.blood.branchedAminoAcids > this.bAAToGlutamine_ ) {
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += this.bAAToGlutamine_;
        } else {
            this.body.blood.glutamine += this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
    }

    setParams(){

    	for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BRAIN.value).entries()) {
    		switch (key) {
    			case "glucoseOxidized_" : { this.glucoseOxidized_ = value; break; }
    			case "glucoseToAlanine_" : { this.glucoseToAlanine_ = value; break; }
    			case "bAAToGlutamine_" : { this.bAAToGlutamine_ = value; break; }
    		}
    	}
    }
}