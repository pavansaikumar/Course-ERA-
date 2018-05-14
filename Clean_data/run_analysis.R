#First move all the files you want to work on in to one single directory

#Step 1: Merge the training and test data sets to create one data set

#read test data
subject_testData <- read.table("Subject_test.txt")
X_testData <- read.table("X_test.txt")
y_testData <- read.table("y_test.txt")

#read training data
subject_trainData <- read.table("Subject_train.txt")
X_trainData <- read.table("X_train.txt")
y_trainData <- read.table("y_train.txt")


#read the features 
features_dataNames <- read.table("features.txt")


#naming the columns and combinig the data
names(subject_testData) <- "Subjest_ID"
names(X_testData) <- features_dataNames$V2
names(y_testData) <- "acitivity_IDs"

names(subject_trainData) <- "Subjest_ID"
names(X_trainData) <- features_dataNames$V2
names(y_trainData) <- "acitivity_IDs"

test_data <- cbind(subject_testData, X_testData, y_testData)
train_data <- cbind(subject_trainData, X_trainData, y_trainData)

Combined_data <- rbind(test_data, train_data)

#Extract only the mean and standard deviation for each measurement
mean_std_colums <- grepl("mean()|std()", names(Combined_data))# Gives a logical vector of TRUE or FALSE

mean_std_colums[1:2] <- TRUE # making thr first two columns to true

## Remove the columns if they are not wanted.
Combined_data <- Combined_data[, mean_std_colums]


## STEP 3: Use the descriptive activity names to name the activities in the data set.
## STEP 4: Appropriately labels the data set with descriptive activity names.

Combined_data$acitivity_IDs <- factor(Combined_data$acitivity_IDs, labels = c("Walking","Walking Upstairs", "Walking Downstairs", "Sitting", "Standing", "Laying"))

# These are used for the step 5
library(reshape2)
library(tidyr)

# Creating a second data set with the average of ecg variable for each activity 
# and each subject


modified_melted_data <- melt(Combined_data, id = c("Subjest_ID", "acitivity_IDs"))
tidy_data <- dcast(modified_melted_data, Subjest_ID+acitivity_IDs ~ variable, mean)

#Output a tidy data set
write.csv(tidy_data, "tidy.csv", row.names = FALSE)























