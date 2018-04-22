main_helper <- function(X){
   i = 0;
   for(i in length(X)){
     if(X[i] == ""){
       X[i] = NA;
     }
   }
   return(X)
}