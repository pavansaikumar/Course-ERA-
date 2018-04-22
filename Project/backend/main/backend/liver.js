 class Liver {
    
    //Set Default Values
    constructor (body_) {
       this.body = body_;
       this.glycogen = 100000.0; // equivalent of 100g of glucose
       this.glycogenMax_ = 120000.0; // 120 g of glucose
        
     
        
        // 5 micromol per kg per minute = 5*180.1559/1000 mg per kg per minute = 0.9007795 mg per kg per minute 
        // (ref: Gerich paper)
        this.glycogenToGlucose_ = 2*0.9007795;
        this.glucoseToGlycogen_ = glycogenToGlucose_; // for now

        //Gerich paper: Liver consumes 1.65 micromol per kg per minute to 16.5 micromol per kg per minute of 
        //glucose depending upon post-absorptive/post-prandial state.
        this.glycolysisMin_ = 0.297; //mg per kg per minute
        this.glycolysisMax_ = 2.972;
        
        this.glycolysisToLactateFraction_ = 1; // by default glycolysis just generates all lactate
        
        // 2.5 micromol per kg per minute = 2.5*180.1559/1000 mg per kg per minute = 0.45038975 mg per kg per minute
        this.gluconeogenesisRate_ = 1.8*0.45038975;
        this.gngFromLactateRate_ = gluconeogenesisRate_; //by default
        
        this.glucoseToNEFA_ = 0;
        
        this.normalGlucoseLevel_ = 100; //mg/dl
        this.fluidVolume_ = 10; //dl
        this.glucose = normalGlucoseLevel_*fluidVolume_;
        this.Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut2VMAX_ = 50; //mg per kg per minute
    }
    
    //Call private methods
     processTick() {
        // every thing is stochastic
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        
        PoissonDistribution glycogenToGlucose__ = new PoissonDistribution(x*glycogenToGlucose_);
        PoissonDistribution glucoseToGlycogen__ = new PoissonDistribution(x*glucoseToGlycogen_);
        PoissonDistribution glycolysisMin__ = new PoissonDistribution(x*glycolysisMin_);
        PoissonDistribution gngRate__ = new PoissonDistribution(x*gluconeogenesisRate_);
        PoissonDistribution gngFromLactateRate__ = new PoissonDistribution(x*gngFromLactateRate_);
        PoissonDistribution Glut2VMAX__ = new PoissonDistribution(x*Glut2VMAX_);
        
        // Now do the real work
        
        var glInPortalVein = this.body.portalVein.getConcentration();
        var glInLiver = this.glucose/this.fluidVolume_;
        
        if( glInLiver < glInPortalVein ) {
            var diff = glInPortalVein - glInLiver;
            x =  Glut2VMAX__.sample();
            var g = x * diff/(diff + this.Glut2Km_);
            
            if( g > this.body.portalVein.getGlucose() ) {
                //console.log("Trying to absorb more glucose from portal vein than what is present there! " + g + " " + body.portalVein.getGlucose());
                g = this.body.portalVein.getGlucose();
            }
            
            this.body.portalVein.removeGlucose(g);
            this.glucose += g;
            System.out.println("Liver absorbs from portal vein " + g);
        }
        //release all portalVein glucose to blood
        this.body.portalVein.releaseAllGlucose();

        // glycogen synthesis (depends on insulin and glucose level)
        
        glInLiver = this.glucose/this.fluidVolume_;
        var scale = glInLiver/this.normalGlucoseLevel_;
        //scale *= (1.0 - body.insulinResistance_);
        scale *= this.body.blood.insulin;
        x = this.glucoseToGlycogen__.sample();
        var toGlycogen = scale * x;
        
        if( toGlycogen > this.glucose )
            toGlycogen = this.glucose;
        
       this.glycogen += toGlycogen;
        
        if( this.glycogen > this.glycogenMax_ )
        {
            this.body.adiposeTissue.lipogenesis(this.glycogen -this.glycogenMax_);
            this.glycogen = this.glycogenMax_;
        }
        
        //if the liver cannot store any more glycogen, we assume that this glucose
        //(which would have been stored as glycogen) is converted to fat.
        
        this.glucose -= toGlycogen;
        
        //console.log("After glycogen synthesis in liver, liver glycogen " + glycogen + " mg, live glucose " + glucose + " mg");
        
        //glycogen breakdown (depends on insulin and glucose level)
        
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        glInLiver = this.glucose/this.fluidVolume_;
        
        if( glInLiver > this.normalGlucoseLevel_ ) {
            scale *= this.normalGlucoseLevel_/glInLiver;
        }
        
        x = this.glycogenToGlucose__.sample();
        var fromGlycogen = scale * x;
        
        if( fromGlycogen > this.glycogen )
            fromGlycogen = this.glycogen;
        
        this.glycogen -= fromGlycogen;
        this.glucose += fromGlycogen;
        
        
        
        //Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
        
        
        scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
        
        x = this.glycolysisMin__.sample();
        if( x > this.glycolysisMax_*(this.body.bodyWeight_))
            x = this.glycolysisMax_*(this.body.bodyWeight_);

        var toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( toGlycolysis > this.glucose)
            toGlycolysis = this.glucose;
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis*this.glycolysisToLactateFraction_;

        
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        x =  gngRate__.sample();
        var gng = x *scale;
        this.glucose += this.body.blood.consumeGNGSubstrates(gng);
        
        //Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate concentration. High lactate concentration (e.g. due to high glycolytic activity) would cause gluconeogenesis to happen even if insulin concentration is high. But then Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
        x = this.gngFromLactateRate__.sample();
        this.glycogen += this.body.blood.gngFromHighLactate(x);
     
        body.portalVein.releaseAminoAcids();
        
       
        /*
        if( body.blood.glucose > body.blood.normalGlucoseLevel_){
            body.blood.consumeGlucose(glucoseToNEFA_);
        }
        */
        
              glInLiver = this.glucose/this.fluidVolume_;
        var bgl = this.body.blood.getBGL();
        if( glInLiver > bgl ) {
            var diff = glInLiver - bgl;
            x = this.Glut2VMAX__.sample();
            var g = x*diff/(diff + this.Glut2Km_);
            if( g > this.glucose ) {
                console.log("Releasing more glucose to blood than what is present in liver!");
                exit();
            }
            this.glucose -= g;
            this.body.blood.addGlucose(g);
            SimCtl.time_stamp();
            console.log("Liver released glucose " + g);
        }
        //SimCtl.time_stamp();
        //System.out.println(" Liver:: " + glycogen + " " + glucose + " " + glucose/fluidVolume_);
    }
    
    setParams() {
        for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.LIVER.value).entrySet()) {
            switch (e.getKey()) {
                case "fluidVolume_" : { fluidVolume_ = e.getValue(); break; }
                case "normalGlucoseLevel_" : { normalGlucoseLevel_ = e.getValue(); break; }
                case "Glut2Km_" : { Glut2Km_ = e.getValue(); break; }
                case "Glut2VMAX_" : { Glut2VMAX_ = e.getValue(); break; }
                case "glucoseToGlycogen_" : { glucoseToGlycogen_ = e.getValue(); break; }
                case "glycogenToGlucose_" : { glycogenToGlucose_ = e.getValue(); break; }
                case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
                case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
                case "glycolysisToLactateFraction_" : { glycolysisToLactateFraction_ = e.getValue(); break; }
                case "gluconeogenesisRate_" : { gluconeogenesisRate_ = e.getValue(); break; }
                case "gngFromLactateRate_" : { gngFromLactateRate_ = e.getValue(); break; }
                case "glucoseToNEFA_" : { glucoseToNEFA_ = e.getValue(); break; }
            }
        }
    }
    
    public static class PortalVein {
        private double glucose;
        private double branchedAA;
        private double unbranchedAA;
        private double fluidVolume_;
        HumanBody body;

        public PortalVein(HumanBody body_) {
            body = body_;
            glucose = 0; //mg
            branchedAA = 0; //mg
            unbranchedAA = 0; //mg
            fluidVolume_ = 5; // dl
        }
        
        void processTick() {
            double bgl = body.blood.getBGL();
            double glucoseFromBlood = bgl*fluidVolume_;
            body.blood.removeGlucose(glucoseFromBlood);
            glucose += glucoseFromBlood;
            
            //SimCtl.time_stamp();
        }
        
        void setParams() {
            for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.PORTAL_VEIN.value).entrySet()) {
                switch (e.getKey()) {
                    case "fluidVolume_" : { fluidVolume_ = e.getValue(); break; }
                }
            }
        }
        
        double getConcentration() {
            double gl = glucose/fluidVolume_;
            //SimCtl.time_stamp();
            //System.out.println("GL in Portal Vein: " + gl);
         
            return gl;
        }
        
        void addGlucose(double g) {glucose += g;}
        
        double getGlucose(){return glucose;}
        
        void removeGlucose(double g) {
            glucose -= g;
            if( glucose < 0 ) {
                System.out.println("PortalVein glucose went negative");
                System.exit(-1);
            }
        }
        
        void releaseAllGlucose() {
            body.blood.addGlucose(glucose);
            glucose = 0;
        }
        
        void addAminoAcids(double aa) {
            branchedAA += 0.15*aa;
            unbranchedAA += 0.85*aa;
            //SimCtl.time_stamp();
            //System.out.println(" PortalVein: bAA " + branchedAA + ", uAA " + unbranchedAA);
        }
        
        void releaseAminoAcids() {
            // 93% unbranched amino acids consumed by liver to make alanine
            body.blood.alanine += 0.93*unbranchedAA;
            body.blood.unbranchedAminoAcids += 0.07*unbranchedAA;
            unbranchedAA = 0;
            body.blood.branchedAminoAcids += branchedAA;
            branchedAA = 0;
            // who consumes these amino acids from blood other than liver?
            // brain consumes branched amino acids
        }
        // there is no processTick() in portal vein
    }
}
