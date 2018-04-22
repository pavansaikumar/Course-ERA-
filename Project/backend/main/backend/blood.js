 class Blood {

    OneDay(){

        var ONEDAY = 24*60;
        this.publicaccesor = ONEDAY;
    };

    OneDay.staticProperty = 24*60;
    

     MAXAGE(){

        var Maxage = 120*24*60;
        var self = this;
        self.publicaccesor = Maxage;
    };

    MAXAGE.staticProperty = 120*24*60;
	
	// minutes in 120 days
	
   HUNDREDDAYS(){

        var Hundreddays =100;
        var self = this;
        self.publicaccesor = 100  ;
    };

   HUNDREDDAYS.staticProperty = 100;
	// minutes in 100 days
	// To study deep in to the static and array combination
	class RBCBin {

		var  RBCs;
		var glycatedRBCs;
	}
	
	//private RBCBin[] AgeBins = new RBCBin[MAXAGE+1];// Aging Bins
    //private int bin0;	// Current age 0 bin
    
    var  rbcBirthRate_; // how many million RBCs take birth each minute
    var glycationProbSlope_; // g*l_i + c is the probability that an unglycated RBC glycates during a minute
    var glycationProbConst_;
    var minGlucoseLevel_;
    var glycolysisMin_;
    var glycolysisMax_;
    
    function currentHbA1c() {
    	var rbcs = 0;
        var glycated_rbcs = 0;
        for(int k = 0; k <=  MAXAGE.staticProperty; k++) {
            rbcs += AgeBins[k].RBCs;
            glycated_rbcs += AgeBins[k].glycatedRBCs;
        }
        if(rbcs == 0) {
            console.log("Error in Bloody::currentHbA1c");
            exit();
        }
        return glycated_rbcs/rbcs;
    }
    // Need to update after reading arrays and static 
    function updateRBCs() {
    	// will be called once a day
    	bin0--;
        if( bin0 < 0 ) bin0 =  MAXAGE.staticProperty;
        //New RBCs take birth
        AgeBins[bin0].RBCs = rbcBirthRate_;
        AgeBins[bin0].glycatedRBCs = 0;
        //System.out.println("New RBCs: " + AgeBins[bin0].RBCs);
        // Old (100 to 120 days old) RBCs die
        int start_bin = bin0 + HUNDREDDAYS.staticProperty ;
        if( start_bin > MAXAGE.staticProperty ) start_bin -= (MAXAGE.staticProperty + 1);
        //System.out.println("Old RBCs Die");
        for(int i = 0; i < (MAXAGE.staticProperty-HUNDREDDAYS.staticProperty); i++) {
        	int j = start_bin = i;
        	if (j < 0) {
        		SimCtl.time_stamp();
        		console.log(" RBC bin value negative " + j);
        		exit();
        	}
        	if (j >MAXAGE.staticProperty) j -= (MAXAGE.staticProperty + 1);
            var kill_rate = (MAXAGE.staticProperty;-HUNDREDDAYS.staticProperty);
            AgeBins[j].RBCs *= (1.0 - kill_rate);
            AgeBins[j].glycatedRBCs *= (1.0 - kill_rate);
            //System.out.println("bin: " + (start_bin + i) + ", RBCs " + AgeBins[start_bin + i].RBCs + ", Glycated RBCs " + AgeBins[start_bin + i].glycatedRBCs);
        }
        //glycate the RBCs
        var glycation_prob = avgBGLOneDay * glycationProbSlope_ + glycationProbConst_;
        //System.out.println("RBCs glycate");
        for(i = 0; i <= MAXAGE.staticProperty; i++) {
            var newly_glycated = glycation_prob * AgeBins[i].RBCs;
            AgeBins[i].RBCs -= newly_glycated;
            AgeBins[i].glycatedRBCs += newly_glycated;
            //System.out.println("bin: " + i + ", RBCs " + AgeBins[i].RBCs + ", Glycated RBCs " + AgeBins[i].glycatedRBCs);
        }
        SimCtl.time_stamp();
       console.log("New HbA1c: " + currentHbA1c());
    }
    
   
    
    //All the metabolites are in units of milligrams of glucose
    var glucose; // in milligrams
    var normalGlucoseLevel_;
    var  insulin;
    var lactate;
    var branchedAminoAcids;
    var glutamine;
    var alanine;
    var unbranchedAminoAcids;
    var gngSubstrates; // glycerol and other gng substrates (not including lactate, glutamine and alanine), all in units of glucose
    
    // Constructor
    constructor (myBody) {
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
        for(int i = 0; i <= MAXAGE.staticProperty; i++)
        {
        	AgeBins[i] = new RBCBin();
            AgeBins[i].RBCs = 0.94*rbcBirthRate_;
            AgeBins[i].glycatedRBCs = 0.06*rbcBirthRate_;
        }
        avgBGLOneDay = 0;
        avgBGLOneDaySum = 0;
        avgBGLOneDayCount = 0;
    }
    
    //Red Blood cells use glucose during glycolysis and produce lactate
    
   //As part of "blood" class, RBCs consume about 25mg of glucose every 
   //minute and convert it to lactate via glycolysis. 
    processTick() {
	    var x; // to hold the random samples
	
	    PoissonDistribution glycolysisMin__ = new PoissonDistribution(100.0*glycolysisMin_);
	    
	    //RBCs consume about 25mg of glucose every minute and convert it to lactate via glycolysis.
	    //Gerich: Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
	    
	    var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
	    
	    x = = this.glycolysisMin__.sample();
	    x = x*(this.body.bodyWeight_)/100.0;
	    
	    if( x > this.glycolysisMax_*(this.body.bodyWeight_))
	        x = this.glycolysisMax_*(this.body.bodyWeight_);
	    
	    var toGlycolysis = x + scale * ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
	    
	    if( toGlycolysis > this.glucose) toGlycolysis = this.glucose;
	    
	    this.glucose -= toGlycolysis;
	    this.body.blood.lactate += toGlycolysis;
	    //System.out.println("Glycolysis in blood, blood glucose " + glucose + " mg, lactate " + lactate + " mg")
	    
	    var bgl = this.glucose/this.fluidVolume_;
	    
	    //update insulin level
	    
	    if( bgl >= highGlucoseLevel_)
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
	    
	    if( avgBGLOneDayCount == ONEDAY.staticProperty )
	    {
	        avgBGLOneDay = avgBGLOneDaySum/avgBGLOneDayCount;
	        avgBGLOneDaySum = 0;
	        avgBGLOneDayCount = 0;
	        this.updateRBCs();
	        SimCtl.time_stamp();
	        console.log(" Blood::avgBGL " + avgBGLOneDay);
	    }
	    
	    avgBGLOneDaySum += bgl;
	    avgBGLOneDayCount++;
	    
	    SimCtl.time_stamp();
	    console.log("Blood:: bgl " + getBGL());
	    
	    //BUKET NEW: For the calculation of Incremental AUC
	    //if(glcs > 100 && SimCtl::ticks < 120){
	    //  SimCtl::AUC = SimCtl::AUC + (glcs-100);
	    //}
    }
    // To do after reading the maps
    function setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BLOOD.value).entrySet()) {
    		switch (e.getKey()) {
    			case "rbcBirthRate_" : { rbcBirthRate_ = e.getValue(); break; }
    			case "glycationProbSlope_" : { glycationProbSlope_ = e.getValue(); break; }
    			case "glycationProbConst_" : { glycationProbConst_ = e.getValue(); break; }
    			case "minGlucoseLevel_" : { minGlucoseLevel_ = e.getValue(); break; }
    			case "normalGlucoseLevel_" : { normalGlucoseLevel_ = e.getValue(); break; }
    			case "highGlucoseLevel_" : { highGlucoseLevel_ = e.getValue(); break; }
    			case "highLactateLevel_" : { highLactateLevel_ = e.getValue(); break; }
    			case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
    			case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
    		}
    	}
    }
    
    removeGlucose(howmuch) {
    	 this.glucose -= howmuch;
    	//console.log("Glucose consumed " + howmuch + " ,glucose left " + glucose);
	    if (this.getBGL() <= this.minGlucoseLevel_) {
	        SimCtl.time_stamp();
	        console.log(" bgl dips to: " + this.getBGL());
	        exit();
	    }
    }
    addGlucose(howmuch) {
    	this.glucose += howmuch;
	    //SimCtl.time_stamp();
	    //console.log(" BGL: " + getBGL());
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
    	
    	// rate_ is in units of mg per kg per minute
	    var x = 3* rate_ * this.lactate/this.highLactateLevel_;
	    if( x >this.lactate ) x = this.lactate; 
	    this.lactate -= x;
	    return x;
    }
}