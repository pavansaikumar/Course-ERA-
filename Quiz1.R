zipcode_vlau <- function(lis){
  count = 0;
  i = 1;
  while(i < length(lis)){
    if(lis[i] == "21231")
    {
      count = count + 1;
    }
    i = i + 1;
  }
  count
}