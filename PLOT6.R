## QUESTION 6
library(dplyr)
library(ggplot2)


NEI <- readRDS("summarySCC_PM25.rds")
SCC <- readRDS("Source_Classification_Code.rds")

LOS_ANGELS_NEI <-  subset(NEI, ((fips == "06037") &  (type == "ON-ROAD")))

total_losAngels_Emissions <- LOS_ANGELS_NEI %>% group_by(year) %>% summarize(total_pm = sum(Emissions))
total_losAngels_Emissions$CITY <- "LOS_ANGELES"


BALTIMORE_NEI <- subset(NEI, (fips == "24510") &  (type == "ON-ROAD"))
total_Baltimore_emissions <- BALTIMORE_NEI %>% group_by(year) %>% summarize(total_pm = sum(Emissions))
total_Baltimore_emissions$CITY <- "BALTIMORE"



COmbined_CITIES_NEI <- rbind(total_Baltimore_emissions, total_losAngels_Emissions)
head(COmbined_CITIES_NEI)

png("plot6.png")
ggplot(COmbined_CITIES_NEI, aes(x=factor(year), y=total_pm, fill=CITY)) +
  geom_bar(stat="identity") + 
  facet_grid(CITY  ~ ., scales="free") +
  ylab("total emissions (tons)") + 
  xlab("year") +
  ggtitle(expression("Motor vehicle emissions in Baltimore and Los Angeles"))
dev.off()

## FROM THE FIGURE WE CAN SEE THAT THE MOTOR VEHICLES USAGE IS LESS IN BALTIMORE WHEN COMPARED TO LOAS_ANGELES 
