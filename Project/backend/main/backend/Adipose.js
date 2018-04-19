

 class AdiposeTissue {


    
    //Set Default Values
    constructor (myBody) {
       this.body = myBody;
       this.glucoseAbsorbed_ = 0;
       this.bAAToGlutamine_ = 0;
       this.lipolysisRate_ = 0;
       this.fat = (body.fatFraction_)*(body.bodyWeight_)*1000.0;
    }
    
   processTick() {
       
        
        if( this.body.blood.getBGL() < this.body.blood.normalGlucoseLevel_ ) {
            var lipolysis = this.body.insulinResistance_*lipolysisRate_;
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
        
        //console.log("Total Glucose Absorbed by Adipose Tissue " + totalGlucoseAbsorption);
        //console.log("Glucose_Consumed_in_a_Minute_by_AdiposeTissue " + glucoseConsumedINaMinute);
        
        SimCtl.time_stamp();
        console.log(" BodyWeight: " + body.bodyWeight_);
    }
    // To do on the Mps
    function setParams() {
        for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.ADIPOSE_TISSUE.value).entrySet()) {
            switch (e.getKey()) {
                case "glucoseAbsorbed_" : { glucoseAbsorbed_ = e.getValue(); break; }
                case "lipolysisRate_" : { lipolysisRate_ = e.getValue(); break; }
                case "bAAToGlutamine_" : { bAAToGlutamine_ = e.getValue(); break; }
            }
        }
    }
    
    lipogenesis(glucoseInMG) {
        
        //console.log("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
        this.body.bodyWeight_ -= this.fat/1000.0;
        this.fat += glucoseInMG*4.0/9000.0;
        this.body.bodyWeight_ += this.fat/1000.0;
        //console.log("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
    }
    
    
    consumeFat( kcal) {
        this.body.bodyWeight_ -= this.fat/1000.0;
        this.fat -= kcal/9.0;
        this.body.bodyWeight_ += fat/1000.0;
    }
    
    addFat(newFatInMG) {
         this.body.bodyWeight_ -= this.fat/1000.0;
         this.fat += newFatInMG/1000.0;
         this.body.bodyWeight_ += this.fat/1000.0;
    } 
}
