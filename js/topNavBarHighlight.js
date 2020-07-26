if(!sessionStorage.lastlyVisited) {
    sessionStorage.lastlyVisited = 1;
}

function setToActiveOp() {
    document.getElementsByClassName("active").item(0).className="";
    document.getElementById("topNavOpinions").className = "active";
}
function setToActiveAddOp() {
    document.getElementsByClassName("active").item(0).className="";
    document.getElementById("topNavAddOpinion").className = "active";
}
function setToActiveArt() {
    document.getElementsByClassName("active").item(0).className="";
    document.getElementById("topNavArticles").className = "active";
}

function setToActiveHome() {
    document.getElementsByClassName("active").item(0).className="";
    document.getElementById("topNavHome").className = "active";
}

function setToActiveAddArt(){
    document.getElementsByClassName("active").item(0).className="";
    document.getElementById("topNavAddArt").className = "active";
}

function incLastlyVisited(){
    sessionStorage.lastlyVisited = parseInt(sessionStorage.lastlyVisited) + 1;
}

function decLastlyVisited() {
    sessionStorage.lastlyVisited = parseInt(sessionStorage.lastlyVisited) - 1;
}