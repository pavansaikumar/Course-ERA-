png('plot3.png')

## Question 3
library(ggplot2)

NEI <- readRDS("summarySCC_PM25.rds")
SCC <- readRDS("Source_Classification_Code.rds")
Baltimore_Data_NEI <- subset(NEI, fips == '24510')


Gplot_BAL <- ggplot(Baltimore_Data_NEI,aes(factor(year),Emissions,fill=type)) +
  geom_bar(stat="identity") +
  theme_bw() + guides(fill=FALSE)+
  facet_grid(.~type,scales = "free",space="free") + 
  labs(x="year", y=expression("Total PM"[2.5]*" Emission")) + 
  labs(title=expression("PM"[2.5]*" Baltimore Emissions From1999-2008 by The Type of Source"))


print(Gplot_BAL)
## From the Figure we can see that Non-Road, Non-Point, ON-ROAD All seen decreased emissions from 1999-2008
## ONLY thing that got increased is POINT until 2005 and then decreased but when compared to 1999 it decreased 
dev.off()
