let diceValues = [];
let diceCount = 0;
let diceElements = [];

function generateDiceValues(total, count, min = 1, max = 6) {
  const minTotal = count * min;
  const maxTotal = count * max;
  if (total < minTotal || total > maxTotal) return null;

  const result = Array(count).fill(min);
  let remaining = total - minTotal;

  while (remaining > 0) {
    const i = Math.floor(Math.random() * count);
    if (result[i] < max) {
      result[i]++;
      remaining--;
    }
  }

  return result;
}

const targetTotal = parseInt(localStorage.getItem("targetTotal"), 10);
const maxDice = parseInt(localStorage.getItem("diceCount"), 10);

function createDice(value) {
  if (diceCount >= maxDice) return;

  diceValues.push(value);
  diceCount++;

  const outer = document.createElement("div");
  const animClass = Math.random() < 0.5 ? "rollin" : "rollin2";
  outer.className = `dice-wrapper-outer ${animClass}`;
  const shouldFlipText = animClass === "rollin";

  const wrapper = document.createElement("div");
  wrapper.className = "dice3d-wrapper";

  const cube = document.createElement("div");
  cube.className = "dice3d";

  const faces = ["front", "back", "right", "left", "top", "bottom"];
  faces.forEach((faceName) => {
    const div = document.createElement("div");
    div.className = `face ${faceName}`;
    div.dataset.face = faceName;

    const number = document.createElement("div");
    number.className = "number";
    number.textContent = value;

    div.appendChild(number);
    cube.appendChild(div);
  });

  cube.dataset.value = value;

  outer.addEventListener("click", () => {
    outer.classList.add("menghilang");
    setTimeout(() => {
      outer.remove();
      updateDiceLayout();
      updateTotalVisibility(); 
    }, 500);
  });

  wrapper.appendChild(cube);
  outer.appendChild(wrapper);
  document.getElementById("dice-container").appendChild(outer);
  updateDiceLayout();
  diceElements.push(cube);

  if (shouldFlipText) {
    cube.querySelectorAll(".face").forEach(f => f.classList.add("rotate-correct"));
  }

  cube.querySelectorAll('.number').forEach(f => f.classList.add("hide-text"));
  cube.style.transform = "rotateX(720deg) rotateY(720deg)";

  setTimeout(() => {
    const rotations = {
      1: "rotateX(0deg) rotateY(0deg)",
      2: "rotateX(-90deg) rotateY(0deg)",
      3: "rotateX(0deg) rotateY(90deg)",
      4: "rotateX(0deg) rotateY(-90deg)",
      5: "rotateX(90deg) rotateY(0deg)",
      6: "rotateX(0deg) rotateY(180deg)"
    };

    cube.style.transform = rotations[value];
    cube.dataset.value = value;

    function getRotationMatrix(el) {
      const style = window.getComputedStyle(el);
      const matrix = new DOMMatrixReadOnly(style.transform);
      return [
        matrix.m11, matrix.m12, matrix.m13,
        matrix.m21, matrix.m22, matrix.m23,
        matrix.m31, matrix.m32, matrix.m33
      ];
    }

    function updateLighting() {
      const m = getRotationMatrix(cube);
      const up = [0, 1, 0];
      let bestFace = null;
      let maxDot = -Infinity;

      const faceNormals = {
        front:  [ 0,  0,  1],
        back:   [ 0,  0, -1],
        right:  [ 1,  0,  0],
        left:   [-1,  0,  0],
        top:    [ 0,  1,  0],
        bottom: [ 0, -1,  0]
      };

      const faceElements = cube.querySelectorAll('.face');
      faceElements.forEach(face => {
        const normal = faceNormals[face.dataset.face];
        const nx = m[0]*normal[0] + m[1]*normal[1] + m[2]*normal[2];
        const ny = m[3]*normal[0] + m[4]*normal[1] + m[5]*normal[2];
        const nz = m[6]*normal[0] + m[7]*normal[1] + m[8]*normal[2];
        const dot = nx * up[0] + ny * up[1] + nz * up[2];

        if (dot > maxDot) {
          maxDot = dot;
          bestFace = face;
        }
      });

      faceElements.forEach(f => f.classList.remove('highlight'));
      if (bestFace) bestFace.classList.add('highlight');
    }

    setInterval(updateLighting, 1);

    setTimeout(() => {
      cube.querySelectorAll('.number').forEach(f => f.classList.remove("hide-text"));
          const totalNow = parseInt(document.getElementById("total")?.textContent?.replace(/[^\d]/g, '')) || 0;
    updateTotal(totalNow);
    updateTotalVisibility();
    
    }, 2000);
  }, 0);
}

document.getElementById("6").addEventListener("click", () => {
  if (diceCount >= maxDice) {
    alert("🎲 Semua dadu sudah ditambahkan");
    return;
  }

  const value = Math.floor(Math.random() * 6) + 1;
  createDice(value);
});

document.getElementById("roll-button").addEventListener("click", () => {
  const rereadTotal = parseInt(localStorage.getItem("targetTotal"), 10);
  const newValues = generateDiceValues(rereadTotal, diceElements.length);
  if (!newValues) {
    alert("❌ Tidak bisa menghasilkan total yang valid.");
    return;
  }

  newValues.forEach((newValue, index) => {
    const cube = diceElements[index];
    const outer = cube.closest(".dice-wrapper-outer");
    const animClass = Math.random() < 0.5 ? "lempar" : "lempar2";

    outer.classList.remove("lempar", "lempar2");
    void outer.offsetWidth;
    outer.classList.add(animClass);

    const shouldFlipText = animClass === "lempar";
    cube.querySelectorAll(".face").forEach(face => {
      face.classList.toggle("rotate-correct", shouldFlipText);
    });

    cube.querySelectorAll('.number').forEach(f => f.classList.add("hide-text"));
    cube.style.transition = "none";
    cube.style.transform = "rotateX(720deg) rotateY(720deg)";

    setTimeout(() => {
      cube.style.transition = "transform 2s ease";

      const rotations = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(-90deg) rotateY(0deg)",
        3: "rotateX(0deg) rotateY(90deg)",
        4: "rotateX(0deg) rotateY(-90deg)",
        5: "rotateX(90deg) rotateY(0deg)",
        6: "rotateX(0deg) rotateY(180deg)"
      };

      cube.style.transform = rotations[newValue];
      cube.dataset.value = newValue;

      cube.querySelectorAll(".number").forEach(n => n.textContent = newValue);

      setTimeout(() => {
        cube.querySelectorAll('.number').forEach(f => f.classList.remove("hide-text"));
        updateTotal();
        
      }, 2000);
    }, 50);
  });
});

function updateTotal(startFrom = 0) {
  const dice = document.querySelectorAll(".dice3d");
  let sum = 0;
  dice.forEach(c => {
    const val = parseInt(c.dataset.value, 10);
    if (!isNaN(val)) sum += val;
  });

  animateTotal(startFrom, sum, 100);
}


function animateTotal(from, to, duration) {
  const totalValueEl = document.getElementById("total-value");
  if (!totalValueEl) return;

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(from + (to - from) * progress);
    totalValueEl.textContent = value;

    // cek dan sesuaikan lebar box
    adjustTotalBoxWidth();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}




document.getElementById("roll-button").addEventListener("click", () => {
  const totalValueEl = document.getElementById("total-value");

  // reset langsung ke 0
  totalValueEl.textContent = "0";
  adjustTotalBoxWidth(); // <-- PENTING: cek ukuran box

  // setelah 1 detik baru animasi hitung
  setTimeout(() => {
    const result = getRandomDiceTotal(); // total hasil dadu
    animateTotal(0, result, 200); // animasi 0.2 detik
  }, 1300);
});


function adjustTotalBoxWidth() {
  const totalValueEl = document.getElementById("total-value");
  const totalBox = document.querySelector(".total1");

  if (!totalValueEl || !totalBox) return;

  const num = parseInt(totalValueEl.textContent, 10);

  if (!isNaN(num) && num >= 10) {
    // angka 2 digit atau lebih
    totalBox.style.width = "117px";
    totalBox.style.right = "3px"; 
  } else {
    // angka 0–9 balik ke semula
    totalBox.style.width = "97px";
    totalBox.style.right = "10px";
  }
}



function updateTotalVisibility() {
  const totalEl = document.querySelector(".total1");
  console.log("cek totalbg:", totalEl);
  if (!totalEl) return;

  const count = diceElements.length;
  console.log("jumlah dadu:", count);

  if (count === 3) {
    totalEl.classList.add("hidden");
  } else {
    totalEl.classList.remove("hidden");
  }
}



window.addEventListener("load", () => {
  // buat 1 dadu awal
  const initialValue = Math.floor(Math.random() * 6) + 1;
  createDice(initialValue);
  // cek ref hanya sekali saat load
  // load animasi 

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref && ref.trim() !== "" && isNaN(ref) && ref.length > 2) {
    const overlay = document.getElementById("page-overlay");
    overlay.style.display = "block";

    setTimeout(() => {
      document.getElementById("search-input").value = ref;
      overlay.style.display = "none";
    }, 200);
  }
});






function updateDiceLayout() {
  const spacingX = 120;
  const spacingY = 120;
  const dice = document.querySelectorAll(".dice-wrapper-outer");
  const centerX = 200;
   const total = dice.length;


if (document.querySelectorAll(".dice3d").length === 0) {
  document.getElementById("total-value").textContent = "0";
}







let scale = 1;

if (total === 1) scale = 1.0;
else if (total === 2) scale = 0.8;
else if (total === 3) scale = 0.7;
else if (total === 4) scale = 0.7;
else if (total === 5) scale = 0.7;
else if (total === 6) scale = 0.6;
else if (total === 7) scale = 0.5;
else if (total === 8) scale = 0.5;
else if (total === 9) scale = 0.5;


  dice.forEach((el, i) => {
    let x = 0, y = 0;
// Dadu ke-1
if (i === 0) {
  if (dice.length === 1) {
   //sendiri
    x = centerX - 50;
    y = spacingY - 40;
  } else if (dice.length === 2) {
    // Jika ada 2 dadu, dadu pertama di kiri
    x = centerX - 120;
    y = spacingY - 40;
  } else if (dice.length === 3) {
    // Jika ada 3 dadu, dadu pertama di kiri
    x = centerX - 120;
    y = spacingY - 100;
  }

   else if (dice.length === 4) {
    // Jika ada 4 dadu, dadu pertama di kiri
    x = centerX - 100;
    y = spacingY - 100;
  }

  else if (dice.length === 5) {
    // Jika ada 5 dadu, dadu pertama di kiri
    x = centerX - 140;
    y = spacingY - 100;
  }

   else if (dice.length === 6) {
    // Jika ada 6 dadu, dadu pertama di kiri
    x = centerX - 140;
    y = spacingY - 80;
  }

  else if (dice.length === 7) {
    // Jika ada 7 dadu, dadu pertama di kiri
    x = centerX - 140;
    y = spacingY - 105;
  }

  else if (dice.length === 8) {
    // Jika ada 8 dadu, dadu pertama di kiri
    x = centerX - 140;
    y = spacingY - 105;
  }

   else if (dice.length === 9) {
    // Jika ada 8 dadu, dadu pertama di kiri
    x = centerX - 140;
    y = spacingY - 105;
  }
}
// Dadu ke-2
else if (i === 1) {
    //dadu 2
  x = centerX + 30;
  if (dice.length === 3) {
    y = 20;
  } 
  //dadu 4
  else if (dice.length === 4) {
    y = spacingY - 100;
    x = centerX + 10;
  } else {
    y = 80; // default
  }
//dadu 5
  if (dice.length === 5) {
    x = centerX - 50;
    y = spacingY - 100;
  } 

  //dadu 6
  if (dice.length === 6) {
    x = centerX - 50;
    y = spacingY - 80;
  } 
//dadu 7
   if (dice.length === 7) {
    x = centerX - 50;
    y = spacingY - 105;
  } 

  //dadu 8
   if (dice.length === 8) {
    x = centerX - 50;
    y = spacingY - 105;
  } 

   //dadu 9
   if (dice.length === 9) {
    x = centerX - 50;
    y = spacingY - 105;
  } 
}

// Dadu ke-3
else if (i === 2) {
    //4 dadu
      if (dice.length === 4) {
        x = 100;
        y = 120;
      }
     //bawa 1 dan 2 
     else if  (dice.length === 3) {
        x = centerX -45;
        y = 150;
      }

 else  {
        x =  -5;
        y = 0;
      }

          //5 dadu
      if (dice.length === 5) {
        x = centerX +40;
    y = spacingY - 100;
      }

  //6 dadu
      if (dice.length === 6) {
        x = centerX +40;
    y = spacingY - 80;
      }
//dadu 7
  if (dice.length === 7) {
        x = centerX +40;
    y = spacingY - 105;
      }

      //dadu 8
  if (dice.length === 8) {
        x = centerX +40;
    y = spacingY - 105;
      }
//dadu 9
       if (dice.length === 9) {
        x = centerX +40;
    y = spacingY - 105;
      }

    } 

// Dadu ke-4
    else if (i === 3) {
      if (dice.length === 4) {
        x = centerX + 10;
        y = spacingY ;
      } else {
        // Dadu  di tengah antara dadu 1 dan 2
        x = centerX - 60;
        y = -30;
      }
//5 dadu
       if (dice.length === 5) {
        x = centerX + 0;
        y = spacingY -20;
      } 

      //6 dadu
       if (dice.length === 6) {
        x = centerX - 50;
        y = spacingY -10;
      } 
//dadu 7
       if (dice.length === 7) {
        x = centerX - 50;
        y = spacingY -30;
      } 

      //dadu 8
       if (dice.length === 8) {
        x = centerX - 50;
        y = spacingY -30;
      } 

      //dadu 9
       if (dice.length === 9) {
        x = centerX - 50;
        y = spacingY -30;
      } 

    } 
    // Dadu ke-5
    else if (i === 4) {
      // Dadu ke-5 di tengah antara dadu 2 dan 3
      x = centerX - 100;
      y = spacingY -20;

 //dadu 6
 if (dice.length === 6) {
        x = centerX -140;
        y = spacingY -10;
      } 
//dadu 7
      if (dice.length === 7) {
        x = centerX -140;
        y = spacingY -30;
      } 

      //dadu 8
      if (dice.length === 8) {
        x = centerX -140;
        y = spacingY -30;
      } 

         //dadu 9
      if (dice.length === 9) {
        x = centerX -140;
        y = spacingY -30;
      } 

    } 
// Dadu ke-6
 else if (i === 5) {
  x = centerX + 40;
  y = spacingY - 10;


// Dadu 7
if ( dice.length === 7) {
  x = centerX + 40;
  y = spacingY - 30;
}

// Dadu 8
if ( dice.length === 8) {
  x = centerX + 40;
  y = spacingY - 30;
}

// Dadu 9
if (dice.length === 9) {
  x = centerX + 40;
  y = spacingY - 30;
}

 }



//dadu ke 7
    if (i === 6) {
      // Dadu ke-6 di tengah antara dadu 2 dan 3
      x = centerX - 50;
      y = spacingY +40;


//dadu 8
    if (dice.length === 8) {
        x = centerX -90;
    y = spacingY + 40;
      }

//dadu 9
    if (dice.length === 9) {
        x = centerX -140;
    y = spacingY + 40;
      }

    }

     //daduke 8
    if (i === 7) {
      // Dadu ke-7 di tengah antara dadu 2 dan 3
      x = centerX -10;
      y = spacingY +40;

       if (dice.length === 9) {
        x = centerX -50;
    y = spacingY + 40;

    }
  }
     //daduke 9
    if (i === 8) {
      // Dadu ke-7 di tengah antara dadu 2 dan 3
      x = centerX +40;
      y = spacingY +40;
    }
    
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.querySelector(".dice3d-wrapper").style.transform = `scale(${scale})`;

  });
}

