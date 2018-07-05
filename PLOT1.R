NEI <- readRDS("summarySCC_PM25.rds")
SCC <- readRDS("Source_Classification_Code.rds")
png('plot1.PNG')
## Question 1
library(dplyr)


total_emissions <- NEI %>% group_by(year) %>% summarize(total_pm = sum(Emissions))
barplot(total_emissions$total_pm, xlab = "Year", 
ylab = "PM 2.5 Emissions", main = "Total PM 2.5 Emissions From all Sources", names.arg = total_emissions$year)

## From the Figure we can see that the pollution levels have gone Down from 1999 to 2008

dev.off()