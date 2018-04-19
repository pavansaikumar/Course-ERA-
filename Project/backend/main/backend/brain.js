
 class Brain {

    //void glucoseToLactate(int glucoseRateToLactate_);
    
    //Set default values
    constructor (myBody) {
        // 6 micromol per kg per minute = 6*180.1559/1000 mg per kg per minute = 1.08 mg per kg per minute
        this.glucoseOxidized_ = 1.08;
        this.glucoseToAlanine_ = 0;
        this.bAAToGlutamine_ = 0;
        this.body = myBody;
    }
    
    //Release lactate to blood
    /*void glucoseToLactate(int glucoseRateToLactate){
        glucoseRateToLactate_ = glucoseRateToLactate;
        Blood.glucose_ -= glucoseRateToLactate_;
        Blood.lactate_ += glucoseRateToLactate_;
    }*/

    function rocessTick() {
        this.body.blood.removeGlucose((this.glucoseOxidized_*(this.body.bodyWeight_))+this.glucoseToAlanine_);
        this.body.blood.alanine += this.glucoseToAlanine_;
        //totalGlucoseAbsorption += (glucoseOxidized_+glucoseToAlanine_);
        
        //console.log("glucoseOxidized: " + glucoseOxidized_);
        
        //Brain generate glutamine from branched amino acids.
        if( this.body.blood.branchedAminoAcids > this.bAAToGlutamine_ ) {
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += this.bAAToGlutamine_;
        } else {
            this.body.blood.glutamine += this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
        //console.log("Total Glucose Absorbed by Brain " + totalGlucoseAbsorption)
    }
    // To do after reading the topics of Maps
    
    function setParams() {
     
        for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BRAIN.value).entrySet()) {
            switch (e.getKey()) {
                case "glucoseOxidized_" : { glucoseOxidized_ = e.getValue(); break; }
                case "glucoseToAlanine_" : { glucoseToAlanine_ = e.getValue(); break; }
                case "bAAToGlutamine_" : { bAAToGlutamine_ = e.getValue(); break; }
            }
        }
        //System.out.println("glucoseOxidized: " + glucoseOxidized_);
    }
}
