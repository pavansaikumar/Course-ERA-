pollutatmean <- function(directory, pollutant, id = 1:332){
  mean_polldata <- c()
  specdatafiles <- as.character(list.files(directory), pattern = "*.csv")
  specdatapaths <- paste(directory, specdatafiles, sep="/")
  for(i in id) 
  {
    curr_file <- read.csv(specdatapaths[i], header=T, sep=",")
    head(curr_file)
    pollutant
    remove_na <- curr_file[!is.na(curr_file[, pollutant]), pollutant]
    mean_polldata <- c(mean_polldata, remove_na)
  }
  {
    mean_results <- mean(mean_polldata)
    return(round(mean_results, 3))
  }
}
