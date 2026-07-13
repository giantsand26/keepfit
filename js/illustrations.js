/* illustrations.js — SVG stick figure generation for exercises */

// Reusable SVG stick figure renderer
// Body is normalized to a 64x64 viewBox
function renderStickFigure(config) {
  const {
    head = [32, 12],           // [cx, cy]
    torso = [32, 18, 32, 40],  // [x1, y1, x2, y2]
    leftUpperArm = [32, 24, 22, 30],
    leftForearm = [22, 30, 16, 38],
    rightUpperArm = [32, 24, 42, 30],
    rightForearm = [42, 30, 48, 38],
    leftThigh = [32, 40, 24, 50],
    leftShin = [24, 50, 20, 58],
    rightThigh = [32, 40, 40, 50],
    rightShin = [40, 50, 44, 58],
    arrows = [],          // [{from: [x,y], to: [x,y], label: ''}]
    highlights = [],      // ['LShoulder', 'Hip', etc]
    groundLine = false,
    wallLine = false
  } = config;

  const arrowDefs = arrows.map((a, i) => {
    const dx = a.to[0] - a.from[0];
    const dy = a.to[1] - a.from[1];
    const len = Math.sqrt(dx*dx + dy*dy);
    const ux = dx/len, uy = dy/len;
    const tipX = a.to[0] - ux * 3;
    const tipY = a.to[1] - uy * 3;
    return `
      <line x1="${a.from[0]}" y1="${a.from[1]}" x2="${tipX}" y2="${tipY}"
            stroke="#D4A76A" stroke-width="1.2" stroke-dasharray="3,2"/>
      <polygon points="${a.to[0]},${a.to[1]} ${a.to[0]-ux*3-uy*2},${a.to[1]-uy*3+ux*2} ${a.to[0]-ux*3+uy*2},${a.to[1]-uy*3-ux*2}"
               fill="#D4A76A"/>
    `;
  }).join('');

  const highlightDots = highlights.map(pos => {
    const coords = {
      'head': head,
      'LShoulder': [leftUpperArm[0], leftUpperArm[1]],
      'RShoulder': [rightUpperArm[0], rightUpperArm[1]],
      'LElbow': [leftForearm[0], leftForearm[1]],
      'RElbow': [rightForearm[0], rightForearm[1]],
      'Hip': [torso[2], torso[3]],
      'LKnee': [leftShin[0], leftShin[1]],
      'RKnee': [rightShin[0], rightShin[1]],
      'LAnkle': [leftShin[2], leftShin[3]],
      'RAnkle': [rightShin[2], rightShin[3]]
    }[pos];
    if (!coords) return '';
    return `<circle cx="${coords[0]}" cy="${coords[1]}" r="2" fill="#D4706A"/>`;
  }).join('');

  const ground = groundLine
    ? `<line x1="6" y1="60" x2="58" y2="60" stroke="#C9D5C4" stroke-width="1.5" stroke-dasharray="4,2"/>`
    : '';

  const wall = wallLine
    ? `<line x1="6" y1="2" x2="6" y2="60" stroke="#C9D5C4" stroke-width="2" stroke-dasharray="4,2"/>`
    : '';

  const headR = config.headRadius || 5;

  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${ground}
    ${wall}
    <!-- Head -->
    <circle cx="${head[0]}" cy="${head[1]}" r="${headR}" fill="none" stroke="#3D3929" stroke-width="2"/>
    <!-- Torso -->
    <line x1="${torso[0]}" y1="${torso[1]}" x2="${torso[2]}" y2="${torso[3]}" stroke="#3D3929" stroke-width="2.5"/>
    <!-- Upper Arms -->
    <line x1="${leftUpperArm[0]}" y1="${leftUpperArm[1]}" x2="${leftUpperArm[2]}" y2="${leftUpperArm[3]}" stroke="#3D3929" stroke-width="2"/>
    <line x1="${rightUpperArm[0]}" y1="${rightUpperArm[1]}" x2="${rightUpperArm[2]}" y2="${rightUpperArm[3]}" stroke="#3D3929" stroke-width="2"/>
    <!-- Forearms -->
    <line x1="${leftForearm[0]}" y1="${leftForearm[1]}" x2="${leftForearm[2]}" y2="${leftForearm[3]}" stroke="#3D3929" stroke-width="2"/>
    <line x1="${rightForearm[0]}" y1="${rightForearm[1]}" x2="${rightForearm[2]}" y2="${rightForearm[3]}" stroke="#3D3929" stroke-width="2"/>
    <!-- Thighs -->
    <line x1="${leftThigh[0]}" y1="${leftThigh[1]}" x2="${leftThigh[2]}" y2="${leftThigh[3]}" stroke="#3D3929" stroke-width="2"/>
    <line x1="${rightThigh[0]}" y1="${rightThigh[1]}" x2="${rightThigh[2]}" y2="${rightThigh[3]}" stroke="#3D3929" stroke-width="2"/>
    <!-- Shins -->
    <line x1="${leftShin[0]}" y1="${leftShin[1]}" x2="${leftShin[2]}" y2="${leftShin[3]}" stroke="#3D3929" stroke-width="2"/>
    <line x1="${rightShin[0]}" y1="${rightShin[1]}" x2="${rightShin[2]}" y2="${rightShin[3]}" stroke="#3D3929" stroke-width="2"/>
    <!-- Arrows -->
    ${arrowDefs}
    <!-- Joint highlights -->
    ${highlightDots}
  </svg>`;
}

// === Individual exercise illustrations ===

function wallAngelSVG() {
  return renderStickFigure({
    head: [22, 14],
    torso: [22, 20, 22, 42],
    leftUpperArm: [22, 25, 10, 14], leftForearm: [10, 14, 10, 6],
    rightUpperArm: [22, 25, 34, 14], rightForearm: [34, 14, 34, 6],
    leftThigh: [22, 42, 16, 54], leftShin: [16, 54, 14, 60],
    rightThigh: [22, 42, 28, 54], rightShin: [28, 54, 30, 60],
    arrows: [
      { from: [10, 8], to: [10, 2], label: '' },
      { from: [34, 8], to: [34, 2], label: '' }
    ],
    highlights: ['LShoulder', 'RShoulder'],
    wallLine: true
  });
}

function gluteBridgeSVG() {
  return renderStickFigure({
    head: [32, 18],
    torso: [32, 22, 32, 34],
    leftUpperArm: [32, 28, 24, 38], leftForearm: [24, 38, 20, 48],
    rightUpperArm: [32, 28, 40, 38], rightForearm: [40, 38, 44, 48],
    leftThigh: [32, 34, 24, 44], leftShin: [24, 44, 22, 52],
    rightThigh: [32, 34, 40, 44], rightShin: [40, 44, 42, 52],
    arrows: [
      { from: [32, 26], to: [32, 18], label: '' }
    ],
    highlights: ['Hip'],
    groundLine: true
  });
}

function squatSVG() {
  return renderStickFigure({
    head: [32, 8],
    torso: [32, 13, 32, 26],
    leftUpperArm: [32, 18, 24, 22], leftForearm: [24, 22, 18, 18],
    rightUpperArm: [32, 18, 40, 22], rightForearm: [40, 22, 46, 18],
    leftThigh: [32, 26, 22, 40], leftShin: [22, 40, 18, 54],
    rightThigh: [32, 26, 42, 40], rightShin: [42, 40, 46, 54],
    arrows: [
      { from: [32, 36], to: [32, 46], label: '' }
    ],
    highlights: ['LKnee', 'RKnee'],
    groundLine: true
  });
}

function deadBugSVG() {
  return renderStickFigure({
    head: [32, 20],
    torso: [32, 25, 32, 40],
    leftUpperArm: [32, 30, 22, 24], leftForearm: [22, 24, 14, 26],
    rightUpperArm: [32, 30, 42, 24], rightForearm: [42, 24, 50, 26],
    leftThigh: [32, 40, 26, 32], leftShin: [26, 32, 28, 28],
    rightThigh: [32, 40, 38, 32], rightShin: [38, 32, 36, 28],
    highlights: ['Hip'],
    groundLine: true
  });
}

function catCowSVG() {
  // Cat position (arched back)
  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="6" y1="52" x2="58" y2="52" stroke="#C9D5C4" stroke-width="1.5" stroke-dasharray="4,2"/>
    <circle cx="28" cy="18" r="4.5" fill="none" stroke="#3D3929" stroke-width="2"/>
    <path d="M24 22 Q20 30 24 40" stroke="#3D3929" stroke-width="2.5" fill="none"/>
    <path d="M32 22 Q36 30 32 40" stroke="#3D3929" stroke-width="2.5" fill="none"/>
    <line x1="24" y1="40" x2="32" y2="42" stroke="#3D3929" stroke-width="2.5"/>
    <line x1="32" y1="40" x2="32" y2="42" stroke="#3D3929" stroke-width="2.5"/>
    <line x1="22" y1="26" x2="16" y2="42" stroke="#3D3929" stroke-width="2"/>
    <line x1="16" y1="42" x2="12" y2="52" stroke="#3D3929" stroke-width="2"/>
    <line x1="34" y1="26" x2="40" y2="42" stroke="#3D3929" stroke-width="2"/>
    <line x1="40" y1="42" x2="44" y2="52" stroke="#3D3929" stroke-width="2"/>
    <line x1="26" y1="40" x2="22" y2="52" stroke="#3D3929" stroke-width="2"/>
    <line x1="30" y1="40" x2="34" y2="52" stroke="#3D3929" stroke-width="2"/>
    <path d="M10 14 Q28 6 46 14" stroke="#D4A76A" stroke-width="1.2" fill="none" stroke-dasharray="2,2"/>
    <path d="M44 16 L46 14 L44 12" stroke="#D4A76A" stroke-width="1.2" fill="none"/>
  </svg>`;
}

function ytwSVG() {
  return renderStickFigure({
    head: [32, 12],
    torso: [32, 17, 32, 32],
    leftUpperArm: [32, 22, 14, 12], leftForearm: [14, 12, 8, 6],
    rightUpperArm: [32, 22, 50, 12], rightForearm: [50, 12, 56, 6],
    leftThigh: [32, 32, 24, 44], leftShin: [24, 44, 22, 52],
    rightThigh: [32, 32, 40, 44], rightShin: [40, 44, 42, 52],
    highlights: ['LShoulder', 'RShoulder'],
    groundLine: true
  });
}

function plankSVG() {
  return renderStickFigure({
    head: [20, 12],
    headRadius: 4,
    torso: [20, 16, 20, 36],
    leftUpperArm: [20, 28, 12, 38], leftForearm: [12, 38, 8, 44],
    rightUpperArm: [20, 28, 28, 38], rightForearm: [28, 38, 32, 44],
    leftThigh: [20, 36, 16, 44], leftShin: [16, 44, 14, 54],
    rightThigh: [20, 36, 24, 44], rightShin: [24, 44, 26, 54],
    highlights: ['Hip'],
    groundLine: true
  });
}

function birdDogSVG() {
  return renderStickFigure({
    head: [28, 14],
    torso: [28, 18, 28, 34],
    leftUpperArm: [28, 22, 16, 18], leftForearm: [16, 18, 8, 26],
    rightUpperArm: [28, 22, 40, 18], rightForearm: [40, 18, 48, 26],
    leftThigh: [28, 34, 20, 42], leftShin: [20, 42, 14, 50],
    rightThigh: [28, 34, 36, 42], rightShin: [36, 42, 42, 50],
    highlights: ['LShoulder', 'RKnee'],
    groundLine: true
  });
}

function proneRaiseSVG() {
  return renderStickFigure({
    head: [32, 10],
    torso: [32, 14, 32, 30],
    leftUpperArm: [32, 18, 16, 8], leftForearm: [16, 8, 8, 4],
    rightUpperArm: [32, 18, 48, 8], rightForearm: [48, 8, 56, 4],
    leftThigh: [32, 30, 24, 40], leftShin: [24, 40, 22, 50],
    rightThigh: [32, 30, 40, 40], rightShin: [40, 40, 42, 50],
    highlights: ['LShoulder', 'RShoulder'],
    groundLine: true
  });
}

function inclinePushupSVG() {
  return renderStickFigure({
    head: [28, 6],
    torso: [28, 10, 28, 26],
    leftUpperArm: [28, 16, 16, 24], leftForearm: [16, 24, 10, 28],
    rightUpperArm: [28, 16, 40, 24], rightForearm: [40, 24, 46, 28],
    leftThigh: [28, 26, 20, 40], leftShin: [20, 40, 16, 52],
    rightThigh: [28, 26, 36, 40], rightShin: [36, 40, 40, 52],
    arrows: [
      { from: [24, 24], to: [24, 16], label: '' }
    ],
    groundLine: true
  });
}

function hipFlexorStretchSVG() {
  return renderStickFigure({
    head: [36, 10],
    torso: [36, 14, 34, 28],
    leftUpperArm: [34, 20, 28, 26], leftForearm: [28, 26, 24, 30],
    rightUpperArm: [34, 20, 42, 24], rightForearm: [42, 24, 46, 28],
    leftThigh: [34, 28, 26, 32], leftShin: [26, 32, 24, 48],
    rightThigh: [34, 28, 38, 38], rightShin: [38, 38, 40, 50],
    highlights: ['Hip'],
    groundLine: true
  });
}

function pelvicClockSVG() {
  return renderStickFigure({
    head: [32, 20],
    torso: [32, 25, 32, 42],
    leftUpperArm: [32, 32, 24, 40], leftForearm: [24, 40, 18, 48],
    rightUpperArm: [32, 32, 40, 40], rightForearm: [40, 40, 46, 48],
    leftThigh: [32, 42, 26, 50], leftShin: [26, 50, 24, 58],
    rightThigh: [32, 42, 38, 50], rightShin: [38, 50, 40, 58],
    arrows: [
      { from: [32, 34], to: [32, 28], label: '12' }
    ],
    highlights: ['Hip'],
    groundLine: true
  });
}

function burpeeSVG() {
  // Middle position of burpee
  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="6" y1="56" x2="58" y2="56" stroke="#C9D5C4" stroke-width="1.5" stroke-dasharray="4,2"/>
    <circle cx="32" cy="8" r="4" fill="none" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="12" x2="32" y2="24" stroke="#3D3929" stroke-width="2.5"/>
    <line x1="32" y1="18" x2="22" y2="30" stroke="#3D3929" stroke-width="2"/>
    <line x1="22" y1="30" x2="16" y2="36" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="18" x2="42" y2="30" stroke="#3D3929" stroke-width="2"/>
    <line x1="42" y1="30" x2="48" y2="36" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="24" x2="24" y2="40" stroke="#3D3929" stroke-width="2"/>
    <line x1="24" y1="40" x2="20" y2="48" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="24" x2="40" y2="40" stroke="#3D3929" stroke-width="2"/>
    <line x1="40" y1="40" x2="44" y2="48" stroke="#3D3929" stroke-width="2"/>
    <path d="M32 10 Q24 2 16 4" stroke="#D4A76A" stroke-width="1.2" fill="none" stroke-dasharray="2,2"/>
  </svg>`;
}

function sidePlankSVG() {
  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="6" y1="56" x2="58" y2="56" stroke="#C9D5C4" stroke-width="1.5" stroke-dasharray="4,2"/>
    <circle cx="24" cy="16" r="4" fill="none" stroke="#3D3929" stroke-width="2"/>
    <line x1="24" y1="20" x2="24" y2="40" stroke="#3D3929" stroke-width="2.5"/>
    <line x1="24" y1="26" x2="12" y2="38" stroke="#3D3929" stroke-width="2"/>
    <line x1="12" y1="38" x2="8" y2="46" stroke="#3D3929" stroke-width="2"/>
    <line x1="24" y1="34" x2="34" y2="40" stroke="#3D3929" stroke-width="2"/>
    <line x1="34" y1="40" x2="38" y2="44" stroke="#3D3929" stroke-width="2"/>
    <line x1="24" y1="40" x2="22" y2="48" stroke="#3D3929" stroke-width="2"/>
    <line x1="22" y1="48" x2="18" y2="54" stroke="#3D3929" stroke-width="2"/>
  </svg>`;
}

function jumpingJackSVG() {
  return renderStickFigure({
    head: [32, 6],
    torso: [32, 10, 32, 28],
    leftUpperArm: [32, 16, 18, 8], leftForearm: [18, 8, 10, 4],
    rightUpperArm: [32, 16, 46, 8], rightForearm: [46, 8, 54, 4],
    leftThigh: [32, 28, 22, 42], leftShin: [22, 42, 16, 54],
    rightThigh: [32, 28, 42, 42], rightShin: [42, 42, 48, 54],
    groundLine: true
  });
}

function mountainClimberSVG() {
  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="8" r="4" fill="none" stroke="#3D3929" stroke-width="2"/>
    <line x1="28" y1="12" x2="28" y2="26" stroke="#3D3929" stroke-width="2.5"/>
    <line x1="28" y1="18" x2="16" y2="30" stroke="#3D3929" stroke-width="2"/>
    <line x1="16" y1="30" x2="10" y2="38" stroke="#3D3929" stroke-width="2"/>
    <line x1="28" y1="18" x2="40" y2="30" stroke="#3D3929" stroke-width="2"/>
    <line x1="40" y1="30" x2="46" y2="38" stroke="#3D3929" stroke-width="2"/>
    <line x1="28" y1="26" x2="18" y2="40" stroke="#3D3929" stroke-width="2"/>
    <line x1="18" y1="40" x2="14" y2="52" stroke="#3D3929" stroke-width="2"/>
    <line x1="28" y1="26" x2="38" y2="40" stroke="#3D3929" stroke-width="2"/>
    <line x1="38" y1="40" x2="42" y2="52" stroke="#3D3929" stroke-width="2"/>
    <path d="M18 36 L14 32 M12 34 L14 32 L16 34" stroke="#D4A76A" stroke-width="1.2" fill="none"/>
    <line x1="6" y1="54" x2="50" y2="54" stroke="#C9D5C4" stroke-width="1.5" stroke-dasharray="4,2"/>
  </svg>`;
}

function vUpSVG() {
  return renderStickFigure({
    head: [32, 14],
    torso: [32, 19, 32, 30],
    leftUpperArm: [32, 24, 24, 32], leftForearm: [24, 32, 20, 40],
    rightUpperArm: [32, 24, 40, 32], rightForearm: [40, 32, 44, 40],
    leftThigh: [32, 30, 26, 36], leftShin: [26, 36, 28, 42],
    rightThigh: [32, 30, 38, 36], rightShin: [38, 36, 36, 42],
    highlights: ['Hip'],
    groundLine: true
  });
}

function downwardDogSVG() {
  return renderStickFigure({
    head: [32, 20],
    torso: [32, 24, 32, 36],
    leftUpperArm: [32, 28, 20, 34], leftForearm: [20, 34, 12, 40],
    rightUpperArm: [32, 28, 44, 34], rightForearm: [44, 34, 52, 40],
    leftThigh: [32, 36, 24, 44], leftShin: [24, 44, 22, 54],
    rightThigh: [32, 36, 40, 44], rightShin: [40, 44, 42, 54],
    groundLine: true
  });
}

function shoulderExtRotSVG() {
  return renderStickFigure({
    head: [32, 10],
    torso: [32, 15, 32, 36],
    leftUpperArm: [32, 22, 24, 26], leftForearm: [24, 26, 20, 32],
    rightUpperArm: [32, 22, 40, 26], rightForearm: [40, 26, 44, 32],
    leftThigh: [32, 36, 24, 48], leftShin: [24, 48, 22, 56],
    rightThigh: [32, 36, 40, 48], rightShin: [40, 48, 42, 56],
    arrows: [
      { from: [42, 30], to: [48, 28], label: '' }
    ],
    highlights: ['RElbow'],
    groundLine: true
  });
}

function chestStretchSVG() {
  return renderStickFigure({
    head: [36, 10],
    torso: [36, 15, 34, 30],
    leftUpperArm: [34, 20, 24, 16], leftForearm: [24, 16, 22, 10],
    rightUpperArm: [34, 20, 44, 26], rightForearm: [44, 26, 48, 20],
    leftThigh: [34, 30, 26, 40], leftShin: [26, 40, 22, 50],
    rightThigh: [34, 30, 42, 40], rightShin: [42, 40, 44, 50],
    arrows: [
      { from: [30, 20], to: [24, 16], label: '' }
    ],
    groundLine: true
  });
}

function kneelingRotationSVG() {
  return renderStickFigure({
    head: [30, 12],
    torso: [30, 16, 30, 30],
    leftUpperArm: [30, 20, 18, 24], leftForearm: [18, 24, 12, 28],
    rightUpperArm: [30, 20, 40, 16], rightForearm: [40, 16, 46, 10],
    leftThigh: [30, 30, 22, 40], leftShin: [22, 40, 20, 50],
    rightThigh: [30, 30, 38, 40], rightShin: [38, 40, 40, 50],
    arrows: [
      { from: [42, 14], to: [46, 8], label: '' }
    ],
    highlights: ['RElbow'],
    groundLine: true
  });
}

function singleLegBridgeSVG() {
  return renderStickFigure({
    head: [32, 16],
    torso: [32, 20, 32, 32],
    leftUpperArm: [32, 26, 24, 36], leftForearm: [24, 36, 20, 44],
    rightUpperArm: [32, 26, 40, 36], rightForearm: [40, 36, 44, 44],
    leftThigh: [32, 32, 24, 42], leftShin: [24, 42, 22, 50],
    rightThigh: [32, 32, 36, 36], rightShin: [36, 36, 40, 30],
    arrows: [
      { from: [32, 24], to: [32, 16], label: '' }
    ],
    highlights: ['Hip'],
    groundLine: true
  });
}

function bulgarianSplitSquatSVG() {
  return renderStickFigure({
    head: [34, 8],
    torso: [34, 12, 34, 26],
    leftUpperArm: [34, 18, 26, 22], leftForearm: [26, 22, 20, 20],
    rightUpperArm: [34, 18, 42, 22], rightForearm: [42, 22, 48, 20],
    leftThigh: [34, 26, 26, 38], leftShin: [26, 38, 22, 50],
    rightThigh: [34, 26, 42, 34], rightShin: [42, 34, 44, 46],
    highlights: ['LKnee'],
    groundLine: true
  });
}

function squatJumpSVG() {
  // Mid-jump position
  return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="20" r="4" fill="none" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="24" x2="32" y2="38" stroke="#3D3929" stroke-width="2.5"/>
    <line x1="32" y1="28" x2="20" y2="20" stroke="#3D3929" stroke-width="2"/>
    <line x1="20" y1="20" x2="12" y2="14" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="28" x2="44" y2="20" stroke="#3D3929" stroke-width="2"/>
    <line x1="44" y1="20" x2="52" y2="14" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="38" x2="26" y2="48" stroke="#3D3929" stroke-width="2"/>
    <line x1="26" y1="48" x2="24" y2="56" stroke="#3D3929" stroke-width="2"/>
    <line x1="32" y1="38" x2="38" y2="48" stroke="#3D3929" stroke-width="2"/>
    <line x1="38" y1="48" x2="40" y2="56" stroke="#3D3929" stroke-width="2"/>
    <path d="M32 42 L32 52 M30 49 L32 52 L34 49" stroke="#D4A76A" stroke-width="1.2" fill="none"/>
    <line x1="6" y1="58" x2="58" y2="58" stroke="#C9D5C4" stroke-width="1.5" stroke-dasharray="4,2"/>
  </svg>`;
}

// === Illustration lookup ===
const ILLUSTRATIONS = {
  'wall-angel': wallAngelSVG,
  'chest-stretch': chestStretchSVG,
  'ytw': ytwSVG,
  'dead-bug': deadBugSVG,
  'glute-bridge': gluteBridgeSVG,
  'squat': squatSVG,
  'bird-dog': birdDogSVG,
  'plank': plankSVG,
  'hip-flexor-stretch': hipFlexorStretchSVG,
  'pelvic-clock': pelvicClockSVG,
  'prone-raise': proneRaiseSVG,
  'shoulder-ext-rot': shoulderExtRotSVG,
  'incline-pushup': inclinePushupSVG,
  'cat-cow': catCowSVG,
  'kneeling-rotation': kneelingRotationSVG,
  'side-plank': sidePlankSVG,
  'single-leg-bridge': singleLegBridgeSVG,
  'bulgarian-split-squat': bulgarianSplitSquatSVG,
  'squat-jump': squatJumpSVG,
  'mountain-climber': mountainClimberSVG,
  'jumping-jack': jumpingJackSVG,
  'burpee': burpeeSVG,
  'v-up': vUpSVG,
  'downward-dog': downwardDogSVG
};

export function getIllustration(exId) {
  const fn = ILLUSTRATIONS[exId];
  return fn ? fn() : wallAngelSVG(); // fallback
}
