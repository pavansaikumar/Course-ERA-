best <- function(state, outcome) {
  data_outcome <- read.csv("outcome-of-care-measures.csv", na.strings = "Not Available")
  data_outcome <- subset(data_outcome, is.na(NA) == "TRUE")
  data_split <- subset(data_outcome, data_outcome$State == state,  is.na(NA) == "TRUE")
  if(outcome == 'heart attack' || outcome =='pneumonia' || outcome == 'heart failure')
  {
    if(outcome == 'pneumonia')
    {
      data_final <- arrange(data_split, Hospital.30.Day.Death..Mortality..Rates.from.Pneumonia)
    }
    else if(outcome == 'heart attack')
    {
      data_final <- arrange(data_split, Hospital.30.Day.Death..Mortality..Rates.from.Heart.Attack)
    }
  }
  vector_hospital <- data_final[,2]
  vector_hospital[1]
}  