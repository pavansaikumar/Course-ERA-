complete <-  function(directory, id = 1:332){
  specdatafiles <- as.character(list.files(directory), pattern = "*.csv")
  specdatapaths <- paste(directory, specdatafiles, sep="/")
  dframe <- data.frame()
  count_complete_files <- 0
  for(i in id){
    list_file <- read.csv(specdatapaths[i], header=T, sep=",")
    cleaned_files <- subset(list_file, (!is.na(list_file$Date) &!is.na(list_file$sulfate) & !is.na(list_file$nitrate) ))
    dframe <- rbind(dframe, c( i , nrow(cleaned_files)))
  }
  colnames(dframe) <- c("id", "records")
  dframe
}