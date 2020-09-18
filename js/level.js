let mode = document.getElementById("select-mode").value
if (mode === "js/levelNormal.js"){
  mode = String.raw `js/levelNormal.js`
}else {
  mode = String.raw`js/levelSurvival.js`
}

<script src= "${mode}"></script>