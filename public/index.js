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

async function getTopics(categoryName){

    try{
        let data = await fetch(`/api/topics/${categoryName}`)
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

async function getPosts(topicName){

    try{
        let data = await fetch(`/api/posts/${topicName}`)
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

async function displayPosts(topicName){
    try{
        const postsJson = await getPosts(topicName);

        let posts = document.getElementById("content");
        posts.innerHTML = "";

        postsJson.forEach(post => {
            console.log(post);
            let template = document.getElementsByTagName("template")[1];
            let clone = document.importNode(template.content, true);
    
            let username = clone.getElementById("username");
            username.innerText = post.accountsUsername

            let postContent = clone.getElementById("topicTitle");
            postContent.innerText = post.title
            posts.appendChild(clone);
            
        })
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

async function displayTopics(categoryName){
    try{
        const postsJson = await getTopics(categoryName);

        let topics = document.getElementById("content");
        topics.innerHTML = "";

        postsJson.forEach(topic => {
            console.log(topic);
            let template = document.getElementsByTagName("template")[1];
            let clone = document.importNode(template.content, true);
    
            let username = clone.getElementById("username");
            username.innerText = topic.accountsUsername

            let postContent = clone.getElementById("topicTitle");
            postContent.innerText = topic.title
            topics.appendChild(clone);
            
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
        title.setAttribute("onClick", `displayTopics("${category.name}")`);
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


