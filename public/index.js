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
    let categories = document.getElementById("categories");
    json.forEach(category => {
        let template = document.getElementsByTagName("template")[0];
        let clone = document.importNode(template.content, true);

        let title = clone.getElementById("categoryTitle");
        title.innerText = category.name;
        title.setAttribute("href", `/category/${category.name}`);
        let description = clone.getElementById("categoryDescription");
        description.innerText = category.description;
        categories.appendChild(clone);
        
    })
}, reject => {
    let element = document.getElementById("categories");
    let errMsg = document.createElement("h1");
    errMsg.innerText = "You must be logged in to view categories";

    element.appendChild(errMsg);
})


