import { apiKey } from "./apiKey.js";

const parameters = new URLSearchParams(window.location.search);
const idAlbum = parameters.get("idAlbum");
const apiUrl = "https://deezerdevs-deezer.p.rapidapi.com/album/" + idAlbum;
let duration = 0;

let playerPlaylist = [];
let songIndex = -1;
let isPlaying = false;
let firstTime = true;
let isAutoplayActive = false;
let lastVolume;
let isMuted = false;
// Funzione per ottenere la lista di playlist
async function getArtist() {
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
    console.log("Lista di playlist:", data);
    generateCardList(data);
    showArtist(data);
  } catch (error) {
    console.error("Si è verificato un errore:", error.message);
  }
}

const showArtist = (data) => {
  const titolo = document.getElementById("nomeArtista");
  const cover = document.getElementById("cover");
  const descriptionArtist = document.getElementById("descriptionArtist");
  console.log("cose");
  console.log(data);
  cover.innerHTML = `<img src="${data.cover_medium}">`;
  titolo.innerText = data.title;
  descriptionArtist.innerHTML = `
  <img src="${data.artist.picture_small}" class="rounded-pill" width="30px">
  <span class="h6">${data.artist.name} ° ${data.release_date} ° ${data.nb_tracks} brani °  durata ${new Date(
    duration * 1000
  ).toLocaleString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} </span>`;
  pickColor(data);
};

window.addEventListener("DOMContentLoaded", () => {
  const allSearchIcons = document.querySelectorAll(".searchButtonMenu");
  allSearchIcons.forEach((searchIcon) => {
    searchIcon.addEventListener("click", () => {
      localStorage.setItem("setSearchbar", "true");
      window.location.assign("./index.html");
    });
  });
  const playButton = document.getElementById("playButton");
  playButton.addEventListener("click", () => {
    if (firstTime) {
      firstTime = false;
      loadSongs(playerPlaylist[0]);
      playSong();
    } else {
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

  getArtist();
});

const generateCardList = (obj) => {
  const cardContainer = document.getElementById("Salvatore");
  const tracks = obj.tracks.data;
  cardContainer.innerHTML = "";
  console.log(tracks);
  for (let i = 0; i < tracks.length; i++) {
    let card = createCard(tracks[i], i + 1);
    cardContainer.appendChild(card);

    playerPlaylist.push(tracks[i]);
    console.log(playerPlaylist);
    duration += tracks[i].duration;
  }
};

const createCard = (obj, index) => {
  console.log(obj);
  const card = document.createElement("div");
  card.className = "row backgroundAlbum";
  card.addEventListener("click", () => {
    console.log(obj);
    loadSongs(obj);
    playSong();
  });

  const col8 = document.createElement("div");
  col8.className = "col text-light my-2";

  const flexContainer = document.createElement("div");
  flexContainer.className = "d-flex gap-2 align-items-center";

  const indexParagraph = document.createElement("p");
  indexParagraph.style.minWidth = "25px";
  indexParagraph.textContent = index;

  const img = document.createElement("img");
  img.setAttribute("aria-hidden", "false");
  img.setAttribute("draggable", "false");
  img.setAttribute("loading", "eager");
  img.src = obj.album.cover_small;
  img.alt = "";
  img.className = "mMx2LUixlnN_Fu45JpFB rkw8BWQi3miXqtlJhKg0 Yn2Ei5QZn19gria6LjZj";
  img.width = "40";
  img.height = "40";
  img.style.borderRadius = "4px";

  const titleParagraph = document.createElement("p");
  titleParagraph.textContent = obj.title;

  flexContainer.appendChild(indexParagraph);
  flexContainer.appendChild(img);
  flexContainer.appendChild(titleParagraph);

  col8.appendChild(flexContainer);

  const col2Rank = document.createElement("div");
  col2Rank.className = "col-md-2 text-light";

  const rankParagraph = document.createElement("p");
  rankParagraph.textContent = obj.rank.toLocaleString();
  rankParagraph.className = "d-none d-md-block";

  col2Rank.appendChild(rankParagraph);

  const col2Duration = document.createElement("div");
  col2Duration.className = "col-md-2 text-light";

  const durationParagraph = document.createElement("p");
  durationParagraph.textContent = new Date(obj.duration * 1000).toLocaleString("it-IT", {
    minute: "2-digit",
    second: "2-digit",
  });
  durationParagraph.className = "d-none d-md-block";

  col2Duration.appendChild(durationParagraph);

  card.appendChild(col8);
  card.appendChild(col2Rank);
  card.appendChild(col2Duration);

  return card;
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

  playerCover.src = songObj.album.cover_small;
  audio.src = songObj.preview;
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

const pickColor = (data) => {
  const colorThief = new ColorThief();

  const imageUrl = data.cover_medium;

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.addEventListener("load", async function () {
    try {
      const dominantColor = await colorThief.getColor(img);

      console.log("Colore Dominante:", dominantColor);

      createGradient(dominantColor);
    } catch (error) {
      console.error("Errore durante l'estrazione del colore:", error);
    }
  });

  img.src = imageUrl;
};

function createGradient(dominantColor) {
  const rgbaColor = `rgba(${dominantColor.join(", ")})`;

  const gradient = document.getElementById("sfondoAlbum");
  gradient.style.background = `linear-gradient(
    180deg,
    ${rgbaColor} 25%,
    rgba(0, 0, 0, 1) 100%
  )
`;
}
