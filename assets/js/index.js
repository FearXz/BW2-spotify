import { apiKey } from "./apiKey.js";
let arrayDiId = [
  81763, 420041687, 6364781, 69319552, 1238967, 521266992, 128938202, 401889417, 350417267, 508204251, 299319,
  228423362,
];
let playerPlaylist = [];
let songIndex = -1;
let isPlaying = false;
let isAutoplayActive = false;
let lastVolume;
let isMuted = false;

async function getPlaylists(value, container, cardType) {
  const apiUrl = "https://deezerdevs-deezer.p.rapidapi.com/search?q=" + value;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
        "X-RapidAPI-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.statusText}`);
    }

    const data = await response.json();
    generateCardList(data, container, cardType);
  } catch (error) {
    console.error("Si è verificato un errore:", error.message);
  }
}
let searchBarIsActive = false;
window.addEventListener("DOMContentLoaded", () => {
  let timer;

  document.getElementById("progressBar").value = 0;

  const searchBar = document.getElementById("searchBar");
  searchBar.addEventListener("input", () => {
    let valueSearched = searchBar.value;
    if (searchBar.value == "") {
      getPlaylists("power wolf", "buonPomeriggio", "small");
      return;
    }
    clearTimeout(timer);

    timer = setTimeout(() => {
      getPlaylists(valueSearched, "buonPomeriggio", "small");
    }, 1000);
  });
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", () => {
    toggleSearchBar();
  });

  const playButton = document.getElementById("playButton");
  playButton.addEventListener("click", () => {
    if (playerPlaylist.length != 0) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong();
      }
    }
  });

  const prevButton = document.getElementById("prevButton");
  prevButton.addEventListener("click", prevSong);

  const nextButton = document.getElementById("nextButton");
  nextButton.addEventListener("click", nextSong);

  const audio = document.getElementById("audio");
  audio.addEventListener("timeupdate", updateProgress);

  const progressBar = document.getElementById("progressBar");
  progressBar.addEventListener("input", setProgress);

  const volumeBar = document.getElementById("volumeBar");
  volumeBar.addEventListener("input", setVolume);

  const playerAutoplay = document.getElementById("playerAutoplay");
  playerAutoplay.addEventListener("click", (event) => {
    if (!isAutoplayActive) {
      isAutoplayActive = !isAutoplayActive;
      event.currentTarget.classList.remove("text-secondary");
      event.currentTarget.classList.add("text-success");
    } else {
      isAutoplayActive = !isAutoplayActive;
      event.currentTarget.classList.remove("text-success");
      event.currentTarget.classList.add("text-secondary");
    }
  });

  const playerMute = document.getElementById("playerMute");
  playerMute.addEventListener("click", () => {
    const audio = document.getElementById("audio");
    const mutedIcon = document.getElementById("muteIcon");
    if (isMuted) {
      isMuted = !isMuted;
      audio.volume = lastVolume;
      mutedIcon.classList.remove("text-danger");
      mutedIcon.classList.add("text-secondary");
    } else {
      isMuted = !isMuted;
      lastVolume = audio.volume;
      audio.volume = 0;
      mutedIcon.classList.remove("text-secondary");
      mutedIcon.classList.add("text-danger");
    }
  });

  checkSearchBarStatus();

  heroFetch(randomNumber());

  getPlaylists("power wolf", "buonPomeriggio", "small");
  getPlaylists("linkin park", "ascoltatiDiRecente", "large");
  getPlaylists("Saboton", "iTuoiMix", "large");
  getPlaylists("woodkid", "popolare", "large");
  getPlaylists("drake", "tendenze", "large");
});

const generateCardList = (arrayObj, container, cardType) => {
  const cardContainer = document.getElementById(container);
  cardContainer.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    let card = createCard(arrayObj.data[i], cardType);
    cardContainer.appendChild(card);
  }
};

const createCard = (obj, cardType) => {
  if (cardType == "small") {
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-lg-4";

    const innerDiv1 = document.createElement("div");
    innerDiv1.className = "card mb-3 customCard border-0";

    const innerDiv2 = document.createElement("div");
    innerDiv2.className = "row g-0";

    const imgDiv = document.createElement("div");
    imgDiv.className = "fix-h-80 fix-w-80";

    const img = document.createElement("img");
    img.src = obj.album.cover;
    img.className = "img-fluid rounded-start";
    img.alt = "...";

    const playImg = document.createElement("img");
    playImg.src = "./assets/imgs/play-fill.svg";
    playImg.className = "position-absolute positionCustom";

    playImg.addEventListener("click", () => {
      console.log(obj);
      loadSongs(obj);
      playSong();
    });

    const textDiv = document.createElement("div");
    textDiv.className = "col bg-darkgray rounded-end";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body ";

    const cardTitle = document.createElement("h6");
    cardTitle.className = "card-title m-0 max-h-40   overflow-hidden";

    const titleLink = document.createElement("a");
    titleLink.href = `./album.html?idAlbum=${obj.album.id}`;
    titleLink.className = "text-white";
    titleLink.textContent = obj.album.title;

    cardTitle.appendChild(titleLink);

    imgDiv.appendChild(img);
    imgDiv.appendChild(playImg);

    textDiv.appendChild(cardBody);
    cardBody.appendChild(cardTitle);

    innerDiv2.appendChild(imgDiv);
    innerDiv2.appendChild(textDiv);

    innerDiv1.appendChild(innerDiv2);

    card.appendChild(innerDiv1);

    return card;
  } else if (cardType == "large") {
    const card = document.createElement("div");
    card.className = "col-6 col-sm-4 col-md-4 col-xxl-2 pb-2 ";

    const innerCard = document.createElement("div");
    innerCard.className = "card customCard bg-darkgray border-0";

    const dFlexContainer = document.createElement("div");
    dFlexContainer.className = "d-flex justify-content-center align-item-center position-relative";

    const imgAlbumCover = document.createElement("img");
    imgAlbumCover.src = obj.album.cover;
    imgAlbumCover.className = "card-img-top max-h-180 object-fit-cover mx-2 mt-2 rounded";
    imgAlbumCover.alt = "...";

    const playImg = document.createElement("img");
    playImg.src = "./assets/imgs/play-fill.svg";
    playImg.className = "position-absolute positionCustom";
    playImg.addEventListener("click", () => {
      loadSongs(obj);
      playSong();
    });

    dFlexContainer.appendChild(imgAlbumCover);
    dFlexContainer.appendChild(playImg);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body  fix-h-100";

    const cardTitle = document.createElement("h6");
    cardTitle.className = "card-title overflowCustom max-h-5x fs-6";

    const titleLink = document.createElement("a");
    titleLink.href = `./album.html?idAlbum=${obj.album.id}`;
    titleLink.className = "text-white";
    titleLink.textContent = obj.album.title;

    cardTitle.appendChild(titleLink);

    const cardText = document.createElement("p");
    cardText.className = "card-text fs-8";

    const artistLink = document.createElement("a");
    artistLink.href = `./artist.html?idArtist=${obj.artist.name}&idAlbum=${obj.album.id}`;
    artistLink.className = "customColorA";
    artistLink.textContent = obj.artist.name;

    cardText.appendChild(artistLink);

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);

    innerCard.appendChild(dFlexContainer);
    innerCard.appendChild(cardBody);

    card.appendChild(innerCard);

    return card;
  }
};

function toggleSearchBar() {
  const searchBar = document.getElementById("searchBar");
  searchBarIsActive = !searchBarIsActive;

  if (searchBarIsActive) {
    searchBar.classList.remove("d-md-none");
  } else {
    searchBar.classList.add("d-md-none");
  }
}

async function heroFetch(random) {
  try {
    const response = await fetch("https://deezerdevs-deezer.p.rapidapi.com/album/" + random, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
        "X-RapidAPI-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Lista di playlist:", data);
    showHero(data);
  } catch (error) {
    console.error("Si è verificato un errore:", error.message);
  }
}

const showHero = (data) => {
  const fotoHero = document.getElementById("albumImg");
  const albumTitle = document.getElementById("albumTitle");
  const artist = document.getElementById("albumArtist");
  const artist2 = document.getElementById("albumArtist2");
  const linkArtista = document.getElementById("paginaArtista");
  const linkArtista2 = document.getElementById("paginaArtista2");
  linkArtista2.href = `./artist.html?idArtist=${data.artist.name}&idAlbum=${data.id}`;
  linkArtista.href = `./artist.html?idArtist=${data.artist.name}&idAlbum=${data.id}`;
  const linkAlbum = document.getElementById("paginaAlbum");
  linkAlbum.href = `./album.html?idAlbum=${data.id}`;
  fotoHero.src = data.cover_medium;
  albumTitle.innerText = data.title;
  artist.innerText = data.artist.name;
  artist2.innerText = data.artist.name;

  const heroButton = document.getElementById("heroButton");
  heroButton.addEventListener("click", () => {
    loadSongs(data);
    playSong();
  });
};
function checkSearchBarStatus() {
  const searchKey = localStorage.getItem("setSearchbar");
  if (searchKey == "true") {
    toggleSearchBar();
    localStorage.setItem("setSearchbar", "false");
  }
}

const randomNumber = () => {
  let number;
  number = Math.floor(Math.random() * arrayDiId.length);
  return arrayDiId[number];
};

function loadSongs(songObj) {
  if (!playerPlaylist.includes(songObj)) {
    playerPlaylist.push(songObj);
    songIndex = playerPlaylist.length - 1;
    console.log(playerPlaylist);
  } else {
    songIndex = playerPlaylist.indexOf(songObj);
  }
  setTimeout(() => {
    const progressBar = document.getElementById("progressBar");
    progressBar.value = 0;
  }, 1);
  setTimeout(() => {
    const playerDuration = document.getElementById("playerDuration");
    const audio = document.getElementById("audio");
    playerDuration.innerText = audio.currentTime;
  }, 1);
  console.log(songObj);
  const songTitle = document.getElementById("playerSongTitle");
  const artistName = document.getElementById("playerArtistName");
  const playerCover = document.getElementById("playerCover");
  const audio = document.getElementById("audio");
  songTitle.innerText = songObj.title;
  artistName.innerText = songObj.artist.name;
  if (songObj.hasOwnProperty("album")) {
    playerCover.src = songObj.album.cover_small;
    audio.src = songObj.preview;
  } else {
    playerCover.src = songObj.cover_small;
    audio.src = songObj.tracks.data[0].preview;
  }
}
function playSong() {
  if (!isPlaying) {
    isPlaying = !isPlaying;
  }

  const audio = document.getElementById("audio");
  const playPauseButton = document.getElementById("playPauseIcon");

  playPauseButton.classList.remove("bi-play-circle-fill");
  playPauseButton.classList.add("bi-pause-circle-fill");

  audio.play();
}
function pauseSong() {
  if (isPlaying) {
    isPlaying = !isPlaying;
  }

  const audio = document.getElementById("audio");

  const playPauseButton = document.getElementById("playPauseIcon");
  playPauseButton.classList.remove("bi-pause-circle-fill");
  playPauseButton.classList.add("bi-play-circle-fill");

  audio.pause();
}
function nextSong() {
  if (playerPlaylist.length == 0) {
    return;
  }
  songIndex++;
  if (songIndex > playerPlaylist.length - 1) {
    songIndex = 0;
  }
  console.log(songIndex);
  loadSongs(playerPlaylist[songIndex]);
  playSong();
}
function prevSong() {
  if (playerPlaylist.length == 0) {
    return;
  }
  songIndex--;
  if (songIndex < 0) {
    songIndex = playerPlaylist.length - 1;
  }
  console.log(songIndex);
  loadSongs(playerPlaylist[songIndex]);
  playSong();
}
function updateProgress(event) {
  const progressBar = document.getElementById("progressBar");
  let duration = event.currentTarget.duration;
  let currentTime = event.currentTarget.currentTime;

  const progressPercent = (currentTime / duration) * 100;
  progressBar.value = progressPercent;
  const playerCurrentTime = document.getElementById("playerCurrentTime");
  const playerDuration = document.getElementById("playerDuration");
  playerCurrentTime.innerHTML = Math.floor(currentTime);
  playerDuration.innerHTML = Math.floor(duration);
  if (progressBar.value == 100) {
    if (isAutoplayActive) {
      nextSong();
    } else {
      setTimeout(() => {
        pauseSong();
      }, 200);
    }
  }
}
function setProgress(event) {
  let audio = document.getElementById("audio");
  let selectedTime = (event.currentTarget.value / 100) * audio.duration;
  audio.currentTime = selectedTime;
}
function setVolume() {
  const volumeBar = document.getElementById("volumeBar");
  const audio = document.getElementById("audio");
  const mutedIcon = document.getElementById("muteIcon");
  isMuted = false;
  audio.volume = volumeBar.value / 100;
  lastVolume = audio.volume;
  mutedIcon.classList.remove("text-danger");
  mutedIcon.classList.add("text-secondary");
}
