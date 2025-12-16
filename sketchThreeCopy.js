
const CHANNEL_SLUG = "type-logo-u3uywzkpvvc";
const API_URL = `https://api.are.na/v2/channels/${CHANNEL_SLUG}?per=200`;


let blocks = [];
let arenaImages = [];

let font;

let rawOutlinePoints = [];
let textPoints = [];

let compressionSlider;
let compressionAmount = 0;


function preload() {
  font = loadFont(
    "ABCFavorit-Regular-Trial.otf",
    () => console.log("FONT LOADED"),
    () => console.error("FONT FAILED TO LOAD")
  );
}


function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  pixelDensity(window.devicePixelRatio);

  fetchArenaBlocks();

  // Compression slider (open ↔ tight)
  compressionSlider = createSlider(0, 1, 0, 0.01);
  compressionSlider.position(20, height - 40);
  compressionSlider.style("width", "200px");
}


function fetchArenaBlocks() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      blocks = data.contents || [];

      
      arenaImages = blocks.filter(b =>
        b.class === "Image" &&
        b.image &&
        b.image.thumb &&
        b.image.thumb.url
      );

      
      arenaImages.forEach(block => {
        block.p5img = loadImage(block.image.thumb.url);
      });

      generateTextPoints();
    })
    .catch(err => console.error("Are.na fetch error:", err));
}


function generateTextPoints() {
  rawOutlinePoints = [];
  textPoints = [];

  const textString = "Are.na";
  const fontSize = min(width * 0.8, height * 0.4);

  const bounds = font.textBounds(textString, 0, 0, fontSize);
  const x = width / 2 - bounds.w / 2;
  const y = height / 2;

  rawOutlinePoints = font.textToPoints(
    textString,
    x,
    y,
    fontSize,
    {
      sampleFactor: 0.05,
      simplifyThreshold: 0
    }
  );

  console.log("RAW OUTLINE POINTS:", rawOutlinePoints.length);
}


function updateVisiblePoints() {
  textPoints = [];

  if (!rawOutlinePoints.length) return;

  compressionAmount = compressionSlider.value();

  const minDots = max(20, arenaImages.length);
  const maxDots = rawOutlinePoints.length;

  const dotCount = floor(
    lerp(minDots, maxDots, compressionAmount)
  );

  const step = rawOutlinePoints.length / dotCount;

  for (let i = 0; i < rawOutlinePoints.length; i += step) {
    const p = rawOutlinePoints[floor(i)];
    if (p) textPoints.push(p);
  }
}


function draw() {
  background(255);

  updateVisiblePoints();

  imageMode(CENTER);
  noStroke();

  for (let i = 0; i < textPoints.length; i++) {
    const p = textPoints[i];
    if (!p) continue;
    if (!arenaImages.length) continue;

    const block = arenaImages[i % arenaImages.length];
    if (!block.p5img) continue;

    const size = lerp(36, 14, compressionAmount);
    image(block.p5img, p.x, p.y, size, size);
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  compressionSlider.position(20, height - 40);
  generateTextPoints();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// const CHANNEL_SLUG = "type-logo-u3uywzkpvvc";
// const API_URL = `https://api.are.na/v2/channels/${CHANNEL_SLUG}?per=200`;


// let blocks = [];
// let arenaImages = [];

// let font;

// let lastBlockIds = [];
// const POLL_INTERVAL = 30000; // 30 seconds

// let totalVisualBlockCount = 0;
// let totalChannelBlockCount = 0;

// let rawOutlinePoints = [];
// let textPoints = [];


// function preload() {
//   font = loadFont(
//     "ABCFavorit-Regular-Trial.otf",
//     () => console.log("FONT LOADED"),
//     () => console.error("FONT FAILED TO LOAD")
//   );
// }


// function setup() {
//   const canvas = createCanvas(windowWidth, windowHeight);
//   canvas.parent("sketch-container");
//   pixelDensity(window.devicePixelRatio);

//   fetchArenaBlocks();
//   setInterval(fetchArenaBlocks, POLL_INTERVAL);
// }


// function fetchArenaBlocks() {
//   fetch(API_URL)
//     .then(res => res.json())
//     .then(data => {
//       const allBlocks = data.contents || [];
//       totalChannelBlockCount = allBlocks.length;

//       // Accept Image + Attachment blocks with ANY usable image URL
//       const visualBlocksRaw = allBlocks.filter(b =>
//   (b.class === "Image" || b.class === "Attachment")
// );

// // TOTAL visual blocks (what Are.na counts)
// totalVisualBlockCount = visualBlocksRaw.length;

// // RENDERABLE visual blocks (what we can draw)
// const visualBlocks = visualBlocksRaw
//   .map(b => {
//     const imageUrl =
//       (b.image?.thumb?.url) ||
//       (b.image?.display?.url) ||
//       (b.image?.original?.url);

//     if (!imageUrl) return null;

//     return {
//       ...b,
//       imageUrl
//     };
//   })
//   .filter(Boolean);


//       const newIds = visualBlocks.map(b => b.id);

//       // 🔁 Only update if something actually changed
//       if (JSON.stringify(newIds) === JSON.stringify(lastBlockIds)) {
//         return;
//       }

//       console.log("Channel updated — reloading blocks");

//       lastBlockIds = newIds;
//       blocks = allBlocks;
//       arenaImages = visualBlocks;

//       // Load images
//       arenaImages.forEach(block => {
//         block.p5img = loadImage(block.imageUrl);
//       });

//       generateTextOutline();
//       mapBlocksToText();
//     })
//     .catch(err => console.error("Are.na fetch error:", err));

    
// }

// /******************************************************************
//  * GENERATE TEXT OUTLINE (HIGH RES)
//  ******************************************************************/
// function generateTextOutline() {
//   rawOutlinePoints = [];

//   const textString = "Are.na";
//   const fontSize = min(width * 0.8, height * 0.4);

//   const bounds = font.textBounds(textString, 0, 0, fontSize);
//   const x = width / 2 - bounds.w / 2;
//   const y = height / 2;

//   rawOutlinePoints = font.textToPoints(
//     textString,
//     x,
//     y,
//     fontSize,
//     {
//       sampleFactor: 0.04,
//       simplifyThreshold: 0
//     }
//   );

//   console.log("OUTLINE POINTS:", rawOutlinePoints.length);
// }


// function mapBlocksToText() {
//   textPoints = [];

//   if (!rawOutlinePoints.length) return;
//   if (!arenaImages.length) return;

//   const blockCount = arenaImages.length;
//   const step = rawOutlinePoints.length / blockCount;

//   for (let i = 0; i < blockCount; i++) {
//     const p = rawOutlinePoints[Math.floor(i * step)];
//     if (p) textPoints.push(p);
//   }

//   console.log("BLOCK COUNT:", blockCount);
// }


// function drawBlockCount() {
//   textAlign(RIGHT, TOP);
//   textSize(14);
//   fill(0);
//   noStroke();

//   text(
//     `${arenaImages.length} / ${totalChannelBlockCount} blocks`,
//     width - 20,
//     20
//   );
// }


// function draw() {
//   background(255);

//   imageMode(CENTER);
//   noStroke();

//   for (let i = 0; i < textPoints.length; i++) {
//     const p = textPoints[i];
//     const block = arenaImages[i];

//     if (!p || !block || !block.p5img) continue;

//     const size = map(
//       arenaImages.length,
//       10,
//       150,
//       42,
//       14,
//       true
//     );

//     image(block.p5img, p.x, p.y, size, size);
//   }

//   drawBlockCount();
// }


// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   generateTextOutline();
//   mapBlocksToText();
// }
