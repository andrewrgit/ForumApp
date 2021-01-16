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

async function getPosts(categoryName){

    try{
        let data = await fetch(`/api/posts/${categoryName}`)
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

async function displayPosts(categoryName){
    try{
        const postsJson = await getPosts(categoryName);

        let posts = document.getElementById("content");
        posts.innerHTML = "";

        postsJson.forEach(post => {
            console.log(post);
            let template = document.getElementsByTagName("template")[1];
            let clone = document.importNode(template.content, true);
    
            let username = clone.getElementById("username");
            username.innerText = post.accountsUsername

            let postContent = clone.getElementById("postContent");
            postContent.innerText = post.postContent
            posts.appendChild(clone);
            
        })
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

getCategories()
.then(json => {
    let categories = document.getElementById("content");
    categories.innerHTML = "";
    json.forEach(category => {
        let template = document.getElementsByTagName("template")[0];
        let clone = document.importNode(template.content, true);

        let title = clone.getElementById("categoryTitle");
        title.innerText = category.name;
        title.setAttribute("onClick", `displayPosts("${category.name}")`);
        let description = clone.getElementById("categoryDescription");
        description.innerText = category.description;
        categories.appendChild(clone);
        
    })
}, reject => {
    let element = document.getElementById("content");
    let errMsg = document.createElement("h1");
    errMsg.innerText = "You must be logged in to view categories";

    element.appendChild(errMsg);
})


