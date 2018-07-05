
png('plot5.png')
library(ggplot2)

## Question 5


NEI <- readRDS("summarySCC_PM25.rds")
SCC <- readRDS("Source_Classification_Code.rds")

Motor_Vehicles <- grepl("vehicle", SCC$SCC.Level.Two, ignore.case = TRUE)
Motor_Vehicles_SCC <- SCC[Motor_Vehicles, ]
Motor_Vehicles_NEI <- NEI[NEI$SCC %in% Motor_Vehicles_SCC$SCC, ]

Baltimore_Vehicles_NEI <- Motor_Vehicles_NEI[Motor_Vehicles_NEI$fips=="24510",]

pl <- ggplot(Baltimore_Vehicles_NEI,aes(factor(year),Emissions)) +
  geom_bar(stat="identity", fill = "grey") +
  theme_bw() + guides(fill=FALSE)+
  labs(x="year", y=expression("Total PM"[2.5]*" Emission")) + 
  labs(title=expression("PM"[2.5]*" BALTIMORE MOTOR VEHICLES EMISSIONS FROM 1999-2008 IN USA"))

print(pl)

## From 1999 to 2008 MOTOR VEHICLES EMISSIONS HAVE GONE DOWN IN BALTIMORE CITY

dev.off()
