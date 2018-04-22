function login(){

	this.PersonPicture = document.getElementsById('User-Picture');
	this.PersonName = document.getElementsById('User-Name');
	this.signInButton = document.getElementById('Sign-in');
    this.signOutButton = document.getElementById('Sign-out');
}

login.prototype.signIn = function() {
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

login.prototype.signOut = function() {
    this.auth.signOut();
};

login.prototype.onAuthStateChanged = function(user-name){
	// Get the profile picture
if(user-name){
	var profilePicUrl = user.photoURL;
    var userName = user.displayName; 

this.PersonPicture.style.backgroundImage  =  'url(' + profilePicUrl + ')';
this.PersonName.textContent =  userName;


	this.PersonName.removeAttribute('hidden');
    this.PersonPicture.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    this.signInButton.setAttribute('hidden', 'true');

}else{
	this.PersonName.setAttribute('hidden', 'true');
    this.PersonPicture.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    this.signInButton.removeAttribute('hidden');

}

}