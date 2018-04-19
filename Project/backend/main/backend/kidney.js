

class Kidney {
 
    
    constructor (myBody){
        this.body = myBody;
        
        this.glutamineConsumed_ = 0;
        
        this.glucose = 0;
        this.fluidVolume_ = 1.5; //dl
        
        // 2.5 micromol per kg per minute = 2.5*180.1559/1000 mg per kg per minute = 0.45038975 mg per kg per minute
        this.gluconeogenesisRate_ = 1.8*0.45038975;
        this.gngFromLactateRate_ = gluconeogenesisRate_; // by default
        
        //BUKET NEW: RGU before glucose ingestion averaged 0.89 +- 0.17 micromolkg1 min1(0.16*bodyweight mg) and accounted for 9.4 +- 1.7%
        //of systemic glucose disposal. After glucose ingestion, RGU increased more than threefold to a peak value (2.83 +-  0.58 micromolkg1 min1)
        //at 90 min and returned to postabsorptive rates at 240 min.
        
       
        this.Glut2VMAX_ = 5; // mg per kg per minute
        this.Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut1Rate_ = 1; // mg per kg per minute
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559; // mg per kg per minute
        this.glycolysisMax_ = 5*glycolysisMin_;
        
        this.reabsorptionThreshold_ = 11*180.1559/10; //mg/dl equivalent of 11 mmol/l
        this.glucoseExcretionRate_ = 100/(11*180.1559/10); // mg per minute per(mg/dl)
        // As BGL increases from 11 mmol/l to 22 mmol/l, glucose excretion in urine increases from 0 to mg/min to 100mg/min.
    }
    
    //The kidney takes up glutamine and metabolizes it to ammonia."Renal metabolism of amino acids: its role in interorgan amino acid exchange"
    //Glucose oxidized, and glucose is used to produce lactate by glycolysis
    
    processTick() {
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        
        PoissonDistribution glucoseExcretionRate__ = new PoissonDistribution(glucoseExcretionRate_);
        PoissonDistribution glycolysisMin__ = new PoissonDistribution(x*glycolysisMin_);
        PoissonDistribution gngRate__ = new PoissonDistribution(x*gluconeogenesisRate_);
        PoissonDistribution gngFromLactateRate__ = new PoissonDistribution(x*gngFromLactateRate_);
        PoissonDistribution Glut2VMAX__ = new PoissonDistribution(x*Glut2VMAX_);
        PoissonDistribution basalAbsorption__ = new PoissonDistribution(x*Glut1Rate_);
        
        var bgl = this.body.blood.getBGL();
        var glInKidney = this.glucose/this.fluidVolume_;
        
        x =  Glut2VMAX__.sample();
        var y =  basalAbsorption__.sample();
        
        if( glInKidney < bgl ) {
            
            var diff = bgl - glInKidney;
            var g = (1 + this.body.insulinResistance_)*x*diff/(diff + Glut2Km_);
            // uptake increases for higher insulin resistance.
            // may want to change this formula later - Mukul
            g += y; // basal absorption
            
            this.body.blood.removeGlucose(g);
            this.glucose += g;
        }
        else
        {
            var diff = glInKidney - bgl;
            var g = (1 + body.insulinResistance_)*x*diff/(diff + Glut2Km_);
            //g += y;
            
            if( g > this.glucose )
            {
                console.log("Releasing more glucose to blood than what is present in liver!");
                exit();
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
        x = gngRate__.sample();
        var gng = x * scale;
        this.glucose += this.body.blood.consumeGNGSubstrates(gng);
        console.log("GNG in Kidney " + gng);
        
       
        
        x = gngFromLactateRate__.sample();
        this.glucose += this.body.blood.gngFromHighLactate(x);
        
        console.log("GNG from lactate " + x);
        
      
        
        if( this.body.blood.glutamine > this.glutamineConsumed_ ) {
            this.body.blood.glutamine -= glutamineConsumed_;
        } else {
            this.body.blood.glutamine = 0;
        }
        
        //three different mechanisms: (i) release of glucose into the circulation via gluconeogenesis; (ii) uptake of glucose from the circulation to satisfy its
        //energy needs; and (iii) reabsorption into the circulation of glucose from glomerular filtrate to conserve glucose carbon.
        
        
        
        //Glucose excretion in urine
        
        bgl = this.body.blood.getBGL();

        if( bgl > reabsorptionThreshold_ )
        {
            x =  glucoseExcretionRate__.sample();
            var g = x*(bgl-reabsorptionThreshold_);
            this.body.blood.removeGlucose(g);
            console.log("glucose excretion in urine " + g);
        }
        
        //SimCtl.time_stamp();
        //System.out.println(" Kidney:: " + glucose + " " + glucose/fluidVolume_);
    }
    /*
    void setParams() {
        for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.KIDNEY.value).entrySet()) {
            switch (e.getKey()) {
                case "fluidVolume_" : { fluidVolume_ = e.getValue(); break; }
                case "Glut2VMAX_" : { Glut2VMAX_ = e.getValue(); break; }
                case "Glut2Km_" : { Glut2Km_ = e.getValue(); break; }
                case "Glut1Rate_" : { Glut1Rate_ = e.getValue(); break; }
                case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
                case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
                case "gluconeogenesisRate_" : { gluconeogenesisRate_ = e.getValue(); break; }
                case "glutamineConsumed_" : { glutamineConsumed_ = e.getValue(); break; }
            }
        }
    }*/
}
