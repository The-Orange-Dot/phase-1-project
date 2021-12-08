document.addEventListener("DOMContentLoaded", init);

function init() {
  initSearchBar();
  initThesaurusSearchBar();
  loadSearchHist();
  loadRandomDef();
  initClearHist();
}

function loadRandomDef() {
  fetch('https://random-word-api.herokuapp.com/word?number=1') 
  .then(resp => resp.json()) 
  .then(word => {

    getDefinition(word, false).then(wordOk => {
      console.log('then: ', wordOk)
      if(!wordOk) {
        loadRandomDef();
      }
    })
  })
}

function initSearchBar() {
  const searchForm = document.querySelector("#search-form");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    getDefinition(searchForm.querySelector("#word-search").value, true);
    e.target.reset();
  });
}

function initThesaurusSearchBar() {
  const searchForm = document.querySelector("#t-search-form");
  const thesList = document.querySelector("#synonym-list");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    thesList.innerHTML = "";
    loadSynonyms(searchForm.querySelector("#t-word-search").value);
    e.target.reset();
  });

}


function getDefinition(word, updateDom) {
  return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((resp) => resp.json())
    .then((wordInfo) => {
      if (wordInfo.message === "Sorry pal, we couldn't find definitions for the word you were looking for.") {
        if(updateDom) {
          document.querySelector("#word-def-list").innerHTML = "";
          document.querySelector("#word-value").textContent = wordInfo.message;
        }
        return false;
      } else {
        newSearch(wordInfo);
        postSearchHistory(wordInfo);
        return true;
      }
    })
    .catch((error) => error.message);
}

function newSearch(wordInfo) {
  const wordDefList = document.querySelector("#word-def-list");
  wordDefList.innerHTML = "";


  wordInfo.forEach((word) => loadWord(word));
}

function loadWord(wordInfo) {
  const meaningsArray = wordInfo.meanings;
  const wordValue = document.querySelector("#word-value");
  const wordDefList = document.querySelector("#word-def-list");

  wordValue.textContent = wordInfo.word;

  const wordOrigin = document.createElement('h4');
  wordOrigin.textContent = `Origin: ${wordInfo.origin}`;
  
  wordDefList.appendChild(wordOrigin);
  meaningsArray.forEach((meaning) => {
    const partOfSpeech = document.createElement("h5");
    partOfSpeech.textContent = meaning.partOfSpeech;
    wordDefList.appendChild(partOfSpeech);
    loadDef(meaning);
  });
}

function loadDef(meaning) {
  const wordDefList = document.querySelector("#word-def-list");

  meaning.definitions.forEach((def) => {
    const newDef = document.createElement("li");
    newDef.textContent = def.definition;
    wordDefList.appendChild(newDef);
  });
}

function addSearchHist(wordInfo) {
  const searchList = document.querySelector("#search-hist-list");
  const newWord = document.createElement("li");

  newWord.textContent = wordInfo[0].word;
  newWord.classList.add("history-li");
  newWord.addEventListener("click", () => newSearch(wordInfo));
  searchList.appendChild(newWord);
}

function loadSynonyms(word) {
  const wordValue = document.querySelector("#t-word-value");
  const wordSynList = document.querySelector("#synonym-list");

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((resp) => resp.json())
    .then((wordInfo) => {

      if (
        wordInfo.message ===
        "Sorry pal, we couldn't find definitions for the word you were looking for."
      ) {
        wordSynList.innerHTML = "";
        wordValue.textContent = "Well I'll be damned, we couldn't find the word you were looking for.";
      } else {
      // if (
      //   wordInfo[0].meanings[0].definitions[0].synonyms.length === 0
      //   ) {
      //   wordSynList.innerHTML = "";
      //   wordValue.textContent = "Well I'll be damned, we couldn't find any synonyms for the word you were looking for.";
      //   } else {
      wordValue.textContent = word;
      wordInfo.forEach(word => {
        word.meanings.forEach(meaning => {
          meaning.definitions.forEach((def) => {
            def.synonyms.forEach(synonym => { 
              const eachSynonym = document.createElement("li");
              eachSynonym.textContent = synonym;
              eachSynonym.classList.add("syn-list-item");
              wordSynList.appendChild(eachSynonym);

              eachSynonym.addEventListener("click", () => {
              getDefinition(eachSynonym.textContent, true);
            });
          });
        })
      })
      //}
    });
  }

    if(!wordSynList.hasChildNodes()) {
      wordSynList.innerHTML = "";
      wordValue.textContent = "Well I'll be damned, we couldn't find any synonyms for the word you're looking for.";
    }

  });
}

function postSearchHistory(wordInfo) {
  const word = wordInfo[0].word;

  fetch("http://localhost:3000/words/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({[wordInfo[0].word]: wordInfo}),
  })
    .then((resp) => resp.json())
    .then(wordObj => {
      addSearchHist(wordObj[word])
    })
    .catch((error) => error.message);
}

function loadSearchHist() {
  fetch("http://localhost:3000/words")
    .then((resp) => resp.json())
    .then((words) => {
      console.log(words)
      words.forEach((word) => {
        console.log(Object.keys(word)[0]);
        addSearchHist(word[Object.keys(word)[0]]);
      })
    });
}

function initClearHist() {
  const searchList = document.querySelector("#search-hist-list");
  const clearBtn = document.querySelector("#clear-hist-btn");

  clearBtn.addEventListener("click", () => {
    searchList.innerHTML = "";
    fetch("http://localhost:3000/words")
    .then(resp => resp.json())
    .then(words => {
      words.forEach(word => {
      deleteWord(word.id)
      })
    })
  })
}

function deleteWord(id) {
  fetch(`http://localhost:3000/words/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}

// const getPicture = (wordInfo) => {
//   fetch(
//     `https://www.brandonfowler.me/gimgapi/?q=dog&num=10&size=&color=&reuse=&type=&time=&format=read/1/`,
//     {}
//   )
//     .then((res) => res.json())
//     .then((img) => console.log(img));
// };

// getPicture();
