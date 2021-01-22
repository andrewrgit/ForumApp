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

async function getPosts(topicId){

    try{
        let data = await fetch(`/api/posts/${topicId}`)
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

async function displayPosts(topicId, topicTitle){
    try{
        const postsJson = await getPosts(topicId);

        let posts = document.getElementById("content");
        posts.innerHTML = "";

        let mainTitle = document.getElementById("mainTitle");
        mainTitle.innerText = `${topicTitle}`

        postsJson.forEach(post => {
            console.log(post);
            let template = document.getElementsByTagName("template")[2];
            let clone = document.importNode(template.content, true);
    
            let username = clone.getElementById("postUsername");
            username.innerText = `Username: ${post.accountsUsername}`

            let postContent = clone.getElementById("postContent");
            postContent.innerText = post.postContent
            posts.appendChild(clone);
            
        })

        let createPostTemplate = document.getElementsByTagName("template")[3];
        let clone = document.importNode(createPostTemplate.content, true);
        clone.getElementById("createpostButton").setAttribute("onClick", `createPost(${topicId})`);

        posts.appendChild(clone);
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

        let mainTitle = document.getElementById("mainTitle");
        mainTitle.innerText = `${categoryName} Topics`

        postsJson.forEach(topic => {
            console.log(topic);
            let template = document.getElementsByTagName("template")[1];
            let clone = document.importNode(template.content, true);
    
            let username = clone.getElementById("username");
            username.innerText = topic.accountsUsername

            let topicTitle = clone.getElementById("topicTitle");
            topicTitle.innerText = topic.title
            topicTitle.setAttribute("onClick", `displayPosts(${topic.topicId}, "${topic.title}")`)
            topics.appendChild(clone);
        
        })

        let createTopicTemplate = document.getElementsByTagName("template")[4];
        let clone = document.importNode(createTopicTemplate.content, true);
        clone.getElementById("createTopicButton").setAttribute("onClick", `createTopic("${categoryName}")`);

        topics.appendChild(clone);
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

async function createTopic(categoryName){
    let textArea = document.getElementById("topicTextarea");
    try{
        let data = await fetch(`/api/createtopic/${categoryName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "title": textArea.value
            })
        });
        if(data.status != 200){
            return Promise.reject();
        }   
        let json = await data.json();
        displayTopics(categoryName);
        return json;
    }
    catch(err){
        console.log(err);
        throw err;
    }
    
}

async function createPost(topicId){
    let textArea = document.getElementById("postTextarea");
    try{
        let data = await fetch(`/api/createpost/${topicId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "post_content": textArea.value,
                "topicId": topicId
            })
        });
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


