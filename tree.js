function paintLine(ax, ay, bx, by) {
    ctx.beginPath();
    ctx.moveTo(offsetX + zoomX * ax, offsetY + zoomY * ay);
    ctx.lineTo(offsetX + zoomX * bx, offsetY + zoomY * by);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#550055';
    ctx.stroke();
}

function paintSkill(x, y, fill) {
    ctx.beginPath();
    ctx.arc(
        offsetX + zoomX * x,
        offsetY + zoomY * y,
        skillSize - 1,
        0,
        Math.PI*2
    );
    if ( fill ) {
        ctx.fillStyle = '#330033';
        ctx.strokeStyle = '#550055';
        ctx.fill();
    }
    else {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#550055';
        ctx.stroke();
    }
}

function skillCoords(i) {
    return skillLocations[i] || skills[i];
}

var _painted = 0, $painted = document.getElementById('painted');
function paintTree() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    paths.forEach(function(P) {
        var C1 = skillCoords(P[0]),
            C2 = skillCoords(P[1]);
        paintLine(C1[0], C1[1], C2[0], C2[1]);
    });

    skills.forEach(function(C, i) {
        C = skillCoords(i);
        paintSkill(C[0], C[1]);
    });

    $painted.textContent = ++_painted;
}

function findSkillFromCoords(x, y) {
    for ( var C, i=0, L=skills.length; i<L; i++ ) {
        C = skills[i];
        var skillX = offsetX + zoomX * C[0],
            skillY = offsetY + zoomY * C[1];
        if (
            skillX-skillSize < x && skillX+skillSize > x &&
            skillY-skillSize < y && skillY+skillSize > y
        ) {
            return i;
        }
    }

    return -1;
}

function rand(max) {
    return parseInt(Math.random() * (max+1));
}

function addTranslation(C, vibrFactor) {
    C = JSON.parse(JSON.stringify(C));
    var dx = rand(2) - 1,
        dy = rand(2) - 1;
    C[0] += dx / 4 * vibrFactor;
    C[1] += dy / 4 * vibrFactor;
    return C;
}

function findSkillNeighbours(n, incSkill) {
    var nbs = [];
    incSkill && nbs.push(n);
    paths.forEach(function(P) {
        if ( P[0] == n ) {
            nbs.push(P[1]);
        }
        else if ( P[1] == n ) {
            nbs.push(P[0]);
        }
    });
    return nbs;
}

function doVibrate(vibrate) {
    // Add random translations
    vibrate.forEach(function(i, n) {
        var C = skills[i],
            vibrFactor = 0 == n ? vibr1 : vibr2;
        C = addTranslation(C, vibrFactor);
        skillLocations[i] = C;
    });

    // Repaint
    paintTree();

    // Paint it black, for now
    var C = skillCoords(vibrate[0]);
    paintSkill(C[0], C[1], true);
}

// Context
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
//console.log(ctx);

var skillSize = 8,
    zoomX = 12,
    zoomY = 12,
    offsetX = 4 * zoomX,
    offsetY = canvas.height / 2,
    vibr1 = 0.1,
    vibr2 = 0.15,
    vibrationSpeed = 0/60;

// Data
var skills = [
    [0, 0],
    [4, 0],
    [8, 0],
    [12, 0],
    [16, 0],
    [20, 0],
    [24, 0],
    [10, -4],
    [10, 4],
    [17, -4],
    [17, 4],
    [22, -8],
    [22, 8],
    [25, -2],
    [25, 2],
    [27, 8],
];
// LINKS INTO 2 CASES
var paths = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 7],
    [1, 8],
    [3, 7],
    [3, 8],
    [3, 9],
    [3, 10],
    [4, 9],
    [4, 10],
    [4, 5],
    [11, 5],
    [12, 5],
    [9, 11],
    [10, 12],
    [5, 6],
    [13, 5],
    [14, 5],
];

// Process
var skillLocations = Array(skills.length),
    lastHoveredOver = -1,
    vibrationTimer = -1;

paintTree();

canvas.onmousemove = function(e) {
    var zoom = this.offsetWidth / this.width,
        x = Math.round(e.layerX / zoom),
        y = Math.round(e.layerY / zoom);

    // Find skills with overlapping coordinates...
    // How's efficient? Loop 'n calc?
    var skill = findSkillFromCoords(x, y);
    if ( lastHoveredOver != skill ) {
        // First of all: reset previous skills
        skillLocations = Array(skills.length);

        // Hover on skill
        if ( -1 != skill ) {
            // TEMP: Reset vibration
            clearInterval(vibrationTimer);

            // Find neighbours
            var vibrate = findSkillNeighbours(skill, true);

            doVibrate(vibrate);

            vibrationTimer = setInterval(function() {
                doVibrate(vibrate);
            }, vibrationSpeed);

            setTimeout(function() {
                clearInterval(vibrationTimer);
            }, 1000);
        }
        // Hover outside
        else {
            // Reset vibration
            // clearInterval(vibrationTimer);

            // Repaint
            paintTree();
        }

        lastHoveredOver = skill;
    }
};

