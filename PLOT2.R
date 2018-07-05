png('plot2.png')
## Question 2
library(dplyr)

NEI <- readRDS("summarySCC_PM25.rds")
SCC <- readRDS("Source_Classification_Code.rds")

## Question 2
Baltimore_Data_NEI <- subset(NEI, fips == '24510')
total_Baltimore_emissions <- Baltimore_Data_NEI %>% group_by(year) %>% summarize(total_pm = sum(Emissions))
barplot(total_Baltimore_emissions$total_pm, xlab = "Year", 
ylab = "PM 2.5 Emissions", main = "Total PM 2.5 Emissions From Baltimore", names.arg = total_Baltimore_emissions$year)

## From the figure the baltimore emissions have gone down over all when compared from 1999 to 2008

dev.off()
