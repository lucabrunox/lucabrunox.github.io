(function () {
    'use strict';

    // ── Constants ──
    var COLS = 10;
    var ROWS = 20;
    var BLOCK = 0;          // computed at boot
    var BOARD_X = 0;        // computed at boot
    var BOARD_Y = 0;        // computed at boot

    var DROP_INTERVAL_INITIAL = 800;   // ms per row at level 1
    var DROP_INTERVAL_MIN = 50;
    var SOFT_DROP_INTERVAL = 50;
    var HARD_DROP_SCORE_PER_ROW = 2;
    var SOFT_DROP_SCORE_PER_ROW = 1;
    var LINES_PER_LEVEL = 5;
    var LINE_SCORES = [0, 100, 300, 500, 800];

    var COLORS = {
        I: 0x00f0f0,
        O: 0xf0f000,
        T: 0xa000f0,
        S: 0x00f000,
        Z: 0xf00000,
        J: 0x0000f0,
        L: 0xf0a000
    };

    var TETROMINOES = {
        I: [[0,0],[1,0],[2,0],[3,0]],
        O: [[0,0],[1,0],[0,1],[1,1]],
        T: [[0,0],[1,0],[2,0],[1,1]],
        S: [[1,0],[2,0],[0,1],[1,1]],
        Z: [[0,0],[1,0],[1,1],[2,1]],
        J: [[0,0],[0,1],[1,1],[2,1]],
        L: [[2,0],[0,1],[1,1],[2,1]]
    };

    var PIECE_NAMES = ['I','O','T','S','Z','J','L'];

    // ── Wall‑kick data (SRS) ──
    var KICKS = {
        normal: [
            [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
            [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
            [[0,0],[1,0],[1,-1],[0,2],[1,2]],
            [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]]
        ],
        I: [
            [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
            [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
            [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
            [[0,0],[1,0],[-2,0],[1,2],[-2,-1]]
        ]
    };

    // ── Helper: rotate a set of cells CW around centre ──
    function rotateCells(cells) {
        var maxX = 0, maxY = 0;
        for (var i = 0; i < cells.length; i++) {
            if (cells[i][0] > maxX) maxX = cells[i][0];
            if (cells[i][1] > maxY) maxY = cells[i][1];
        }
        var size = Math.max(maxX, maxY);
        var out = [];
        for (var j = 0; j < cells.length; j++) {
            out.push([size - cells[j][1], cells[j][0]]);
        }
        return out;
    }

    // ── Generate all 4 rotations for every piece ──
    var ROTATIONS = {};
    PIECE_NAMES.forEach(function (name) {
        var r = [TETROMINOES[name]];
        for (var i = 1; i < 4; i++) {
            r.push(rotateCells(r[i - 1]));
        }
        ROTATIONS[name] = r;
    });

    // ── Bag randomiser ──
    function createBag() {
        var a = PIECE_NAMES.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    // ── Phaser scene ──
    var GameScene = new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function GameScene() {
            Phaser.Scene.call(this, { key: 'GameScene' });
        },

        create: function () {
            this.computeLayout();
            this.boardGfx = this.add.graphics();
            this.pieceGfx = this.add.graphics();
            this.ghostGfx = this.add.graphics();
            this.uiGfx    = this.add.graphics();

            this.resetGame();
            this.setupInput();
            this.drawBoard();
            this.drawUI();

            var self = this;
            this.scale.on('resize', function (gameSize) {
                self.computeLayout();
                if (!self.gameOver) self.drawEverything();
            });
        },

        // ── Layout ──
        computeLayout: function () {
            var W = this.scale.width;
            var H = this.scale.height;

            var isMobile = !this.sys.game.device.os.desktop;

            if (isMobile) {
                // Mobile: board uses full width, no sidebar column, no padding
                BLOCK = Math.floor(Math.min(W / COLS, H / ROWS));
                BOARD_X = Math.floor((W - BLOCK * COLS) / 2);
                BOARD_Y = 0;
                // Sidebar overlays on the right portion of the board
                this.sideX = BOARD_X + BLOCK * COLS - Math.floor(BLOCK * 3.5);
                this.sideY = 4;
            } else {
                var playH = H * 0.95;
                // sidebar for next piece and score
                var sideW = W * 0.28;
                var boardW = W - sideW;

                BLOCK = Math.floor(Math.min(boardW / COLS, playH / ROWS));
                BOARD_X = Math.floor((boardW - BLOCK * COLS) / 2);
                BOARD_Y = Math.floor((playH - BLOCK * ROWS) / 2);
                if (BOARD_Y < 4) BOARD_Y = 4;
                this.sideX = BOARD_X + BLOCK * COLS + Math.floor(sideW * 0.12);
                this.sideY = BOARD_Y;
            }
            this.isMobile = isMobile;
            this.playH = isMobile ? H : H * 0.95;
        },

        // ── Game state ──
        resetGame: function () {
            this.grid = [];
            for (var r = 0; r < ROWS; r++) {
                this.grid.push(new Array(COLS).fill(0));
            }
            this.score = 0;
            this.lines = 0;
            this.level = 1;
            this.gameOver = false;
            this.paused = false;
            this.bag = createBag();
            this.nextPiece = this.popBag();
            this.spawnPiece();
            this.dropTimer = 0;
            this.dropInterval = DROP_INTERVAL_INITIAL;
            this.softDrop = false;
            this.lockDelay = 0;
            this.lockLimit = 70;
            this.moved = false;
            this.holdPiece = null;
            this.holdUsed = false;
        },

        popBag: function () {
            if (this.bag.length === 0) this.bag = createBag();
            return this.bag.pop();
        },

        spawnPiece: function () {
            this.current = this.nextPiece;
            this.nextPiece = this.popBag();
            this.rotation = 0;
            this.px = Math.floor((COLS - 4) / 2);
            this.py = 0;

            if (!this.isValid(this.px, this.py, this.rotation)) {
                this.gameOver = true;
            }
        },

        cells: function (rot) {
            if (rot === undefined) rot = this.rotation;
            return ROTATIONS[this.current][rot];
        },

        // ── Collision ──
        isValid: function (px, py, rot) {
            var c = ROTATIONS[this.current][rot];
            for (var i = 0; i < c.length; i++) {
                var nx = px + c[i][0];
                var ny = py + c[i][1];
                if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
                if (ny >= 0 && this.grid[ny][nx] !== 0) return false;
            }
            return true;
        },

        // ── Movement ──
        moveLeft: function () {
            if (this.isValid(this.px - 1, this.py, this.rotation)) {
                this.px--; this.moved = true;
            }
        },

        moveRight: function () {
            if (this.isValid(this.px + 1, this.py, this.rotation)) {
                this.px++; this.moved = true;
            }
        },

        moveDown: function () {
            if (this.isValid(this.px, this.py + 1, this.rotation)) {
                this.py++;
                return true;
            }
            return false;
        },

        rotatePiece: function (dir) {
            var newRot = (this.rotation + dir + 4) % 4;
            var kicks = this.current === 'I' ? KICKS.I : KICKS.normal;
            var kickSet = dir === 1 ? kicks[this.rotation] : kicks[newRot];

            for (var i = 0; i < kickSet.length; i++) {
                var kx = dir === 1 ? kickSet[i][0] : -kickSet[i][0];
                var ky = dir === 1 ? -kickSet[i][1] : kickSet[i][1];
                if (this.isValid(this.px + kx, this.py + ky, newRot)) {
                    this.px += kx;
                    this.py += ky;
                    this.rotation = newRot;
                    this.moved = true;
                    return;
                }
            }
        },

        hardDrop: function () {
            while (this.moveDown()) { this.score += HARD_DROP_SCORE_PER_ROW; }
            this.lockPiece();
        },

        ghostY: function () {
            var gy = this.py;
            while (this.isValid(this.px, gy + 1, this.rotation)) gy++;
            return gy;
        },

        holdCurrentPiece: function () {
            if (this.holdUsed) return;
            this.holdUsed = true;
            if (this.holdPiece === null) {
                this.holdPiece = this.current;
                this.spawnPiece();
            } else {
                var tmp = this.holdPiece;
                this.holdPiece = this.current;
                this.current = tmp;
                this.rotation = 0;
                this.px = Math.floor((COLS - 4) / 2);
                this.py = 0;
            }
            this.dropTimer = 0;
            this.lockDelay = 0;
            this.moved = false;
        },

        lockPiece: function () {
            var c = this.cells();
            for (var i = 0; i < c.length; i++) {
                var x = this.px + c[i][0];
                var y = this.py + c[i][1];
                if (y >= 0 && y < ROWS) {
                    this.grid[y][x] = COLORS[this.current];
                }
            }
            this.clearLines();
            this.spawnPiece();
            this.dropTimer = 0;
            this.lockDelay = 0;
            this.moved = false;
            this.holdUsed = false;
        },

        clearLines: function () {
            var cleared = 0;
            for (var r = ROWS - 1; r >= 0; r--) {
                var full = true;
                for (var c = 0; c < COLS; c++) {
                    if (this.grid[r][c] === 0) { full = false; break; }
                }
                if (full) {
                    this.grid.splice(r, 1);
                    this.grid.unshift(new Array(COLS).fill(0));
                    cleared++;
                    r++;
                }
            }
            if (cleared > 0) {
                this.lines += cleared;
                this.score += LINE_SCORES[cleared] * this.level;
                this.level = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
                this.dropInterval = Math.max(DROP_INTERVAL_MIN,
                    DROP_INTERVAL_INITIAL - (this.level - 1) * 90);
            }
        },

        // ── Input ──
        setupInput: function () {
            var self = this;

            // Keyboard
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keyZ = this.input.keyboard.addKey('Z');
            this.keyX = this.input.keyboard.addKey('X');
            this.keyP = this.input.keyboard.addKey('P');
            this.keyR = this.input.keyboard.addKey('R');
            this.keyC = this.input.keyboard.addKey('C');
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            this.input.keyboard.on('keydown-LEFT', function () { if (!self.gameOver && !self.paused) self.moveLeft(); });
            this.input.keyboard.on('keydown-RIGHT', function () { if (!self.gameOver && !self.paused) self.moveRight(); });
            this.input.keyboard.on('keydown-UP', function () { if (!self.gameOver && !self.paused) self.rotatePiece(1); });
            this.input.keyboard.on('keydown-SPACE', function () { if (!self.gameOver && !self.paused) self.hardDrop(); });
            this.input.keyboard.on('keydown-DOWN', function () { if (!self.gameOver && !self.paused) self.softDrop = true; });
            this.input.keyboard.on('keyup-DOWN', function () { self.softDrop = false; });
            this.input.keyboard.on('keydown-Z', function () { if (!self.gameOver && !self.paused) self.rotatePiece(-1); });
            this.input.keyboard.on('keydown-X', function () { if (!self.gameOver && !self.paused) self.rotatePiece(1); });
            this.input.keyboard.on('keydown-C', function () { if (!self.gameOver && !self.paused) self.holdCurrentPiece(); });
            this.input.keyboard.on('keydown-P', function () { if (!self.gameOver) self.paused = !self.paused; });
            this.input.keyboard.on('keydown-R', function () {
                self.resetGame();
                self.drawBoard();
                self.drawUI();
            });

            // Touch / pointer – swipe detection + on‑screen buttons
            this.setupTouch();
        },

        setupTouch: function () {
            var self = this;
            var startX, startY, startTime;
            var tapThreshold = 15;

            if (this.isMobile) {
                // Mobile: drag-based controls, tap to rotate, no bottom panel
                var lastDragX;
                var lastDragY;
                var lastDragTime;
                var dragThreshold = BLOCK * 0.8;
                var swipeDownThreshold = 30;
                var isDragging = false;

                this.input.on('pointerdown', function (pointer) {
                    startX = pointer.x;
                    startY = pointer.y;
                    startTime = pointer.time;
                    lastDragX = pointer.x;
                    lastDragY = pointer.y;
                    lastDragTime = pointer.time;
                    isDragging = false;
                });

                this.input.on('pointermove', function (pointer) {
                    if (self.gameOver || self.paused) return;

                    // Horizontal: move piece based on drag distance
                    var dx = pointer.x - lastDragX;
                    while (dx > dragThreshold) {
                        self.moveRight();
                        lastDragX += dragThreshold;
                        dx -= dragThreshold;
                        isDragging = true;
                    }
                    while (dx < -dragThreshold) {
                        self.moveLeft();
                        lastDragX -= dragThreshold;
                        dx += dragThreshold;
                        isDragging = true;
                    }

                    // Vertical: if dragging down, enable soft drop with speed based on drag velocity
                    var dy = pointer.y - startY;
                    if (dy > swipeDownThreshold) {
                        self.softDrop = true;
                        isDragging = true;
                        var dragDy = pointer.y - lastDragY;
                        var dragDt = pointer.time - lastDragTime;
                        if (dragDt > 0 && dragDy > 0) {
                            // velocity in px/ms; slow ~0.05, fast ~2+; maps to interval 50ms→15ms
                            var velocity = dragDy / dragDt;
                            self.softDropInterval = Math.max(15, Math.floor(SOFT_DROP_INTERVAL / (1 + velocity * 2)));
                        }
                    } else {
                        self.softDrop = false;
                        self.softDropInterval = SOFT_DROP_INTERVAL;
                    }
                    lastDragY = pointer.y;
                    lastDragTime = pointer.time;
                });

                this.input.on('pointerup', function (pointer) {
                    self.softDrop = false;
                    self.softDropInterval = SOFT_DROP_INTERVAL;

                    if (self.gameOver) {
                        var dx = pointer.x - startX;
                        var dy = pointer.y - startY;
                        var dt = pointer.time - startTime;
                        if (Math.abs(dx) < tapThreshold && Math.abs(dy) < tapThreshold && dt < 300) {
                            self.resetGame();
                            self.drawBoard();
                            self.drawUI();
                        }
                        return;
                    }
                    if (self.paused) return;

                    var dx = pointer.x - startX;
                    var dy = pointer.y - startY;
                    var dt = pointer.time - startTime;
                    var absDx = Math.abs(dx);
                    var absDy = Math.abs(dy);

                    // Tap → rotate or hold (only if we didn't drag)
                    if (!isDragging && absDx < tapThreshold && absDy < tapThreshold && dt < 300) {
                        if (self.holdBoxBounds &&
                            pointer.x >= self.holdBoxBounds.x && pointer.x <= self.holdBoxBounds.x + self.holdBoxBounds.w &&
                            pointer.y >= self.holdBoxBounds.y && pointer.y <= self.holdBoxBounds.y + self.holdBoxBounds.h) {
                            self.holdCurrentPiece();
                        } else {
                            self.rotatePiece(1);
                        }
                    }
                });
            } else {
                // Desktop: on-screen buttons + swipe detection
                var swipeThreshold = 30;
                var btnH = Math.floor(this.scale.height * 0.18);
                var btnY = this.scale.height - btnH;
                var W = this.scale.width;

                // Touch buttons layout (bottom strip):
                //  [←] [↻] [↓] [⤓] [→]
                this.touchBtns = [];
                var labels = ['←', '↻', '↓', '⤓', '→'];
                var actions = ['left', 'rotate', 'down', 'drop', 'right'];
                var btnW = Math.floor(W / labels.length);

                for (var i = 0; i < labels.length; i++) {
                    this.touchBtns.push({
                        x: btnW * i,
                        y: btnY,
                        w: btnW,
                        h: btnH,
                        label: labels[i],
                        action: actions[i]
                    });
                }

                this.input.on('pointerdown', function (pointer) {
                    startX = pointer.x;
                    startY = pointer.y;
                    startTime = pointer.time;

                    // Check hold box tap
                    if (self.holdBoxBounds && !self.gameOver && !self.paused &&
                        pointer.x >= self.holdBoxBounds.x && pointer.x <= self.holdBoxBounds.x + self.holdBoxBounds.w &&
                        pointer.y >= self.holdBoxBounds.y && pointer.y <= self.holdBoxBounds.y + self.holdBoxBounds.h) {
                        self.holdCurrentPiece();
                        return;
                    }

                    // Check touch buttons
                    if (pointer.y >= btnY) {
                        for (var b = 0; b < self.touchBtns.length; b++) {
                            var btn = self.touchBtns[b];
                            if (pointer.x >= btn.x && pointer.x < btn.x + btn.w) {
                                self.handleButtonAction(btn.action);
                                return;
                            }
                        }
                    }
                });

                this.input.on('pointerup', function (pointer) {
                    if (self.gameOver || self.paused) return;
                    if (pointer.y >= btnY) {
                        self.softDrop = false;
                        return;
                    }

                    var dx = pointer.x - startX;
                    var dy = pointer.y - startY;
                    var dt = pointer.time - startTime;
                    var absDx = Math.abs(dx);
                    var absDy = Math.abs(dy);

                    if (absDx < tapThreshold && absDy < tapThreshold && dt < 300) {
                        // Tap → rotate
                        self.rotatePiece(1);
                    } else if (absDx > absDy && absDx > swipeThreshold) {
                        if (dx < 0) self.moveLeft();
                        else self.moveRight();
                    } else if (absDy > swipeThreshold) {
                        if (dy > 0) self.hardDrop();
                    }
                });
            }
        },

        handleButtonAction: function (action) {
            if (this.gameOver) {
                if (action === 'rotate') {
                    this.resetGame();
                    this.drawBoard();
                    this.drawUI();
                }
                return;
            }
            if (this.paused) return;

            switch (action) {
                case 'left': this.moveLeft(); break;
                case 'right': this.moveRight(); break;
                case 'rotate': this.rotatePiece(1); break;
                case 'down': this.softDrop = true; break;
                case 'drop': this.hardDrop(); break;
            }
        },

        // ── Update ──
        update: function (_time, delta) {
            if (this.gameOver || this.paused) {
                this.drawEverything();
                return;
            }

            var interval = this.softDrop ? (this.softDropInterval || SOFT_DROP_INTERVAL) : this.dropInterval;
            this.dropTimer += delta;

            if (this.dropTimer >= interval) {
                this.dropTimer = 0;
                if (!this.moveDown()) {
                    // Piece has landed
                    if (this.moved) {
                        this.lockDelay = 0;
                        this.moved = false;
                    }
                    this.lockDelay += interval;
                    if (this.lockDelay >= this.lockLimit) {
                        this.lockPiece();
                    }
                } else {
                    this.lockDelay = 0;
                    if (this.softDrop) this.score += SOFT_DROP_SCORE_PER_ROW;
                }
            }

            this.drawEverything();
        },

        // ── Drawing ──
        drawEverything: function () {
            this.drawBoard();
            this.drawGhost();
            this.drawPiece();
            this.drawUI();
        },

        drawBoard: function () {
            var g = this.boardGfx;
            g.clear();

            // Background
            g.fillStyle(0x000000, 1);
            g.fillRect(BOARD_X, BOARD_Y, BLOCK * COLS, BLOCK * ROWS);

            // Grid lines
            g.lineStyle(1, 0x222222, 0.6);
            for (var c = 0; c <= COLS; c++) {
                g.lineBetween(BOARD_X + c * BLOCK, BOARD_Y,
                              BOARD_X + c * BLOCK, BOARD_Y + ROWS * BLOCK);
            }
            for (var r = 0; r <= ROWS; r++) {
                g.lineBetween(BOARD_X, BOARD_Y + r * BLOCK,
                              BOARD_X + COLS * BLOCK, BOARD_Y + r * BLOCK);
            }

            // Locked blocks
            for (var row = 0; row < ROWS; row++) {
                for (var col = 0; col < COLS; col++) {
                    if (this.grid[row][col] !== 0) {
                        this.drawBlock(g, col, row, this.grid[row][col], 1);
                    }
                }
            }

            // Border
            g.lineStyle(2, 0x666666, 1);
            g.strokeRect(BOARD_X, BOARD_Y, BLOCK * COLS, BLOCK * ROWS);
        },

        drawBlock: function (g, col, row, color, alpha) {
            var x = BOARD_X + col * BLOCK;
            var y = BOARD_Y + row * BLOCK;
            var pad = 1;
            g.fillStyle(color, alpha);
            g.fillRect(x + pad, y + pad, BLOCK - pad * 2, BLOCK - pad * 2);
            // Highlight edge
            g.fillStyle(0xffffff, 0.18 * alpha);
            g.fillRect(x + pad, y + pad, BLOCK - pad * 2, 2);
            g.fillRect(x + pad, y + pad, 2, BLOCK - pad * 2);
        },

        drawGhost: function () {
            var g = this.ghostGfx;
            g.clear();
            if (this.gameOver) return;

            var gy = this.ghostY();
            if (gy === this.py) return;

            var c = this.cells();
            var color = COLORS[this.current];
            for (var i = 0; i < c.length; i++) {
                var x = BOARD_X + (this.px + c[i][0]) * BLOCK;
                var y = BOARD_Y + (gy + c[i][1]) * BLOCK;
                g.lineStyle(1, color, 0.35);
                g.strokeRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4);
            }
        },

        drawPiece: function () {
            var g = this.pieceGfx;
            g.clear();
            if (this.gameOver) return;

            var c = this.cells();
            var color = COLORS[this.current];
            for (var i = 0; i < c.length; i++) {
                this.drawBlock(g, this.px + c[i][0], this.py + c[i][1], color, 1);
            }
        },

        drawUI: function () {
            var g = this.uiGfx;
            g.clear();

            var W = this.scale.width;
            var H = this.scale.height;
            var sx = this.sideX;
            var sy = this.sideY;
            var fontSize = Math.max(12, Math.floor(BLOCK * 0.7));

            // On mobile, use smaller font for compact overlay
            if (this.isMobile) {
                fontSize = Math.max(10, Math.floor(BLOCK * 0.45));
            }

            // ── Destroy old text objects ──
            if (this._uiTexts) {
                for (var t = 0; t < this._uiTexts.length; t++) {
                    this._uiTexts[t].destroy();
                }
            }
            this._uiTexts = [];

            var textStyle = {
                fontFamily: 'monospace',
                fontSize: fontSize + 'px',
                color: '#ffffff'
            };
            var labelStyle = {
                fontFamily: 'monospace',
                fontSize: Math.floor(fontSize * 0.85) + 'px',
                color: '#aaaaaa'
            };

            // On mobile, draw semi-transparent background behind sidebar overlay
            if (this.isMobile) {
                var bgH = fontSize * 16 + Math.floor(BLOCK * 0.65) * 2 + 16;
                g.fillStyle(0x000000, 0.55);
                g.fillRect(sx - 4, sy - 2, W - sx + 4, bgH);
            }

            // Score
            this._uiTexts.push(this.add.text(sx, sy, 'SCORE', labelStyle));
            this._uiTexts.push(this.add.text(sx, sy + fontSize, '' + this.score, textStyle));

            // Level
            this._uiTexts.push(this.add.text(sx, sy + fontSize * 3, 'LEVEL', labelStyle));
            this._uiTexts.push(this.add.text(sx, sy + fontSize * 4, '' + this.level, textStyle));

            // Lines
            this._uiTexts.push(this.add.text(sx, sy + fontSize * 6, 'LINES', labelStyle));
            this._uiTexts.push(this.add.text(sx, sy + fontSize * 7, '' + this.lines, textStyle));

            // Next piece
            this._uiTexts.push(this.add.text(sx, sy + fontSize * 9, 'NEXT', labelStyle));
            this.drawNextPiece(g, sx, sy + fontSize * 10.5);

            // Hold piece
            var holdY = sy + fontSize * 14;
            this._uiTexts.push(this.add.text(sx, holdY, 'HOLD', labelStyle));
            // Draw hold box background
            var holdBoxS = Math.floor(BLOCK * 0.65);
            var holdBoxW = holdBoxS * 4 + 4;
            var holdBoxH = holdBoxS * 2 + 4;
            var holdBoxX = sx;
            var holdBoxY = holdY + fontSize * 1.5;
            this.holdBoxBounds = { x: holdBoxX - 2, y: holdBoxY - 2, w: holdBoxW + 4, h: holdBoxH + 4 };
            g.lineStyle(1, 0x444444, 0.5);
            g.strokeRect(holdBoxX - 2, holdBoxY - 2, holdBoxW + 4, holdBoxH + 4);
            if (this.holdPiece) {
                this.drawPreviewPiece(g, this.holdPiece, holdBoxX, holdBoxY, this.holdUsed ? 0.4 : 1);
            }

            // Version
            var versionStyle = {
                fontFamily: 'monospace',
                fontSize: Math.floor(fontSize * 0.7) + 'px',
                color: '#666666'
            };
            var versionText = this.add.text(W - 4, 4, 'v7', versionStyle).setOrigin(1, 0);
            this._uiTexts.push(versionText);

            // Touch buttons
            if (this.touchBtns) {
                var btnFontSize = Math.max(18, Math.floor(this.touchBtns[0].h * 0.45));
                for (var b = 0; b < this.touchBtns.length; b++) {
                    var btn = this.touchBtns[b];
                    g.fillStyle(0x222222, 0.85);
                    g.fillRect(btn.x, btn.y, btn.w, btn.h);
                    g.lineStyle(1, 0x444444, 1);
                    g.strokeRect(btn.x, btn.y, btn.w, btn.h);

                    var txt = this.add.text(
                        btn.x + btn.w / 2,
                        btn.y + btn.h / 2,
                        btn.label,
                        {
                            fontFamily: 'monospace',
                            fontSize: btnFontSize + 'px',
                            color: '#cccccc'
                        }
                    ).setOrigin(0.5);
                    this._uiTexts.push(txt);
                }
            }

            // Game over overlay
            if (this.gameOver) {
                g.fillStyle(0x000000, 0.7);
                g.fillRect(0, 0, W, H);

                var goStyle = {
                    fontFamily: 'monospace',
                    fontSize: Math.floor(fontSize * 2) + 'px',
                    color: '#ff4444',
                    align: 'center'
                };
                var t1 = this.add.text(W / 2, H / 2 - fontSize * 2, 'GAME OVER', goStyle).setOrigin(0.5);
                var t2 = this.add.text(W / 2, H / 2, 'Score: ' + this.score, textStyle).setOrigin(0.5);
                var restartStyle = {
                    fontFamily: 'monospace',
                    fontSize: Math.floor(fontSize * 0.9) + 'px',
                    color: '#88ff88',
                    align: 'center'
                };
                var restartMsg = this.isMobile ? 'Tap to restart' : 'Press R or tap \u21bb to restart';
                var t3 = this.add.text(W / 2, H / 2 + fontSize * 2.5, restartMsg, restartStyle).setOrigin(0.5);
                this._uiTexts.push(t1, t2, t3);
            }

            // Paused overlay
            if (this.paused && !this.gameOver) {
                g.fillStyle(0x000000, 0.6);
                g.fillRect(0, 0, W, H);
                var pStyle = {
                    fontFamily: 'monospace',
                    fontSize: Math.floor(fontSize * 2) + 'px',
                    color: '#ffff00',
                    align: 'center'
                };
                var tp = this.add.text(W / 2, H / 2, 'PAUSED', pStyle).setOrigin(0.5);
                this._uiTexts.push(tp);
            }
        },

        drawNextPiece: function (g, ox, oy) {
            this.drawPreviewPiece(g, this.nextPiece, ox, oy, 1);
        },

        drawPreviewPiece: function (g, pieceName, ox, oy, alpha) {
            var cells = ROTATIONS[pieceName][0];
            var color = COLORS[pieceName];
            var s = Math.floor(BLOCK * 0.65);
            var pad = 1;

            for (var i = 0; i < cells.length; i++) {
                var x = ox + cells[i][0] * s;
                var y = oy + cells[i][1] * s;
                g.fillStyle(color, alpha);
                g.fillRect(x + pad, y + pad, s - pad * 2, s - pad * 2);
            }
        }
    });

    // ── Boot ──
    var config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        backgroundColor: '#111111',
        scale: {
            mode: Phaser.Scale.RESIZE,
            width: '100%',
            height: '100%'
        },
        scene: [GameScene],
        input: {
            touch: true
        },
        banner: false
    };

    new Phaser.Game(config);
})();
