let burgerMenu = document.getElementById("burger");
let navbarMenu = document.getElementById("navbarMenu");
burgerMenu.addEventListener("click", () => {
    navbarMenu.classList.toggle("is-active");
})
console.log("log");


var logoutDebounce = false;
function logout(){
    if(logoutDebounce) return;
    logoutDebounce = true;
    fetch("/api/logout", {
        method: "POST"
    })
    .then(data => {
        return data.json();
    })
    .then(json => {
        logoutDebounce = false;
        if(json.success){
            document.location.href = "/";
        }
        else{
            console.log(json.message);
        }
    })
}