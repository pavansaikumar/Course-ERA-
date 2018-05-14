This code book gives a detailed explanation of the process required to create the tidy data set.

Details about the data files are as follows:

features.txt: Names of the 561 features.

activity_labels.txt: Names and IDs for each of the 6 activities.

subject_train.txt: A vector of 7352 integers, denoting the ID of the volunteer related to each of the observations in X_train.txt.
X_train.txt: 7352 observations of the 561 features, for 21 of the 30 volunteers.
y_train.txt: A vector of 7352 integers, denoting the ID of the activity related to each of the observations in X_train.txt.

subject_test.txt: A vector of 2947 integers, denoting the ID of the volunteer related to each of the observations in X_test.txt.
X_test.txt: 2947 observations of the 561 features, for 9 of the 30 volunteers.
y_test.txt: A vector of 2947 integers, denoting the ID of the activity related to each of the observations in X_test.txtX_test.txt: 2947 observations of the 561 features, for 9 of the 30 volunteers.

Steps for the analysis:

Merges the training and the test sets to create one data set.
Extracts only the measurements on the mean and standard deviation for each measurement.
Uses descriptive activity names to name the activities in the data set
Appropriately labels the data set with descriptive variable names.
From the data set in step 4, creates a second, independent tidy data set with the average of each variable for each activity and each subject
