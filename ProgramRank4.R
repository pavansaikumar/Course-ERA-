rankhospital <- function(state, outcome, num = "best") {                            
  data_outcome <- read.csv("outcome-of-care-measures.csv", na.strings = "Not Available")
  data_split <- subset(data_outcome, data_outcome$State == state,  is.na(NA) == "TRUE")
  if(outcome == 'heart attack' || outcome =='pneumonia' || outcome == 'heart failure')
  {
    if(outcome == 'pneumonia')
    {
      if(num == "best"){
      data_final <- arrange(data_split, Hospital.30.Day.Death..Mortality..Rates.from.Pneumonia)
      }
      else if(num == "worst"){
        data_final <- arrange(data_split, desc(Hospital.30.Day.Death..Mortality..Rates.from.Pneumonia))
      }
      else{
        data_final <- arrange(data_split, Hospital.30.Day.Death..Mortality..Rates.from.Pneumonia)
      }
    }
    else if(outcome == 'heart attack')
    {
      if(num == "best"){
      data_final <- arrange(data_split, Hospital.30.Day.Death..Mortality..Rates.from.Heart.Attack)
      }
      else if(num == "worst"){
        data_final <- arrange(data_split, desc(Hospital.30.Day.Death..Mortality..Rates.from.Heart.Attack))
      }
      else{
        data_final <- arrange(data_split, (Hospital.30.Day.Death..Mortality..Rates.from.Heart.Attack))
        
      }
    }
    
    if(num == "best" || num == "worst"){
    vector_hospital <- data_final[,2]
    return(vector_hospital[1])
    }

    return(data_final[num, 2])    
}
}