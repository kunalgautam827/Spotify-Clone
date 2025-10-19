let currentSong = new Audio();
let songs;
let currentFolder;
let tempFolder;
document.querySelector(".range input").value=currentSong.volume*100;


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

async function getSongs(folder) {
  folder=decodeURIComponent(folder)
  
  currentFolder = folder;
  
  tempFolder = folder // add decode uri component latter;
  

  let a = await fetch(`/${folder}`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    
    if (decodeURIComponent(element.href).endsWith(".mp3")) {
      
      
      tempFolder = decodeURIComponent(currentFolder);
     
      songs.push(decodeURIComponent(element.href).split(`${tempFolder}`)[1]);
    }
  }

  // display all songs in playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Host By-Kunal</div>
        </div>
        <div class="playnow">
          <div class="divider"></div>
          <span>Play Now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>`;
  }

  // attach click to play song
  let songsArray = Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  );
  songsArray.forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "0:00/0:00";
};

// display albums
async function displayAlbums() {
  let a = await fetch(`\\songs\\`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
    if (decodeURIComponent(e.href).includes("\\songs\\")) {
      let folder = decodeURIComponent(
         e.href.split("songs")[1]
      );      
      folder = folder.replace("/","\\");
      
      try {
        let a = await fetch(`\\songs\\${folder}\\info.json`);
        let response = await a.json();

        cardContainer.innerHTML += `
          <div data-folder="songs${folder}" class="card">
            <button class="play">
              <svg viewBox="0 0 24 24">
                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path>
              </svg>
            </button>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.discription || response.description || ""}</p>
          </div>`;
      } catch (err) {
        console.warn("Missing info.json in", folder);
      }
    }
  }

  // load playlist when card clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      
      songs = await getSongs(`${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  const play = document.getElementById("play");
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");

  // load first folder automatically
  songs = await getSongs("songs\\diljit dosanjh\\");
  playMusic(songs[0], true);

  // show all albums
  displayAlbums();

  // play/pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // update time + seekbar
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // seekbar click
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // hamburger open/close
  document.querySelector(".hamburger").addEventListener("click", () => {
    
    const left = document.querySelector(".left");
    left.style.left = left.style.left === "0px" ? "-110%" : "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(decodeURIComponent(currentSong.src).split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  // next
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(decodeURIComponent(currentSong.src).split("/").slice(-1)[0]);
    
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // auto next song
  currentSong.onended = () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  };

  // volume control
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (e.target.value == "0") {
      document.querySelector(".volume>img").src = "img/mute.svg";
    } else {
      document.querySelector(".volume>img").src = "img/volume.svg";
    }
  });

  // mute/unmute
  let vol
  document.querySelector(".volume>img").addEventListener("click", (e) => {
     
    if (e.target.src.includes("volume.svg")) {
      vol = currentSong.volume;      
      e.target.src = "img/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = "img/volume.svg";
      currentSong.volume = vol;

      document.querySelector(".range input").value = vol*100;
    }
  });

  //  search bar filter
  const searchInput = document.querySelector(".search-bar input");
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const songListItems = document.querySelectorAll(".songList ul li");

    songListItems.forEach((item) => {
      const songName = item
        .querySelector(".info div")
        .textContent.toLowerCase();
      item.style.display = songName.includes(query) ? "flex" : "none";
    });
  });

  document.querySelector(".search-bar input").addEventListener("click",()=>{
    document.querySelector(".hamburger").click();

  })

  // keyboard shortcuts
  window.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT") return;
    const isShift = event.shiftKey;

    if (event.code === "Space") {
      event.preventDefault();
      play.click();
    } else if (isShift && event.code === "ArrowRight") {
      next.click();
    } else if (isShift && event.code === "ArrowLeft") {
      previous.click();
    } else if (event.code === "ArrowRight") {
      currentSong.currentTime += 5;
    } else if (event.code === "ArrowLeft") {
      currentSong.currentTime -= 5;
    } else if (event.code === "AudioVolumeUp") {
      if(currentSong.volume<=.98){
        currentSong.volume += 0.02;
        document.querySelector(".range input").value = currentSong.volume * 100;
      }
    } else if (event.code === "AudioVolumeDown") {

      if(currentSong.volume>=.02){
      currentSong.volume -= 0.02;
      document.querySelector(".range input").value = currentSong.volume * 100;
      }
    } else if (event.code === "AudioVolumeMute") {
      document.querySelector(".volume>img").click();
    }
  });
}

main();
