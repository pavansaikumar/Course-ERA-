//package sim;
//import java.util.Map.Entry;
//import org.apache.commons.math3.distribution.PoissonDistribution;

//import enums.BodyOrgan;

export class Blood {
	
    static ONEDAY = 24*60;
    static MAXAGE = 120*24*60;
	// minutes in 120 days
	
	static HUNDREDDAYS = 100;
	// minutes in 100 days
	
	static RBCBin {
		var RBCs;
		var glycatedRBCs;
	}
	////////////////////================================================================================
	private RBCBin[] AgeBins = new RBCBin[MAXAGE+1];// Aging Bins
    /////////////////////==========================================================================
    
    currentHbA1c() {
    	var rbcs = 0;
        var glycated_rbcs = 0;
        for(var i = 0; i <= MAXAGE; i++) {
            rbcs += AgeBins[i].RBCs;
            glycated_rbcs += AgeBins[i].glycatedRBCs;
        }
        if(rbcs == 0) {
            System.out.println("Error in Bloody::currentHbA1c");
            System.exit(1);
        }
        return glycated_rbcs/rbcs;
    }
    ///////////////////////////////////=========================================================
    updateRBCs() {
    	// will be called once a day
    	bin0--;
        if( bin0 < 0 ) bin0 = MAXAGE;
        //New RBCs take birth
        AgeBins[bin0].RBCs = rbcBirthRate_;
        AgeBins[bin0].glycatedRBCs = 0;
        //System.out.println("New RBCs: " + AgeBins[bin0].RBCs);
        // Old (100 to 120 days old) RBCs die
        int start_bin = bin0 + HUNDREDDAYS;
        if( start_bin > MAXAGE ) start_bin -= (MAXAGE + 1);
        //System.out.println("Old RBCs Die");
        for(int i = 0; i < (MAXAGE-HUNDREDDAYS); i++) {
        	int j = start_bin = i;
        	if (j < 0) {
        		SimCtl.time_stamp();
        		System.out.println(" RBC bin value negative " + j);
        		System.exit(-1);
        	}
        	if (j > MAXAGE) j -= (MAXAGE + 1);
            double kill_rate = ((double)i)/((double)(MAXAGE-HUNDREDDAYS));
            AgeBins[j].RBCs *= (1.0 - kill_rate);
            AgeBins[j].glycatedRBCs *= (1.0 - kill_rate);
            //System.out.println("bin: " + (start_bin + i) + ", RBCs " + AgeBins[start_bin + i].RBCs + ", Glycated RBCs " + AgeBins[start_bin + i].glycatedRBCs);
        }
        //glycate the RBCs
        double glycation_prob = avgBGLOneDay * glycationProbSlope_ + glycationProbConst_;
        //System.out.println("RBCs glycate");
        for(int i = 0; i <= MAXAGE; i++) {
            double newly_glycated = glycation_prob * AgeBins[i].RBCs;
            AgeBins[i].RBCs -= newly_glycated;
            AgeBins[i].glycatedRBCs += newly_glycated;
            //System.out.println("bin: " + i + ", RBCs " + AgeBins[i].RBCs + ", Glycated RBCs " + AgeBins[i].glycatedRBCs);
        }
        SimCtl.time_stamp();
        System.out.println("New HbA1c: " + currentHbA1c());
    }

    
        // Constructor
    constructor(myBody) {
    	this.body = myBody;
    	
    	 //tracking RBCs
        this.bin0 = 1;
        this.rbcBirthRate_ = 144.0*60*24; // in millions per minute
        this.glycationProbSlope_ = 0.085/10000.0;
        this.glycationProbConst_ = 0;
        
        // all contents are in units of milligrams of glucose
        this.glucose = 5000.0; //5000.0; //15000.0;
        this.fluidVolume_ = 50.0; // in deciliters
        
        this.gngSubstrates = 0;
        this.alanine = 0;
        this.branchedAminoAcids = 0;
        this.unbranchedAminoAcids = 0;
        this.glutamine = 0;
        this.insulin = 0;
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559;
        this.glycolysisMax_ = 5*glycolysisMin_;
        
        this.normalGlucoseLevel_ = 100; //mg/dl
        this.highGlucoseLevel_ = 200; //mg/dl
        this.minGlucoseLevel_ = 40; //mg/dl
        this.highLactateLevel_ = 4053.51; // mg
        // 9 mmol/l of lactate = 4.5 mmol/l of glucose = 4.5*180.1559*5 mg of glucose = 4053.51mg of glucose
        this.lactate = 0; //450.39; //mg
        // 1mmol/l of lactate = 0.5mmol/l of glucose = 0.5*180.1559*5 mg of glucose = 450.39 mg of glucose

        // initial number of RBCs
        for(var i = 0; i <= MAXAGE; i++)
        {
        	AgeBins[i] = new RBCBin();
            AgeBins[i].RBCs = 0.94*rbcBirthRate_;
            AgeBins[i].glycatedRBCs = 0.06*rbcBirthRate_;
        }
        this.avgBGLOneDay = 0;
        this.avgBGLOneDaySum = 0;
        this.avgBGLOneDayCount = 0;
    }
    
    processTick() {
	    var x; // to hold the random samples
	
        var PoissonDistribution =  new Java.type("org.apache.commons.math3.distribution.PoissonDistribution");
	    var glycolysisMin__ = new PoissonDistribution(100.0*this.glycolysisMin_);
	    
	    
	    var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
	    
	    x = this.glycolysisMin__.sample();
	    x = x*(this.body.bodyWeight_)/100.0;
	    
	    if( x > this.glycolysisMax_*(this.body.bodyWeight_))
	        x = this.glycolysisMax_*(this.body.bodyWeight_);
	    
	    var toGlycolysis = x + scale * ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
	    
	    if( toGlycolysis > this.glucose) toGlycolysis = this.glucose;
	    
	    this.glucose -= toGlycolysis;
	    this.body.blood.lactate += toGlycolysis;
	    //System.out.println("Glycolysis in blood, blood glucose " + glucose + " mg, lactate " + lactate + " mg")
	    
	    var bgl = this.glucose/this.fluidVolume_;
	    
	    if( bgl >= this.highGlucoseLevel_)
	        this.insulin = this.body.insulinPeakLevel_;
	    else
	    {
	        if( bgl < this.normalGlucoseLevel_)
	            this.insulin = 0;
	        else
	        {
	            this.insulin = (this.body.insulinPeakLevel_)*(bgl - this.normalGlucoseLevel_)/(this.highGlucoseLevel_ - this.normalGlucoseLevel_);
	        }
	    }
	    
	  //calculating average bgl during a day
	    
	    if( this.avgBGLOneDayCount == ONEDAY )
	    {
	        this.avgBGLOneDay = avgBGLOneDaySum/avgBGLOneDayCount;
	        this.avgBGLOneDaySum = 0;
	        this.avgBGLOneDayCount = 0;
	        updateRBCs();
	        SimCtl.time_stamp();
	        console.log(" Blood::avgBGL " + avgBGLOneDay);
	    }
	    
	    this.avgBGLOneDaySum += bgl;
	    this.avgBGLOneDayCount++;
	    
	    SimCtl.time_stamp();
	    console.log("Blood:: bgl " + getBGL());
	    
	    //BUKET NEW: For the calculation of Incremental AUC
	    //if(glcs > 100 && SimCtl::ticks < 120){
	    //  SimCtl::AUC = SimCtl::AUC + (glcs-100);
	    //}
    }
    
    setParams(){
        for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BLOOD.value).entries()) {
            switch (key) {
    			case "rbcBirthRate_" : { this.rbcBirthRate_ = value; break; }
    			case "glycationProbSlope_" : { this.glycationProbSlope_ = value; break; }
    			case "glycationProbConst_" : { this.glycationProbConst_ = value; break; }
    			case "minGlucoseLevel_" : { this.minGlucoseLevel_ = value; break; }
    			case "normalGlucoseLevel_" : { this.normalGlucoseLevel_ = value; break; }
    			case "highGlucoseLevel_" : { this.highGlucoseLevel_ = value; break; }
    			case "highLactateLevel_" : { this.highLactateLevel_ = value; break; }
    			case "glycolysisMin_" : { this.glycolysisMin_ = value; break; }
    			case "glycolysisMax_" : { this.glycolysisMax_ = value; break; }
    		}
    	}
    }
    
    removeGlucose(howmuch) {
    	 this.glucose -= howmuch;
    	//System.out.println("Glucose consumed " + howmuch + " ,glucose left " + glucose);
	    if (getBGL() <= this.minGlucoseLevel_) {
	        SimCtl.time_stamp();
	        console.log(" bgl dips to: " + getBGL());
	        System.exit(-1);
	    }
    }
    addGlucose(howmuch) {
    	this.glucose += howmuch;
	    //SimCtl.time_stamp();
	    //System.out.println(" BGL: " + getBGL());
    }
    
    getBGL() { return this.glucose/this.fluidVolume_; }

    getGNGSubstrates(){ 
    	return (this.gngSubstrates + this.lactate + this.alanine + this.glutamine);
    }
    
    consumeGNGSubstrates(howmuch) {
    	var total = this.gngSubstrates + this.lactate + this.alanine + this.glutamine;
	    if( total < howmuch ) {
	        this.gngSubstrates = 0;
	        this.lactate = 0;
	        this.alanine = 0;
	        this.glutamine = 0;
	        return total;
	    }
	    var factor = (total - howmuch)/total;
	    this.gngSubstrates *= factor;
	    this.lactate *= factor;
	    this.alanine *= factor;
	    this.glutamine *= factor;
	    return howmuch;
    }
    
    gngFromHighLactate(rate_) {
    	// Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate
    	// concentration. High lactate concentration (e.g. due to high glycolytic activity) would 
    	// cause gluconeogenesis to happen even if insulin concentration is high. But then 
    	// Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
    	
    	// rate_ is in units of mg per kg per minute
	    var x = 3*rate_ * this.lactate/this.highLactateLevel_;
	    
	    if( x > this.lactate ) x = this.lactate;
	    
	    this.lactate -= x;
	    return x;
    }
}