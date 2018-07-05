png('plot4.PNG')
library(ggplot2)

## Question 4

NEI <- readRDS("summarySCC_PM25.rds")
SCC <- readRDS("Source_Classification_Code.rds")

Combustion_and_Coal <- grepl("Fuel Comb.*Coal", SCC$EI.Sector)
Combustion_Coal_SCC <- SCC[Combustion_and_Coal,]

TOTAL_EMISSIONS_FOR_COMB_COAL_NEI <- NEI[NEI$SCC %in% Combustion_Coal_SCC$SCC, ]

pl <- ggplot(TOTAL_EMISSIONS_FOR_COMB_COAL_NEI,aes(factor(year),Emissions)) +
  geom_bar(stat="identity", fill = "grey") +
  theme_bw() + guides(fill=FALSE)+
  labs(x="year", y=expression("Total PM"[2.5]*" Emission")) + 
  labs(title=expression("PM"[2.5]*" COAL COMBUSTION SOURCES FROM 1999-2008 IN USA"))

print(pl)

## Emissions of Coal have decreased from 1999 to 2008 by seeing the figure
dev.off()
