function OnClickTest(){

    var isLoggingIn = false;
    username = document.getElementById("user").value
    password = document.getElementById("pass").value

    params = {
        "username": username,
        "password": password}

    fetch("/api/login",{
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
        if(json.success){
            document.location.href = "/";
        }
        else{
            text.innerText = `Unable to login: ${json.message}`;
            text.classList.remove("has-text-success");
            text.classList.add("has-text-danger");
        }
    })

}