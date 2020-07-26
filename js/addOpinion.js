function processFormData(event) {
    event.preventDefault();

    const allElements = document.getElementById("form");

    let formGender;
    const radioElements = document.getElementsByName("gender");

    for (let i = 0; i < radioElements.length; i++) {
        if (radioElements[i].checked) {
            formGender = radioElements[i].value;
        }
    }

    const opinionName = allElements.elements[0].value.trim();
    const opinionEmail = allElements.elements[1].value.trim();
    const opinionText = allElements.elements.namedItem("opinion").value.trim();
    const opinionKeywords = allElements.elements.namedItem("favEsport").value.trim();

    if (opinionName == "" || opinionEmail == "" || opinionText == "") {
        return;
    }

    if (!allElements.elements[0].validity.valid || !allElements.elements[1].validity.valid ||
        !allElements.elements.namedItem("opinion").validity.valid) {
        return;
    }

    let urlImage = allElements.elements[2].value.trim();

    if (urlImage == "") {
        urlImage = "https://style.anu.edu.au/_anu/4/images/placeholders/person.png";
    }

    const newOpinion = {
        name: opinionName,
        email: opinionEmail,
        url: urlImage,
        esportRelated: allElements.elements[3].checked,
        comment: opinionText,
        gender: formGender,
        keywords: opinionKeywords
    };

    postToBack4App(newOpinion);
    console.log(newOpinion);

    allElements.reset();
    window.location.hash = "#opinions";
    setToActiveOp();
}

function postToBack4App(body) {
    let back4AppUrl = "https://parseapi.back4app.com/classes/opinions";

    let postRequestSettings = {
        headers: {
            "X-Parse-Application-Id": "JFhlrQ9wYzNqtQRpIL7RqoXbc0BW8GToAKKDyCa2",
            "X-Parse-REST-API-Key": "V9dUlJ0mAt3lhSqHLxVk8cKJIu13PalYLIFmUrjD",
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify(body)
    };

    fetch(back4AppUrl, postRequestSettings)
        .then(response => {
            return (response.ok) ? response.json() :
                Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
            console.log(responseJSON);
        })
        .then(() => window.location.hash = "#opinions")
        .catch(err => {
            window.alert(`Failed to add your article.${err}`);
        })

}


function removeOlderComments(event) {
    event.preventDefault();
    let opinions = [];

    if (localStorage.esportsWorldComments) {
        opinions = JSON.parse(localStorage.esportsWorldComments);
    }
    let filteredOpinions = opinions.filter(op => (Date.now() - new Date(op.created)) >= 86400000);
    localStorage.esportsWorldComments = JSON.stringify(filteredOpinions);
    document.getElementById("router-view").innerHTML =
        Mustache.render(document.getElementById("template-opinions").innerHTML, filteredOpinions);
}

function showSuccess() {
    let messageContainer = document.querySelector("#message + span.success");
    messageContainer.textContent = "Your entry has been sucessfully sent";
}
