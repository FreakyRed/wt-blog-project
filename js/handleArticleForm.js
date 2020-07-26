function showFileUpload() {
    document.getElementById("fsetFileUpload").classList.remove("hiddenElm");
    document.getElementById("btShowFileUpload").classList.add("hiddenElm");
}

function cancelFileUpload() {
    document.getElementById("fsetFileUpload").classList.add("hiddenElm");
    document.getElementById("btShowFileUpload").classList.remove("hiddenElm");
}

function uploadImage(serverUrl) {
    const files = document.getElementById("flElm").files;

    if (files.length > 0) {
        const imgLinkElement = document.getElementById("imageLink");
        const fieldSetElement = document.getElementById("fsetFileUpload");
        const btShowFileUploadElement = document.getElementById("btShowFileUpload");

        let imgData = new FormData();
        imgData.append("file", files[0]);

        const postRequestSettings = {
            method: 'POST',
            body: imgData
        };

        fetch(`${serverUrl}/fileUpload`, postRequestSettings)
            .then(response => {
                return (response.ok) ? response.json() :
                    Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            })
            .then(responseJSON => {
                imgLinkElement.value = responseJSON.fullFileUrl;
                btShowFileUploadElement.classList.remove("hiddenElm");
                fieldSetElement.classList.add("hiddenElm");
            })
            .catch(error => {
                window.alert(`Image uploading failed. ${error}.`);
            })
    } else {
        window.alert("Please, choose an image file.");
    }
}

function processArtEditFrmData(event, articleId, offset, totalCount, serverUrl) {
    event.preventDefault();

    let articleData = getElementsFromFormArt();
    articleData = checkValidityForm(articleData);
    console.log(articleData);

    const putRequestSettings = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf8',
        },
        body: JSON.stringify(articleData)
    };

    fetch(`${serverUrl}/article/${articleId}`, putRequestSettings)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
            window.alert("Successfully updated the article")
        })
        .catch(error => {
            window.alert(`Failed to update the article on the server. ${error}`);
        })
        .finally(
            () => window.location.hash = `#article/${articleId}/${offset}/${totalCount}`);
}

function processArtInsertFrmData(event,url,articlesPerPage) {
    event.preventDefault();

    let articleData = getElementsFromFormArt();
    articleData = checkValidityForm(articleData);
    let responseArticleData = {};
    let metaDataOffset;
    let metaDataTotal;

    console.log(articleData);


    const postRequestSettings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf8'
        },
        body: JSON.stringify(articleData)
    };

    articlesPerPage = parseInt(articlesPerPage);

    let serverUrl = `${url}/article/`;
    fetch(serverUrl)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.resolve(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON =>{
            metaDataOffset = responseJSON.meta.offset;
            metaDataTotal = responseJSON.meta.totalCount;

            metaDataTotal = Math.ceil(parseInt(metaDataTotal) / articlesPerPage);
            metaDataOffset = (parseInt(metaDataOffset) === 0) ? 1 : (parseInt(metaDataOffset) / articlesPerPage) + 1;
            return fetch(serverUrl,postRequestSettings);
        })
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.resolve(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON =>{
            responseArticleData = responseJSON;
            window.alert("Your article was added sucessfully.");
            return responseArticleData;
        })
        .catch(err => {
            window.alert(`Failed to add your article.${err}`);
        })
        .finally(() =>
        {
            window.location.hash =
                `#article/${responseArticleData.id}/${metaDataOffset}/${metaDataTotal}`;
});
}

function getElementsFromFormArt(){
    return {
        title: document.getElementById("title").value.trim(),
        content: document.getElementById("content").value.trim(),
        author: document.getElementById("author").value.trim(),

        imageLink: document.getElementById("imageLink").value.trim(),
        tags: document.getElementById("tags").value.trim()
    };
}

function checkValidityForm(articleData){
    if (!articleData.author) {
        articleData.author = "Anonymous";
    }

    if (!articleData.imageLink) {
        delete articleData.imageLink;
    }

    if (!articleData.tags) {
        delete articleData.tags;
    } else {
        articleData.tags = articleData.tags.split(",")
            .map(tag => tag.trim())
            .filter(tag => tag);

        if (articleData.tags.length === 0) {
            delete articleData.tags;
        }
    }

    return articleData;
}



