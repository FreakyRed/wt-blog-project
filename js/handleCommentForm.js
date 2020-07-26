function processCommentFrmData(event, articleId) {
    event.preventDefault();

    let commentData = getElementsFromFormComment();
    console.log(commentData);

    if(commentData.author === "" || commentData.text ===""){
        return;
    }

    const postRequestSettings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf8',
        },
        body: JSON.stringify(commentData)
    };

    let url = `https://wt.kpi.fei.tuke.sk/api/article/${articleId}/comment`;

    fetch(url, postRequestSettings)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
            window.location.hash = `#artComment/${articleId}/0`;
        })
        .catch(error => {
            window.alert(`Failed to add your comment to the article. ${error}`);
        });
}

function getElementsFromFormComment() {
    return {
        author: document.getElementById("commentAuthor").value.trim(),
        text: document.getElementById("commentText").value.trim(),
    };
}