let articlesPerPage = 20;
let commentPerPage = 10;
if (!sessionStorage.lastlyVisited) {
    sessionStorage.lastlyVisited = 1;
}
let totalCount = 0;
getTotalCount();
renderSetupForArticles();

export default [
    {
        hash: "home",
        target: "router-view",
        getTemplate: targetElm =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-home").innerHTML
    },
    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: addOpinion
    },
    {
        hash: "opinions",
        target: "router-view",
        getTemplate: displayUserOpinions
    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },
    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: addArticle
    },
    {
        hash: "artComment",
        target: "commentSection",
        getTemplate: fetchAndDisplayComments
    },
    {
        hash: "addComment",
        target: "commentSection",
        getTemplate: addComment
    }
]

function addOpinion(targetElm) {
    let signedIn = auth2.isSignedIn.get();
    let formData = {
        name: signedIn ? auth2.currentUser.get().getBasicProfile().getName() : ""
    };
    renderIntoTemplate(targetElm,"template-addOpinion",formData);
}

function addArtDetailLink2ResponseJson(responseJSON) {
    let numberOfPages = Math.ceil(parseInt(responseJSON.meta.totalCount) / articlesPerPage);
    let offset = parseInt(responseJSON.meta.offset);
    let currentPage = (offset === 0) ? 1 : (offset / articlesPerPage) + 1;
    responseJSON.articles = responseJSON.articles.map(
        article => (
            {
                ...article,
                detailLink: `#article/${article.id}/${currentPage}/${numberOfPages}`,
            }
        )
    );
}

const urlBase = "https://wt.kpi.fei.tuke.sk/api";

function fetchAndDisplayArticles(targetElm, totalCountFromHash) {

    let currentPage = parseInt(sessionStorage.lastlyVisited);
    let offset = (currentPage === 1) ? 0 : (articlesPerPage * (currentPage - 1));

    const totalCount = Number(totalCountFromHash);

    let urlQuery = "";

    urlQuery = (offset && totalCount) ? `?offset=${offset}&max=${articlesPerPage}` : `?max=${articlesPerPage}`;

    const url = `${urlBase}/article${urlQuery}`;
    let articleList = [];

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            addArtDetailLink2ResponseJson(responseJSON);
            return responseJSON;
        })
        .then(responseJSON => {
            articleList = responseJSON.articles;
            return Promise.resolve();
        })
        .then(() => {
            articleList.dataForRendering = getNextAndPreviousPage();
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    articleList
                );
        })
        .catch(error => {
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

    renderSetupForArticles();
}

function getNextAndPreviousPage() {
    let current = parseInt(sessionStorage.lastlyVisited);

    const dataForRendering = {
        currentPage: current,
        totalPages: Math.ceil(totalCount / articlesPerPage)
    };

    if (current > 1) {
        dataForRendering.previousPage = current - 1;
    }

    if (totalCount > articlesPerPage * current) {
        dataForRendering.nextPage = current + 1;
    } else {
        delete dataForRendering.nextPage;
    }
    return dataForRendering;
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, false);
}

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, forEdit) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    if (forEdit) {
        fetch(url)
            .then(response => {
                return (response.ok) ? response.json() :
                    Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            })
            .then(responseJSON => {
                responseJSON.formTitle = "Article Edit";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle = "Save article";
                responseJSON.urlBase = urlBase;
                responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
                renderIntoTemplate(targetElm, "template-article-form", responseJSON);
            }).catch(error => {
            const errMsgObj = {errMessage: error};
            renderIntoTemplate(targetElm, "template-articles-error", errMsgObj);
        });
    } else {
        fetch(url)
            .then(response => {
                return (response.ok) ? response.json() :
                    Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }).then(responseJSON => {
            responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
            responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
            responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

            renderIntoTemplate(targetElm, "template-article", responseJSON);
            return responseJSON;
        })
            .then(() => fetchAndDisplayComments(targetElm, artIdFromHash, 0, commentPerPage))
            .catch(error => {
                const errMsgObj = {errMessage: error};
                renderIntoTemplate(targetElm, "template-articles-error", errMsgObj);
            });
    }
}

function fetchAndDisplayComments(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    let metaURL = (offsetFromHash) ? `?offset=${offsetFromHash}&max=${commentPerPage}`
        : `?max=${commentPerPage}`;
    let commentURL = `${urlBase}/article/${artIdFromHash}/comment/${metaURL}`;
    fetch(commentURL)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
            let totalComments = responseJSON.meta.totalCount;
            getPrevAndNextComments(responseJSON, artIdFromHash, offsetFromHash, totalComments);
            responseJSON.artID = artIdFromHash;
            responseJSON.addComment = `#addComment/${artIdFromHash}/${offsetFromHash}/${totalComments}`;
            renderIntoTemplate("commentSection", "template-article-comment", responseJSON);
        }).catch(error => {
        const errMsgObj = {errMessage: error};
        renderIntoTemplate(targetElm, "template-articles-error", errMsgObj);
    });
}

function getPrevAndNextComments(page, artIdFromHash, offsetFromHash, totalComments) {
    offsetFromHash = Number(offsetFromHash);
    totalComments = Number(totalComments);

    if (offsetFromHash - commentPerPage >= 0) {
        let prevOffset = offsetFromHash - commentPerPage;
        page.prevComment = `#artComment/${artIdFromHash}/${prevOffset}/${totalComments}`;
    } else {
        delete page.prevComment;
    }

    if (offsetFromHash + commentPerPage <= totalComments) {
        let nextOffset = offsetFromHash + commentPerPage;
        page.nextComment = `#artComment/${artIdFromHash}/${nextOffset}/${totalComments}`;
    } else {
        delete page.nextComment;
    }

}

function addComment(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    let commentSection = {
        backLink: `#artComment/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`,
        artID: artIdFromHash
    };
    let signedIn = auth2.isSignedIn.get();
    commentSection.commentAuthor = signedIn ? auth2.currentUser.get().getBasicProfile().getName() : "";

    renderIntoTemplate(targetElm, "template-comment-form", commentSection);
}


function getTotalCount() {
    const url = "https://wt.kpi.fei.tuke.sk/api/article";
    fetch(url)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
                totalCount = responseJSON.meta.totalCount;
                return Promise.resolve();
            }
        ).catch(err => {
        const errMsgObj = {errMessage: err};
        console.log(errMsgObj);
    });
}

function displayUserOpinions(targetElm) {
    let opinions = [];
    let urlBack4App = "https://parseapi.back4app.com/classes/opinions";

    let getRequestSettings = {
        headers: {
            "X-Parse-Application-Id": "JFhlrQ9wYzNqtQRpIL7RqoXbc0BW8GToAKKDyCa2",
            "X-Parse-REST-API-Key": "V9dUlJ0mAt3lhSqHLxVk8cKJIu13PalYLIFmUrjD",
            "Content-Type": "application/json"
        },
        method: 'GET'
    };

    fetch(urlBack4App, getRequestSettings)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
            opinions = responseJSON.results;
            renderIntoTemplate(targetElm, "template-opinions", opinions);
        })
        .catch(error => {
            const errMsgObj = {errMessage: "There are no opinions to be displayed..."};
            renderIntoTemplate(targetElm, "template-articles-error", errMsgObj);
        });
}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, true);
}

function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    const deleteRequestSettings = {
        method: 'DELETE'
    };

    let urlServer = `${urlBase}/article/${artIdFromHash}`;
    fetch(urlServer, deleteRequestSettings)
        .then(response => {
                return (response.ok) ? {} :
                    Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        )
        .then(() => {
            let template = {};
            template.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
            renderIntoTemplate(targetElm, "template-article-delete", template);
        })
        .catch(error => {
            const errObjMsg = {errMessage: error};
            renderIntoTemplate(targetElm, "template-articles-error", errObjMsg);
        });
}

function addArticle(targetElm) {
    let formData = {
        formTitle: "Add article",
        submitBtTitle: "Add article",
        formSubmitCall: `processArtInsertFrmData(event,'${urlBase}','${articlesPerPage}')`
    };
    let signedIn = auth2.isSignedIn.get();
    formData.author = signedIn ? auth2.currentUser.get().getBasicProfile().getName() : "";
    renderIntoTemplate(targetElm, "template-article-form", formData);
}

function renderIntoTemplate(targetElement, template, objToRender) {
    document.getElementById(targetElement).innerHTML =
        Mustache.render(document.getElementById(template).innerHTML, objToRender);
}

function renderSetupForArticles() {
    let totalPages = Math.ceil(totalCount / articlesPerPage);
    document.getElementById("topNavArticles").href = `#articles/${sessionStorage.lastlyVisited}/${totalPages}`;
}
