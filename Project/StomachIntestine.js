// package sim;

// import java.util.Map.Entry;

// import org.apache.commons.math3.distribution.PoissonDistribution;
// import org.apache.commons.math3.special.Erf;

// import enums.BodyOrgan;

export class StomachIntestine {

    //Set Default Values
    constructor(body_) {
		this.body = body_;
		this.enterocytes = new Enterocytes();

	    this.RAG = 0;
	    this.SAG = 0;
	    this.origRAG = 0;
	    this.origSAG = 0;
	    
	    this.digestedGlucose = 0;

	    this.protein = 0;
	    this.totalFood = 0;

	    this.FatDelayMax_ = 300;
	    this.ProteinEffectMin_ = 0.5;
	    this.proteinEffect = 1;
	    this.fatDelay = 0;
	    
	    this.RAG_Mean_ = 5;
	    this.RAG_StdDev_ = 5;
	    this.SAG_Mean_ = 60;
	    this.SAG_StdDev_ = 20;
	    
	    this.stomachEmpty = true;
	    this.foodAddedAt = 0;
    }
    
    addFood(foodID, howmuch) {
    	if( howmuch == 0 )
            return;
        
        this.foodAddedAt = SimCtl.ticks;
        this.totalFood = howmuch*1000.0; // in mg
        
        var name = this.body.foodTypes.get(foodID).name_;
        
        var numServings = howmuch/(this.body.foodTypes.get(foodID).servingSize_);
        this.RAG += 1000.0*numServings*(this.body.foodTypes.get(foodID).RAG_); // in mg
        this.SAG += 1000.0*numServings*(this.body.foodTypes.get(foodID).SAG_); // in mg
        var newProtein = 1000.0*numServings*(this.body.foodTypes.get(foodID).protein_); // in mg
        var newFat = 1000.0*numServings*(this.body.foodTypes.get(foodID).fat_); // in mg
        
        this.origRAG = RAG;
        this.origSAG = SAG;
        this.protein += newProtein;
        this.fat += newFat;
        
        if( (this.RAG > 0) || (this.SAG > 0) || (this.protein > 0) )
            this.stomachEmpty = false;
        ///////////////////////////////////////////////////////////
        SimCtl.time_stamp();
        console.log("Adding " + howmuch + " grams of " + name + " to stomach");
        
        //When the food contains protein, it will widen the time range over which RAG/SAG get digested
        this.proteinEffect = (1.0 - (newProtein/totalFood));
        if( this.proteinEffect < this.ProteinEffectMin_ )
            this.proteinEffect = this.ProteinEffectMin_;
        
        //If the fat/totalcarbohydrate proportion is less than 0.66, its effect on SAG is linear.
        //If fat percentage to carbohydrate is high, which means the proportion of fat to carbohydrate 
        //is greater than 0.66, The effect is the same as 0.66. Because for high fat the effect is fixed.

        if( newFat/this.totalFood >= 0.66)
            this.fatDelay = this.FatDelayMax_;
        else
        {
            this.fatDelay = (this.FatDelayMax_ * (newFat/this.totalFood));
        }
        
        // very simple processing of fat for now
        this.body.adiposeTissue.addFat(fat);
        this.fat = 0;
    }
    
    setParams() {//// Need to see this:;:: ============================================================================= 
    for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.STOMACH_INTESTINE.value).entries()) {
    		switch (key) {
    			case "aminoAcidAbsorptionRate_" : { this.enterocytes.aminoAcidsAbsorptionRate_ = value; break; }
    			case "glutamineOxidationRate_" : { this.enterocytes.glutamineOxidationRate_ = value; break; }
    			case "glutamineToAlanineFraction_" : { this.enterocytes.glutamineToAlanineFraction_ = value; break; }
    			case "Glut2VMAX_In_" : { this.enterocytes.Glut2VMAX_In_ = value; break; }
    			case "Glut2Km_In_" : { this.enterocytes.Glut2Km_In_ = value; break; }
    			case "Glut2VMAX_Out_" : { this.enterocytes.Glut2VMAX_Out_ = value; break; }
    			case "Glut2Km_Out_" : { this.enterocytes.Glut2Km_Out_ = value; break; }
    			case "sglt1Rate_" : { this.enterocytes.sglt1Rate_ = value; break; }
    			case "fluidVolumeInLumen_" : { this.enterocytes.fluidVolumeInLumen_ = value; break; }
    			case "fluidVolumeInEnterocytes_" : { this.enterocytes.fluidVolumeInEnterocytes_ = value; break; }
    			case "glycolysisMin_" : { this.enterocytes.glycolysisMin_ = value; break; }
    			case "glycolysisMax_" : { this.enterocytes.glycolysisMax_ = value; break; }
    			case "FatDelayMax_" : { this.FatDelayMax_ = value; break; }
    			case "ProteinEffectMin_" : { this.ProteinEffectMin_ = value; break; }
    			case "RAG_Mean_" : { this.RAG_Mean_ = value; break; }
    			case "RAG_StdDev_" : { this.RAG_StdDev_ = value; break; }
    			case "SAG_Mean_" : { this.SAG_Mean_ = value; break; }
    			case "SAG_StdDev_" : { this.SAG_StdDev_ = value; break; }
    		}
    	}
    }
    
    void processTick() {
    	
    	var RAGConsumed = 0;
        
        var t = SimCtl.ticks -this.foodAddedAt;
        // we assume that RAG appears in blood as per a normal distributon with a user specified mean and std dev
        
        var stddev = this.RAG_StdDev_/this.proteinEffect;
        
        if( t == 0 )
            RAGConsumed = this.origRAG*0.5*(1 + Erf.erf((t - this.RAG_Mean_)/(stddev*Math.sqrt(2))));
        else
            RAGConsumed = this.origRAG*0.5*( Erf.erf((t-this.RAG_Mean_)/(stddev*Math.sqrt(2))) -Erf.erf((t-1-this.RAG_Mean_)/(stddev*Math.sqrt(2))) );
        
        if( this.RAG < RAGConsumed )
            RAGConsumed = this.RAG;
        
        this.RAG -= RAGConsumed;
        this.digestedGlucose += RAGConsumed;

        // digest some SAG now
        
        t = SimCtl.ticks - this.foodAddedAt - this.fatDelay;
        
        var SAGConsumed = 0;
        
        if( t >= 0 )
        {
            // we assume that SAG appears in blood as per a normal distributon with a user specified mean and stdev
            
            stddev = this.SAG_StdDev_/this.proteinEffect;
            
            if( t == 0 )
                SAGConsumed = this.origSAG*0.5*(1 + Erf.erf((t - this.SAG_Mean_)/(stddev*Math.sqrt(2))));
            else
                SAGConsumed = this.origSAG*0.5*( Erf.erf((t-this.SAG_Mean_)/(stddev*Math.sqrt(2))) - Erf.erf((t-1-this.SAG_Mean_)/(stddev*Math.sqrt(2))) );
                    
            if( this.SAG < SAGConsumed )
                SAGConsumed = this.SAG;
            
            this.SAG -= SAGConsumed;
            this.digestedGlucose += SAGConsumed;
        }

        this.digestedGlucose -= this.enterocytes.absorbGlucose(this.digestedGlucose,this.body);
            // need to call absorbGlucose on enterocytes even if "digestedGlucose" is zero.
        this.protein -= this.enterocytes.absorbAminoAcids(this.protein,this.body);
            //need to call absorbAminoAcids on enterocytes even if "protein" is zero.
        
        if( !this.stomachEmpty && (this.RAG == 0) && (this.SAG == 0) && (this.protein == 0) )
        {
            this.stomachEmpty = true;
            this.body.stomachEmpty();
        }
        
        SimCtl.time_stamp();
        console.log(" Stomach. SAG " + this.SAG + " RAG " + this.RAG + " " + this.origRAG + " " + this.origSAG + " digestedGlucose " + this.digestedGlucose + " " + this.protein + " " + this.totalFood + " " + this.proteinEffect + " " + this.fatDelay+ " " + this.stomachEmpty + " " + this.foodAddedAt + " RAGConsumed " + RAGConsumed + " SAGConsumed " + SAGConsumed);
    }
    
   static  Enterocytes(){   

   	  public Enterocytes() {
	    	glucose = 0;
	        fluidVolumeInEnterocytes_ = 3; //dl
	        fluidVolumeInLumen_ = 4; //dl
	        
	        //Michaelis Menten parameters for glucose transport
	        Glut2Km_In_ = 100*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
	        Glut2VMAX_In_ = 700; //mg
	        Glut2Km_Out_ = 100*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
	        Glut2VMAX_Out_ = 700; //mg
	        //active transport rate
	        sglt1Rate_ = 30; //mg per minute
	        
	        peakGlucoseConcentrationInLumen = 200*180.1559/10.0; // mg/dl equivalent of 200mmol/l
	        observedPeakGlucoseConcentration = 0;
	        
	        aminoAcidsAbsorptionRate_ = 1; //mg per minute
	        glutamineOxidationRate_ = 1; // mg per minute
	        glutamineToAlanineFraction_ = 0.5;
	        
	        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
	        glycolysisMin_ = 0.1801559;
	        glycolysisMax_ = 5*glycolysisMin_;
	    }
	    private double glucose;
		private double fluidVolumeInEnterocytes_; // in deciliters
		private double fluidVolumeInLumen_; // in deciliters
		//Michaelis Menten parameters for glucose transport
		private double Glut2Km_In_;
		private double Glut2VMAX_In_; //mg
		private double Glut2Km_Out_;
		private double Glut2VMAX_Out_; //mg
		//active transport rate
		private double sglt1Rate_;
		private double peakGlucoseConcentrationInLumen;
		private double observedPeakGlucoseConcentration;
		
		//glycolysis
		private double glycolysisMin_;
		private double glycolysisMax_;
		
		//Amino Acid Absorption
		private double aminoAcidsAbsorptionRate_;
		private double glutamineOxidationRate_;
		private double glutamineToAlanineFraction_;

	    public double absorbGlucose(double glucoseInLumen, HumanBody body) {
	    	double x; // to hold the random samples
	    	double activeAbsorption = 0;
	        double passiveAbsorption = 0;
	        double toGlycolysis = 0;
	        double toPortalVein = 0;
	        
	        double glLumen = 0;
	        double glEnterocytes = 0;
	        double glPortalVein = 0;
	        
	        x = body.bodyWeight_;
	        
	        PoissonDistribution basalAbsorption__  = new PoissonDistribution(sglt1Rate_);
	        PoissonDistribution Glut2VMAX_In__ = new PoissonDistribution(Glut2VMAX_In_);
	        PoissonDistribution Glut2VMAX_Out__ = new PoissonDistribution(Glut2VMAX_Out_);
	        PoissonDistribution glycolysisMin__ = new PoissonDistribution (x*glycolysisMin_);

	        // first, absorb some glucose from intestinal lumen
	        
	        double glucoseAbsorbed = 0;
	        
	        if( glucoseInLumen > 0 ) {
	            if ( fluidVolumeInLumen_ <= 0 ) {
	                System.out.println("Enterocytes::processTick");
	                System.exit(-1);
	            }
	        
	            // Active transport first
	            activeAbsorption = (double)basalAbsorption__.sample();
	            
	            if( activeAbsorption >= glucoseInLumen ) {
	            	activeAbsorption = glucoseInLumen;
	                glucose += activeAbsorption;
	                glucoseAbsorbed = activeAbsorption;
	            } else {
	                glucose += activeAbsorption;
	                glucoseAbsorbed = activeAbsorption;
	        
	                //passive transport via GLUT2s now
	                double remainingGlucoseInLumen = glucoseInLumen - activeAbsorption;
	                glLumen = remainingGlucoseInLumen/fluidVolumeInLumen_;
	                glEnterocytes = glucose/fluidVolumeInEnterocytes_;
	                double diff = glLumen - glEnterocytes;
	        
	                if( diff > 0 ) {
	                    // glucose concentration in lumen decides the number of GLUT2s available for transport.
	                    // so, Vmax depends on glucose concentration in lumen
	                    x = (double) Glut2VMAX_In__.sample();
	                    double effectiveVmax = x*glLumen/peakGlucoseConcentrationInLumen;
	        
	                    if (effectiveVmax > Glut2VMAX_In_)
	                        effectiveVmax = Glut2VMAX_In_;
	                    
	                    passiveAbsorption = effectiveVmax*diff/(diff + Glut2Km_In_);
	        
	                    if ( passiveAbsorption > remainingGlucoseInLumen )
	                    	passiveAbsorption = remainingGlucoseInLumen;
	                    
	                    glucose += passiveAbsorption;
	                    glucoseAbsorbed += passiveAbsorption;
	                }
	            }
	        }
	        
	        //release some glucose to portal vein via Glut2s
	        glEnterocytes = glucose/fluidVolumeInEnterocytes_;
	        glPortalVein = body.portalVein.getConcentration();
	                                                   
	        double diff = glEnterocytes - glPortalVein;
	        
	        if(diff > 0 ) {
	            x = (double) Glut2VMAX_Out__.sample();
	            toPortalVein = x*diff/(diff + Glut2Km_Out_);
	            
	            if( toPortalVein > glucose )
	            	toPortalVein = glucose;
	            
	            glucose -= toPortalVein;
	            body.portalVein.addGlucose(toPortalVein);
	        }
	        
	        // Modeling the glucose consumption by enterocytes: glycolysis to lactate.
	        
	        //Glycolysis. Depends on insulin level. Consumed glucose becomes lactate (Ref: Gerich).
	        
	        double scale = (1.0 - body.insulinResistance_)*(body.blood.insulin);
	        
	        x = (double) glycolysisMin__.sample();
	        if( x > glycolysisMax_*(body.bodyWeight_))
	            x = glycolysisMax_*(body.bodyWeight_);
	        
	        toGlycolysis = x + scale* ( (glycolysisMax_*(body.bodyWeight_)) - x);
	        
	        if( toGlycolysis > glucose)
	            toGlycolysis = glucose;
	        glucose -= toGlycolysis;
	        body.blood.lactate += toGlycolysis;

	     // log all the concentrations (in mmol/l)
	        // peak concentrations should be 200mmol/l (lumen), 100mmol/l(enterocytes), 10mmol/l(portal vein)
	        
	        glLumen = (10.0/180.1559)*(glucoseInLumen - glucoseAbsorbed)/fluidVolumeInLumen_; // in mmol/l
	        glEnterocytes = (10.0/180.1559)*glucose/fluidVolumeInEnterocytes_;
	        x = body.portalVein.getConcentration();
	        glPortalVein = (10.0/180.1559)*x;

	        SimCtl.time_stamp();
	        System.out.println("glLumen: " + glLumen + " glEntero " + glEnterocytes + " glPortal " + glPortalVein + ", " + x + " activeAbsorption " + activeAbsorption + " passiveAbsorption " + passiveAbsorption + " toGlycolysis " + toGlycolysis + " toPortal " + toPortalVein + " glucoseAbsorbed " + glucoseAbsorbed);
	        
	        // return the amount of glucose absorbed from lumen. The stomachIntestine calls processTick on
	        // enterocytes and uses the return value of the function to reduce the amount of glucose in the lumen.
	        return glucoseAbsorbed;
	    }
	    
	  //The BCAAs, leucine, isoleucine, and valine, represent 3 of the 20 amino acids that are used in the formation
	    //of proteins. Thus, on average, the BCAA content of food proteins is about 15% of the total amino acid content.
	    //"Interrelationship between Physical Activity and Branched-Chain Amino Acids"

	  //The average content of glutamine in protein is about %3.9. "The Chemistry of Food" By Jan Velisek
	  //Do we consider the dietary glutamine? I did not consider in my code but I can add if we need it.

	  //Looks like cooking destroys dietary glutamine. So, no need to consider diet as source of glutamine.
	  //-Mukul
	    
	    public double absorbAminoAcids(double aminoAcidsInLumen, HumanBody body) {
	    	double absorbedAA = 0;
	        
	        if( aminoAcidsInLumen > aminoAcidsAbsorptionRate_ ) {
	            absorbedAA = aminoAcidsAbsorptionRate_;
	        } else {
	            if( aminoAcidsInLumen > 0 ) {
	                absorbedAA = aminoAcidsInLumen;
	            }
	        }
	        
	        body.portalVein.addAminoAcids(absorbedAA);
	        
	        //Glutamine is oxidized
	        if( body.blood.glutamine > glutamineOxidationRate_ ) {
	            body.blood.glutamine -= glutamineOxidationRate_;
	            body.blood.alanine += glutamineToAlanineFraction_*glutamineOxidationRate_;
	        } else {
	            if( body.blood.glutamine > 0 ) {
	                body.blood.alanine += glutamineToAlanineFraction_*(body.blood.glutamine);
	                body.blood.glutamine = 0;
	            }
	        }
	        
	        SimCtl.time_stamp();
	        System.out.println(" Enterocytes:: " + glucose + " " + glucose/fluidVolumeInEnterocytes_ + " " + observedPeakGlucoseConcentration);
	        
	        return absorbedAA;
	    }

	    //called from StomachIntestine's processTick
	  
   }
}
