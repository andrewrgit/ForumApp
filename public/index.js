async function getCategories(){

    try{
        let data = await fetch("/api/categories");
        if(data.status != 200){
            return Promise.reject();
        }   
        let json = await data.json();
        return json;
    }
    catch(err){
        console.log(err);
        throw err;
    }

}

getCategories()
.then(json => {
    let element = document.getElementById("categories");
    json.forEach(category => {
        let childCategory = document.createElement("div");
        childCategory.setAttribute("class", "category");

        let childCatTitle = document.createElement("a")
        childCatTitle.innerText = category["name"];

        let childCatTitleWrapper = document.createElement("h1");
        childCatTitleWrapper.appendChild(childCatTitle);

        let childCatDescription = document.createElement("h5");
        
        childCategory.appendChild(childCatTitleWrapper);
        childCategory.appendChild(childCatDescription);

        element.appendChild(childCategory);
        
    })
}, reject => {
    let element = document.getElementById("categories");
    let errMsg = document.createElement("h1");
    errMsg.innerText = "You must be logged in to view categories";

    element.appendChild(errMsg);
})


