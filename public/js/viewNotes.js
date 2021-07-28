let googleUser;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUser = user;
      getNotes()
    } else {
      window.location = 'index.html'; // If not logged in, navigate back to login page.
    }
  });
};

const getNotes = () => {
    console.log('getting notes for', googleUser.uid);

    const label = document.querySelector('#labelInput').value;

    let notesRef = firebase.database().ref(`users/${googleUser.uid}`)
    if (label !== "") {
        // https://stackoverflow.com/questions/40471284/firebase-search-by-child-value
        notesRef = notesRef.orderByChild('label').equalTo(label) 
    }

    notesRef.on('value', (db) => {
        const data = db.val();
        renderData(data);
    })
}

const renderData = (data) => {
    console.log(data);
    // Clear notes element
    document.querySelector('#app').innerHTML = "";

    for (const dataId in data) {
        const note = data[dataId];
        const columnEl = dynamicRenderCard(note);
        document.querySelector('#app').appendChild(columnEl)
    }
}

const renderCard = (note) => {
    // convert a note to html and return it
    return `
        <div class="column is-one-quarter">
            <div class="card">
                <header class="card-header">
                    <span class="card-header-title">${ note.title }</span>
                </header>
                <div class="card-content">
                    <div class="content">${ note.text }</div>
                </div>
            </div>
        </div>
    `
}

const dynamicRenderCard = (note) => {
    const columnEl = document.createElement('div')
    columnEl.className = 'column is-half'
    
    const cardEl = document.createElement('div')
    cardEl.className = 'card'
    cardEl.style.backgroundColor = `hsl(${getRandomColor()}, 100%, 90%)`
    // cardEl.style.color = 'white'

    // Header element
    const headerEl = document.createElement('header')
    headerEl.className = 'card-header'
    const spanEl = document.createElement('span')
    spanEl.className = 'card-header-title'
    spanEl.innerText = note.title
    const labelSpan = document.createElement('span')
    labelSpan.className = 'tag is-primary'
    labelSpan.innerText = note.label
    headerEl.appendChild(spanEl)
    headerEl.appendChild(labelSpan)

    // Content element
    const cardContentEl = document.createElement('div')
    cardContentEl.className = 'card-content'
    const contentEl = document.createElement('div')
    contentEl.className = 'content'
    contentEl.innerText = note.text
    cardContentEl.appendChild(contentEl)

    // Footer element
    const cardFooterEl = document.createElement('footer')
    cardFooterEl.className = 'card-footer'
    const nameSpan = document.createElement('span')
    nameSpan.className = 'card-footer-item'
    nameSpan.innerText = googleUser.displayName
    const emailSpan = document.createElement('span')
    emailSpan.className = 'card-footer-item'
    emailSpan.innerText = googleUser.email
    cardFooterEl.appendChild(nameSpan)
    cardFooterEl.appendChild(emailSpan)

    cardEl.appendChild(headerEl)
    cardEl.appendChild(cardContentEl)
    cardEl.appendChild(cardFooterEl)
    columnEl.appendChild(cardEl)

    return columnEl;
}

// https://css-tricks.com/snippets/javascript/random-hex-color/
const getRandomColor = () => {
    return Math.floor(Math.random()*360);
}