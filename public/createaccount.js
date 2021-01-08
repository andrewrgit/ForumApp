var isCreatingAccount = false;
var createAccountBtn = document.getElementById("createAccountBtn");
var text = document.getElementById("responseText");
function createAccount(){
    if(isCreatingAccount) return;
    isCreatingAccount = true;
    createAccountBtn.classList.add("is-loading");
    
    username = document.getElementById("user").value
    password = document.getElementById("pass").value
    confirmedpass = document.getElementById("confirmedpass").value


    params = {
        "username": username,
        "password": password,
        "confirmedpass": confirmedpass}

    fetch("/api/createaccount",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)

    })
    .then(response => {
        return response.json();
    })
    .then(json => {
        console.log(json);
        isCreatingAccount = false;
        createAccountBtn.classList.remove("is-loading");
        if(json.success){
            text.innerText = "Account created successfully";
            text.classList.remove("has-text-danger");
            text.classList.add("has-text-success");
        }
        else{
            text.innerText = `Unable to create account: ${json.message}`;
            text.classList.remove("has-text-success");
            text.classList.add("has-text-danger");
        }
        
    })

}