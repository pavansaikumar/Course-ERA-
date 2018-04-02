rankall <-  function(outcome, num = "best") {  
  
  data_outcome <- read.csv("outcome-of-care-measures.csv", na.strings = "Not Available")
  data_split<- split(data_outcome, data_outcome$State, is.na(NA) == "TRUE")
  i = 1
  vector = c()
  State_name = c()
  while(i < length(data_split)){
    vector_state <- data_split[[i]]
    vc <- vector_state[,7]
    vc <- vc[1]
    vector[i] <- rankhospital1(vc, outcome, num)
    State_name[i] <- vc
    i = i + 1
  }
  
  vector
  ## Read outcome data                                                    
  ## For each state, find the hospital of the given rank                  
  ## Return a data frame with the hospital names and the (abbreviated)    
  ## state name                                                           
}  