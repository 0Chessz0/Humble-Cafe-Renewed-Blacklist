async function loadBlacklist() {
  try {
    const res = await fetch("blacklist/index.json");
    const { users } = await res.json();

    let allUsers = [];
    for (let username of users) {
      try {
        let data = await fetch(`blacklist/${username}/user.json`).then(r => r.json());
        data.folder = username;
        data.avatarUrl = `blacklist/${username}/pfp.png`; // use local avatar
        allUsers.push(data);
      } catch (e) {
        console.error(`Error loading ${username}:`, e);
      }
    }

    window.allUsers = allUsers;
    sortAndDisplay("date");
  } catch (err) {
    console.error("Error loading index.json", err);
  }
}

function displayUsers(users) {
  const grid = document.getElementById("userGrid");
  grid.innerHTML = "";
  
  users.forEach(user => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <img class="avatar" src="${user.avatarUrl}" alt="Avatar">
      <h2>${user.username}</h2>
      <p><b>Status:</b> ${user.status}</p>
      <p><b>Reason:</b> ${user.shortReason}</p>
      <p><b>Date:</b> ${user.date}</p>
    `;
    tile.onclick = () => showDetails(user);
    grid.appendChild(tile);
  });
}

function showDetails(user) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");

  let proofs = "";
  if (user.proof && user.proof.length) {
    proofs = `
      <h3>Proof</h3>
      <div class="proof-buttons">
        ${user.proof.map((img, idx) => `
          <button onclick="showProof('blacklist/${user.folder}/proof/${img}')">
            📎 Proof ${idx + 1}
          </button>
        `).join("")}
      </div>
    `;
  }

  content.innerHTML = `
    <div style="text-align:center">
      <img class="avatar-large" src="${user.avatarUrl}" alt="Avatar">
      <h2>${user.username}</h2>
    </div>
    <p><b>User ID:</b> ${user.userId}</p>
    <p><b>Status:</b> ${user.status}</p>
    <p><b>Moderator:</b> ${user.moderator}</p>
    <p><b>Date:</b> ${user.date}</p>
    <p><b>Short Reason:</b> ${user.shortReason}</p>
    <p><b>Detailed Reason:</b> ${user.longReason}</p>
    ${proofs}
    <button onclick="closeModal()">Close</button>
  `;
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function showProof(src) {
  const proofModal = document.getElementById("proofModal");
  const proofImage = document.getElementById("proofImage");
  proofImage.src = src;
  proofImage.classList.remove("zoomed"); // reset zoom state
  proofModal.style.display = "flex";
}

function closeProof() {
  document.getElementById("proofModal").style.display = "none";
}

// Toggle zoom when clicking on the proof image
document.getElementById("proofImage").addEventListener("click", function() {
  this.classList.toggle("zoomed");
});

document.getElementById("searchBox").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  displayUsers(window.allUsers.filter(u =>
    u.username.toLowerCase().includes(query)
  ));
});

document.getElementById("sortSelect").addEventListener("change", e => {
  sortAndDisplay(e.target.value);
});

function sortAndDisplay(type) {
  let sorted = [...window.allUsers];
  if (type === "username") {
    sorted.sort((a,b) => a.username.localeCompare(b.username));
  } else if (type === "status") {
    sorted.sort((a,b) => a.status.localeCompare(b.status));
  } else {
    sorted.sort((a,b) => new Date(b.date) - new Date(a.date));
  }
  displayUsers(sorted);
}

window.onclick = event => {
  if (event.target === document.getElementById("modal")) closeModal();
  if (event.target === document.getElementById("proofModal")) closeProof();
};

loadBlacklist();
